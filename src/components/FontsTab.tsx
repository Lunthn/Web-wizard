import { Card, Typography, Tag, Space } from "antd";
import React from "react";

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

const FontDetails: React.FC<{ label: string; items: string[] }> = ({
  label,
  items,
}) => (
  <div style={{ marginBottom: 8 }}>
    <Text type="secondary" style={{ display: "block" }}>
      {label}:
    </Text>
    <Space size={[0, 4]} wrap>
      {items.map((item, index) => (
        <Tag key={index} color="default">
          {item}
        </Tag>
      ))}
    </Space>
  </div>
);

const FontsTab: React.FC<FontsTabProps> = ({ fontData }) => (
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
              <FontDetails label="Weights" items={font.weight} />
              <FontDetails label="Sizes" items={font.sizes} />
              <FontDetails label="Used in" items={font.elements} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default FontsTab;
