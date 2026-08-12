import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-100 shadow-sm m-4">
          <Result
            status="error"
            title="Đã xảy ra lỗi khi tải giao diện"
            subTitle={this.state.error?.message || "Vui lòng bấm thử lại để làm mới dữ liệu."}
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
              >
                Thử lại
              </Button>,
              <Button
                key="reload"
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
