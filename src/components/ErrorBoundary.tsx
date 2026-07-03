import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="p-4 rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-6 p-4 bg-muted rounded-lg text-left text-xs overflow-auto max-w-full">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
