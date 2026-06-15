"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[400px] items-center justify-center p-8">
            <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:bg-red-950 dark:border-red-800">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Une erreur est survenue
              </h2>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {this.state.error?.message}
              </p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
