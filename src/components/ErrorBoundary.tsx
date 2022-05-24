import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Container, Alert } from '@mantine/core';

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
        <Container p="md">
          <Alert
            color="red"
            icon={<FaExclamationCircle />}
            title="Whoops! Something went wrong."
          >
            Your game may have crashed or Alex may have "accidentally" deleted your game in the database. Try refreshing the page and see what happens.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;