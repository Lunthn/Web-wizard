import { Card, Tag, Typography, Space, Button, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    getFormat().then((savedFormat: string) => {
      setFormat(savedFormat || DEFAULTS.FORMAT);
    });
    getHideNotes().then((savedHideNotes) => {
      setHideNotesState(savedHideNotes ?? DEFAULTS.HIDE_NOTES);
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
          highlightColor: storedHighlightColor || "yellow",
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
                      icon={<FaHighlighter />}
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
        {colorData.map((color, index) => renderColorCard(color, index))}
      </div>
    </div>
  );
};

export default ColorsTab;
