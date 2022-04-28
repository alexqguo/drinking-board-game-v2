import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Pane } from 'evergreen-ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Pane padding={16}>
          <Alert
            intent="danger"
            title="Whoops! Something went wrong."
          >
            Your game may have crashed or Alex may have deleted your game in the database by accident. Try refreshing the page and see what happens.
          </Alert>
        </Pane>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;