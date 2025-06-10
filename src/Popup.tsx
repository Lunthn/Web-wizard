import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Tabs,
  Spin,
  Typography,
  ConfigProvider,
  theme,
  Button,
  Badge,
} from "antd";
import { HiOutlineRefresh } from "react-icons/hi";

import ColorsTab from "./components/ColorsTab";
import FontsTab from "./components/FontsTab";
import SettingsTab from "./components/SettingsTab";
import { getTheme } from "./services/storageService";
import { MANIFEST_DATA } from "./data/index";

type TabData = {
  colors: { color: string; name: string; count: number }[];
  fonts: {
    name: string;
    usage: string;
    weight: string[];
    sizes: string[];
    elements: string[];
    count: number;
  }[];
  url: string;
  title: string;
  favicon?: string;
};

const { Title, Text } = Typography;
const { defaultAlgorithm, darkAlgorithm } = theme;

let backgroundPort: any = null;

const Popup = () => {
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [data, setData] = useState<TabData>({
    colors: [],
    fonts: [],
    url: "",
    title: "",
    favicon: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      backgroundPort = chrome.runtime.connect({ name: "popup" });

      backgroundPort.onDisconnect.addListener(() => {
        backgroundPort = null;
      });
    } catch (error) {
      console.error("Error:", error);
    }

    return () => {
      if (backgroundPort) {
        backgroundPort.disconnect();
        backgroundPort = null;
      }
    };
  }, []);

  useEffect(() => {
    getTheme()
      .then((savedTheme) => setIsDarkMode(savedTheme === "dark"))
      .catch((err) => console.error("Error loading theme:", err));
  }, []);

  useEffect(() => {
    analyzeCurrentPage();
  }, []);

  const analyzeCurrentPage = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("Cannot access this page");
      await injectContentScript(tab.id);
      const result = await retryAnalyze(tab.id, 3);
      if (
        !result ||
        !Array.isArray(result.colors) ||
        !Array.isArray(result.fonts)
      ) {
        throw new Error("Invalid response from content script");
      }
      setData({
        colors: result.colors,
        fonts: result.fonts,
        url: result.url || "",
        title: result.title || "",
        favicon: result.favicon || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error analyzing page:", err);
      setError(
        "Could not analyze this page. Make sure you're on a compatible webpage and try refreshing."
      );
      setLoading(false);
    }
  };

  const injectContentScript = async (tabId: number) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
      });
    } catch (err) {
      console.error("error:", err);
    }
  };

  const retryAnalyze = async (tabId: number, maxRetries: number) => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await Promise.race([
          chrome.tabs.sendMessage(tabId, { action: "analyze" }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          ),
        ]);
      } catch (err) {
        console.warn(`Attempt ${retries + 1} failed:`, err);
        retries++;
        if (retries >= maxRetries)
          throw new Error("could not communicate with the page");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    await analyzeCurrentPage();
  };

  const renderLoadingOrError = (message: string) => (
    <div className="loading-container">
      {loading ? (
        <>
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>{message}</Text>
        </>
      ) : (
        <>
          <Text type="danger" style={{ marginBottom: 5 }}>
            {error}
          </Text>
          <Button
            type="primary"
            onClick={handleRetry}
            style={{ width: "100%" }}
          >
            Retry
          </Button>
        </>
      )}
    </div>
  );

  const renderColorsTab = () =>
    loading || error ? (
      renderLoadingOrError("Analyzing colors...")
    ) : (
      <ColorsTab colorData={data.colors} />
    );

  const renderFontsTab = () =>
    loading || error ? (
      renderLoadingOrError("Analyzing fonts...")
    ) : (
      <FontsTab fontData={data.fonts} />
    );

  const handleTabChange = (key: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "setActiveTab",
          tab: key,
        });
      }
    });
  };

  return (
    <ConfigProvider
      theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}
    >
      <div className={isDarkMode ? "dark-mode" : ""}>
        <div style={{ padding: 12, overflowX: "hidden" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title
              level={4}
              style={{ margin: "8px 0", display: "flex", alignItems: "center" }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 128 128"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="128" height="128" rx="24" fill="#1677ff" />
                  <path
                    d="M88 88L104 104"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="20"
                    stroke="white"
                    strokeWidth="8"
                  />
                </svg>
              </span>
              {MANIFEST_DATA.name}
            </Title>
            <Button
              icon={<HiOutlineRefresh />}
              style={{ boxShadow: "none", fontSize: 20 }}
              onClick={handleRetry}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {data.favicon && (
              <img
                src={data.favicon}
                alt="Favicon"
                style={{
                  width: 16,
                  height: 16,
                }}
              />
            )}
            <Text type="secondary" style={{ fontSize: 12 }}>
              {data.title || "Untitled Page"}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            {data.url || "No URL available"}
          </Text>
          <Tabs
            defaultActiveKey="colors"
            onChange={handleTabChange}
            items={[
              {
                key: "colors",
                label: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    Colors
                    {data.colors.length > 0 && (
                      <Badge
                        count={data.colors.length}
                        style={{
                          fontSize: 12,
                          height: 16,
                          lineHeight: "16px",
                          backgroundColor: "#1890ff",
                        }}
                        className="badge"
                      />
                    )}
                  </span>
                ),
                children: renderColorsTab(),
              },
              {
                key: "fonts",
                label: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    Fonts
                    {data.fonts.length > 0 && (
                      <Badge
                        count={data.fonts.length}
                        style={{
                          fontSize: 12,
                          height: 16,
                          lineHeight: "16px",
                          backgroundColor: "#1890ff",
                        }}
                        className="badge"
                      />
                    )}
                  </span>
                ),
                children: renderFontsTab(),
              },
              {
                key: "settings",
                label: "Settings",
                children: (
                  <SettingsTab
                    darkMode={isDarkMode}
                    setDarkMode={setIsDarkMode}
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
