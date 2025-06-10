import { Card, Tag, Typography, Space, Button, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
import { MdColorLens } from "react-icons/md";
import { TbColorPicker } from "react-icons/tb";
import {
  getFormat,
  getHighlightColor,
  getHideNotes,
  DEFAULTS,
} from "../services/storageService";
import { rgbToHex, rgbToHsl } from "../utils";
import {
  CheckOutlined,
  CloseOutlined,
  LeftOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { FaHighlighter } from "react-icons/fa6";
import { IoCopy } from "react-icons/io5";

const { Text } = Typography;

interface ColorItem {
  color: string;
  count: number;
  elements?: string[];
}

interface ColorsTabProps {
  colorData: ColorItem[];
}

const ColorsTab: React.FC<ColorsTabProps> = ({ colorData }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [highlightedColor, setHighlightedColor] = useState<string | null>(null);
  const [format, setFormat] = useState<string>(DEFAULTS.FORMAT);
  const [hideNotes, setHideNotesState] = useState<boolean>(DEFAULTS.HIDE_NOTES);
  const [elementsOpen, setElementsOpen] = useState<Record<number, boolean>>({});
  const [highlightButtonColor, setHighlightButtonColor] =
    useState<string>("transparent");
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [pickedColor, setPickedColor] = useState<string | null>(null);

  useEffect(() => {
    getFormat().then((savedFormat: string) => {
      setFormat(savedFormat || DEFAULTS.FORMAT);
    });
    getHideNotes().then((savedHideNotes) => {
      setHideNotesState(savedHideNotes ?? DEFAULTS.HIDE_NOTES);
    });
    getHighlightColor().then((color) => {
      setHighlightButtonColor(color || "transparent");
    });

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "hideNotes" || event.key === "resetSettings") {
        getHideNotes().then((savedHideNotes) => {
          setHideNotesState(savedHideNotes ?? DEFAULTS.HIDE_NOTES);
        });
      }
      if (event.key === "format" || event.key === "resetSettings") {
        getFormat().then((savedFormat: string) => {
          setFormat(savedFormat || DEFAULTS.FORMAT);
        });
      }
      if (event.key === "highlightColor" || event.key === "resetSettings") {
        getHighlightColor().then((color) => {
          setHighlightButtonColor(color || DEFAULTS.HIGHLIGHT_COLOR);
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    setElementsOpen((prev) => {
      const newState: Record<number, boolean> = { ...prev };
      colorData.forEach((_, idx) => {
        if (prev[idx] === undefined) {
          newState[idx] = false;
        }
      });
      return newState;
    });
  }, [colorData]);

  const formatColor = (rgb: string): string => {
    switch (format) {
      case "hex":
        return rgbToHex(rgb) || rgb;
      case "hsl":
        return rgbToHsl(rgb) || rgb;
      case "rgb":
      default:
        return rgb;
    }
  };

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    });
  };

  const highlightColor = async (color: string) => {
    const storedHighlightColor = await getHighlightColor();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "highlightColor",
          color,
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

  const toggleElements = (index: number) => {
    setElementsOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleColorPicker = async () => {
    if ("EyeDropper" in window) {
      try {
        setIsPickerActive(true);
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        setPickedColor(result.sRGBHex);
      } catch (error) {
        console.error("Color picking was cancelled or failed:", error);
      } finally {
        setIsPickerActive(false);
      }
    } else {
      alert(
        "Color picker not supported in this browser. Please use Chrome 95+ or Edge 95+"
      );
    }
  };

  const renderColorCard = (color: ColorItem, index: number) => {
    const formattedColor = formatColor(color.color);
    const showElements = elementsOpen[index];

    return (
      <Card
        key={index}
        size="small"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: 12 }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 50,
                height: 50,
                borderRadius: 6,
                marginRight: 12,
                backgroundColor: color.color,
                border: "1px solid #ddd",
              }}
            />
            <div>
              <Text type="secondary" style={{ display: "block" }}>
                {color.count} element{color.count !== 1 ? "s" : ""}
              </Text>
              <Text strong style={{ fontSize: "18px" }}>
                {formattedColor}
              </Text>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <Space style={{ marginTop: 4, display: "flex", gap: 8 }}>
                <Tooltip title="Copy color" placement="top">
                  <Button
                    style={{
                      fontSize: 14,
                      padding: "6px 12px",
                      outline: "none",
                      boxShadow: "none",
                    }}
                    type={
                      copiedColor === formattedColor ? "primary" : "default"
                    }
                    onClick={() => handleCopy(formattedColor)}
                    icon={
                      copiedColor === formattedColor ? (
                        <CheckOutlined />
                      ) : (
                        <IoCopy />
                      )
                    }
                  />
                </Tooltip>
                {highlightedColor === color.color ? (
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
                        setHighlightedColor(null);
                      }}
                      icon={<CloseOutlined />}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Highlight color" placement="top">
                    <Button
                      style={{
                        fontSize: 14,
                        padding: "6px 12px",
                        outline: "none",
                        boxShadow: "none",
                      }}
                      type="default"
                      onClick={() => {
                        highlightColor(color.color);
                        setHighlightedColor(color.color);
                      }}
                      icon={
                        <FaHighlighter
                          style={{
                            color: highlightButtonColor,
                          }}
                        />
                      }
                    />
                  </Tooltip>
                )}
              </Space>
            </div>
          </div>
          <div>
            <Space style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                Elements:
              </Text>
              <Button
                size="small"
                type="link"
                style={{ padding: 0, marginLeft: 4 }}
                onClick={() => toggleElements(index)}
                aria-label={showElements ? "Hide elements" : "Show elements"}
              >
                {showElements ? <DownOutlined /> : <LeftOutlined />}
              </Button>
            </Space>
            {showElements && (
              <Space size={[0, 4]} wrap style={{ marginTop: 4 }}>
                {color.elements?.map((element, i) => (
                  <Tag key={i} color="default">
                    {element}
                  </Tag>
                ))}
              </Space>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ maxHeight: 384, overflowY: "auto" }}>
        {!hideNotes && (
          <Text
            type="secondary"
            style={{ marginBottom: 16, display: "block" }}
            className="note"
          >
            Note: Highlighting might sometimes not work properly on all elements
            due to page structure or styles.
          </Text>
        )}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            border: "1px solid #ddd",
            background: "#fff",
            borderRadius: 6,
            boxShadow: "none",
          }}
          bodyStyle={{
            padding: 12,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 6,
                background: pickedColor || "transparent",
                border: "1px solid #ddd",
                marginRight: 12,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {!pickedColor && <MdColorLens />}
            </div>
            <div style={{ minWidth: 0 }}>
              <Text type="secondary" style={{ display: "block" }}>
                Color picker
              </Text>
              <Text strong style={{ fontSize: "18px", wordBreak: "break-all" }}>
                {pickedColor ? formatColor(pickedColor) : "No color picked yet"}
              </Text>
            </div>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginLeft: 16 }}
          >
            {pickedColor && (
              <Tooltip title="Copy color" placement="top">
                <Button
                  style={{
                    fontSize: 14,
                    padding: "6px 12px",
                    outline: "none",
                    boxShadow: "none",
                    marginRight: 8,
                  }}
                  type={
                    copiedColor === formatColor(pickedColor)
                      ? "primary"
                      : "default"
                  }
                  onClick={() => handleCopy(formatColor(pickedColor))}
                  icon={
                    copiedColor === formatColor(pickedColor) ? (
                      <CheckOutlined />
                    ) : (
                      <IoCopy />
                    )
                  }
                />
              </Tooltip>
            )}
            <Tooltip title="Color picker mode">
              <Button
                type={isPickerActive ? undefined : "default"}
                loading={isPickerActive}
                style={{
                  fontSize: 14,
                  padding: "6px 12px",
                  outline: "none",
                  boxShadow: "none",
                }}
                onClick={handleColorPicker}
                icon={<TbColorPicker style={{ fontSize: "22" }} />}
              />
            </Tooltip>
          </div>
        </Card>
        {colorData.map((color, index) => renderColorCard(color, index))}
      </div>
    </div>
  );
};

export default ColorsTab;
