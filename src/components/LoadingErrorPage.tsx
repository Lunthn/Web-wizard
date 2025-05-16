import React from "react";
import { Spin, Typography, Button } from "antd";

const { Text } = Typography;

interface LoadingErrorPageProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  loadingMessage: string;
  children: React.ReactNode;
}

const LoadingErrorPage: React.FC<LoadingErrorPageProps> = ({
  loading,
  error,
  onRetry,
  loadingMessage,
  children,
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>{loadingMessage}</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <Text type="danger" style={{ marginBottom: 5 }}>
          {error}
        </Text>
        <Button type="primary" onClick={onRetry} style={{ width: "100%" }}>
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingErrorPage;
