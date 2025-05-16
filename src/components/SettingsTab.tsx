import React, { useEffect, useState } from "react";
import { Card, Space, Switch, Typography, Select, Divider, Button } from "antd";
import { ColorPicker } from "antd";
import {
  setTheme,
  setFormat,
  getFormat,
  setHighlightColor,
  getHighlightColor,
  restoreDefaults,
  DEFAULTS,
  setHideNotes,
  getHideNotes,
} from "../services/storageService";
import { MANIFEST_DATA, SOCIAL_LINKS } from "../data/index";
import { BiCoffeeTogo } from "react-icons/bi";

const { Text } = Typography;
const { Option } = Select;

interface SettingsTabProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ darkMode, setDarkMode }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>(DEFAULTS.FORMAT);
  const [highlightColor, setHighlightColorState] = useState<string>(
    DEFAULTS.HIGHLIGHT_COLOR
  );
  const [hideNotes, setHideNotesState] = useState<boolean>(false);

  // Load saved settings on mount
  useEffect(() => {
    getFormat().then((savedFormat) =>
      setSelectedFormat(savedFormat || DEFAULTS.FORMAT)
    );
    getHighlightColor().then((savedColor) =>
      setHighlightColorState(savedColor || DEFAULTS.HIGHLIGHT_COLOR)
    );
    getHideNotes().then((saved) => setHideNotesState(saved ?? false));
  }, []);

  // Handlers
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const handleFormatChange = (value: string) => {
    setSelectedFormat(value);
    setFormat(value);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "format", newValue: value })
    );
  };

  const handleHighlightColorChange = (color: any) => {
    const hexColor = color.toHexString();
    setHighlightColorState(hexColor);
    setHighlightColor(hexColor);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "highlightColor", newValue: hexColor })
    );
  };

  const handleHideNotesToggle = (checked: boolean) => {
    setHideNotesState(checked);
    setHideNotes(checked);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "hideNotes",
        newValue: String(checked),
      })
    );
  };

  const handleResetSettings = () => {
    restoreDefaults();
    setSelectedFormat(DEFAULTS.FORMAT);
    setHighlightColorState(DEFAULTS.HIGHLIGHT_COLOR);
    setDarkMode(DEFAULTS.THEME === "dark");
    setHideNotesState(DEFAULTS.HIDE_NOTES);
    setTheme(DEFAULTS.THEME);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "reset", newValue: "true" })
    );
  };

  const DarkModeToggle = () => (
    <Space
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
        padding: "8px 0",
      }}
    >
      <Text>Dark Mode</Text>
      <Switch checked={darkMode} onChange={handleDarkModeToggle} />
    </Space>
  );

  const HighlightColorPicker = () => (
    <Space
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
        padding: "8px 0",
      }}
    >
      <Text>Highlight Color</Text>
      <ColorPicker
        value={highlightColor}
        onChange={handleHighlightColorChange}
      />
    </Space>
  );

  const ColorFormatSelector = () => (
    <Space
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 8,
        padding: "8px 0",
      }}
    >
      <Text>Color Format</Text>
      <Select value={selectedFormat} onChange={handleFormatChange}>
        <Option value="rgb">RGB</Option>
        <Option value="hex">HEX</Option>
        <Option value="hsl">HSL</Option>
      </Select>
    </Space>
  );

  const HideNotesToggle = () => (
    <Space
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
        padding: "8px 0",
      }}
    >
      <Text>Hide Notes</Text>
      <Switch checked={hideNotes} onChange={handleHideNotesToggle} />
    </Space>
  );

  const Footer = () => (
    <Space
      direction="vertical"
      style={{
        width: "100%",
        marginTop: 16,
      }}
      size="small"
    >
      <Text>
        {MANIFEST_DATA.name} v{MANIFEST_DATA.version}
      </Text>
      <Text type="secondary">{MANIFEST_DATA.description}</Text>
      <Text type="secondary">
        Found an issue? Want to contribute or just get in touch?{" "}
        <a
          href={`mailto:${SOCIAL_LINKS.MAIL}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact me
        </a>{" "}
        or{" "}
        <a
          href={SOCIAL_LINKS.GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
        >
          contribute on GitHub
        </a>
        .
      </Text>
      <Text type="secondary">Developed by {MANIFEST_DATA.author}</Text>

      <Divider style={{ margin: "12px 0" }} />

      <Space wrap>
        <Button
          style={{ boxShadow: "none" }}
          type="default"
          href={SOCIAL_LINKS.GITHUB_PROFILE}
          target="_blank"
        >
          GitHub
        </Button>
        <Button
          style={{ boxShadow: "none" }}
          type="default"
          href={SOCIAL_LINKS.LINKEDIN}
          target="_blank"
        >
          LinkedIn
        </Button>
        <Button
          style={{ boxShadow: "none" }}
          type="default"
          href={`mailto:${SOCIAL_LINKS.MAIL}`}
          target="_blank"
        >
          Email
        </Button>
        <Button
          style={{
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          type="primary"
          href={SOCIAL_LINKS.COFFE}
          target="_blank"
        >
          <BiCoffeeTogo style={{ fontSize: "20px", verticalAlign: "middle" }} />{" "}
          Buy me a coffee
        </Button>
      </Space>
    </Space>
  );

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ maxHeight: 384, overflowY: "auto" }}>
        <Card>
          <DarkModeToggle />
          <HideNotesToggle />
          <HighlightColorPicker />
          <ColorFormatSelector />
          <Text
            type="secondary"
            className="note"
            style={{ display: hideNotes ? "none" : "block" }}
          >
            Note: Some colors might not format properly if they are in
            unknown/unsupported formats.
          </Text>
          <Button
            danger
            type="default"
            onClick={handleResetSettings}
            style={{ marginTop: 16, width: "100%" }}
          >
            Reset settings
          </Button>
          <Divider style={{ margin: "16px 0" }} />
          <Footer />
        </Card>
      </div>
    </div>
  );
};

export default SettingsTab;
