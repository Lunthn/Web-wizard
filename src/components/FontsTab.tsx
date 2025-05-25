import { Card, Typography, Tag, Space, Button } from "antd";
import React, { useState, useEffect } from "react";
import { DownOutlined, LeftOutlined } from "@ant-design/icons";

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
  const [elementsOpen, setElementsOpen] = useState<
    Record<number, { weights: boolean; sizes: boolean; elements: boolean }>
  >({});

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
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text strong style={{ fontSize: "18px" }}>
                    {font.name}
                  </Text>
                  <Text type="secondary">{font.usage}</Text>
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
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FontsTab;
