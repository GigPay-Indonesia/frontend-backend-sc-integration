import React from 'react';

export class OnchainKitErrorBoundary extends React.Component<
  {
    onError: (error: unknown) => void;
    fallback: React.ReactNode;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  state: { hasError: boolean } = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    try {
      this.props.onError(error);
    } catch {
      // ignore secondary failures
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
