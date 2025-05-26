import { Card, Typography, Tag, Space, Button } from "antd";
import React, { useState, useEffect } from "react";
import { CloseOutlined, DownOutlined, LeftOutlined } from "@ant-design/icons";
import { getHighlightColor } from "../services/storageService";
import { DEFAULTS } from "../services/storageService";
import { Tooltip } from "antd";
import { FaHighlighter } from "react-icons/fa6";

const { Text } = Typography;

interface FontItem {
  name: string;
  usage: string;
  weight: string[];
  sizes: string[];
  elements: string[];
}

interface FontsTabProps {
  fontData: FontItem[];
}

const highlightFont = async (font: string) => {
  const storedHighlightColor = await getHighlightColor();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "highlightFont",
        font,
        highlightColor: storedHighlightColor || DEFAULTS.HIGHLIGHT_COLOR,
      });
    }
  });
};

const removeHighlight = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "removeHighlight" });
    }
  });
};

const FontDetails: React.FC<{
  label: string;
  items: string[];
  isVisible: boolean;
  onToggle: () => void;
}> = ({ label, items, isVisible, onToggle }) => (
  <div style={{ marginBottom: 8 }}>
    <Space
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Text type="secondary" style={{ display: "block" }}>
        {label}:
      </Text>
      <Button
        size="small"
        type="link"
        style={{ padding: 0, marginLeft: 4 }}
        onClick={onToggle}
        aria-label={
          isVisible
            ? `Hide ${label.toLowerCase()}`
            : `Show ${label.toLowerCase()}`
        }
      >
        {isVisible ? <DownOutlined /> : <LeftOutlined />}
      </Button>
    </Space>
    {isVisible && (
      <Space size={[0, 4]} wrap style={{ marginTop: 4 }}>
        {items.map((item, index) => (
          <Tag key={index} color="default">
            {item}
          </Tag>
        ))}
      </Space>
    )}
  </div>
);

const FontsTab: React.FC<FontsTabProps> = ({ fontData }) => {
  const [highlightButtonColor, setHighlightButtonColor] =
    useState<string>("transparent");
  const [highlightedFont, setHighlightedFont] = useState<string | null>(null);
  const [elementsOpen, setElementsOpen] = useState<
    Record<number, { weights: boolean; sizes: boolean; elements: boolean }>
  >({});

  useEffect(() => {
    getHighlightColor().then((color) => {
      setHighlightButtonColor(color || "transparent");
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "highlightColor" || event.key === "resetSettings") {
        getHighlightColor().then((color) => {
          setHighlightButtonColor(color || DEFAULTS.HIGHLIGHT_COLOR);
        });
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setElementsOpen((prev) => {
      const newState = { ...prev };
      fontData.forEach((_, idx) => {
        if (!prev[idx]) {
          newState[idx] = {
            weights: false,
            sizes: false,
            elements: false,
          };
        }
      });
      return newState;
    });
  }, [fontData]);

  const toggleSection = (
    fontIndex: number,
    section: "weights" | "sizes" | "elements"
  ) => {
    setElementsOpen((prev) => ({
      ...prev,
      [fontIndex]: {
        ...prev[fontIndex],
        [section]: !prev[fontIndex]?.[section],
      },
    }));
  };

  return (
    <div style={{ overflowX: "hidden" }}>
      <div style={{ maxHeight: 384, overflowY: "auto" }}>
        {fontData.map((font, index) => (
          <Card
            key={index}
            size="small"
            style={{
              marginBottom: 16,
              backgroundColor: "#f0f0f0",
            }}
            bodyStyle={{ padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <Text type="secondary" style={{ display: "block" }}>
                  {font.usage}
                </Text>
                <Text strong style={{ fontSize: "18px" }}>
                  {font.name}
                </Text>
              </div>
              {/* Highlight/Remove button */}
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <Space style={{ marginTop: 4, display: "flex", gap: 8 }}>
                  {highlightedFont === font.name ? (
                    <Tooltip title="Remove highlight" placement="top">
                      <Button
                        danger
                        style={{
                          fontSize: 14,
                          padding: "6px 12px",
                          outline: "none",
                          boxShadow: "none",
                        }}
                        onClick={() => {
                          removeHighlight();
                          setHighlightedFont(null);
                        }}
                        icon={<CloseOutlined />}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Highlight font" placement="top">
                      <Button
                        style={{
                          fontSize: 14,
                          padding: "6px 12px",
                          outline: "none",
                          boxShadow: "none",
                          borderRight: `2px solid ${highlightButtonColor}`,
                        }}
                        type="default"
                        onClick={() => {
                          highlightFont(font.name);
                          setHighlightedFont(font.name);
                        }}
                        icon={<FaHighlighter />}
                      />
                    </Tooltip>
                  )}
                </Space>
              </div>
            </div>
            <FontDetails
              label="Weights"
              items={font.weight}
              isVisible={elementsOpen[index]?.weights || false}
              onToggle={() => toggleSection(index, "weights")}
            />
            <FontDetails
              label="Sizes"
              items={font.sizes}
              isVisible={elementsOpen[index]?.sizes || false}
              onToggle={() => toggleSection(index, "sizes")}
            />
            <FontDetails
              label="Elements"
              items={font.elements}
              isVisible={elementsOpen[index]?.elements || false}
              onToggle={() => toggleSection(index, "elements")}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FontsTab;
