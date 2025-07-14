import React, { Component, ReactNode } from 'react';
import chat from '../../../stores/chat';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  errorCount: number;
}

class ChatErrorBoundary extends Component<Props, State> {
  private errorResetTimeout: any = null;
  private readonly maxErrors = 5;
  private readonly resetDelay = 30000; // 30 seconds

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorMessage: '',
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      errorMessage: error.message,
      errorCount: 0 // This will be updated in componentDidCatch
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error:', error, errorInfo);
    
    // Increment error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));

    // If too many errors, force refresh
    if (this.state.errorCount >= this.maxErrors) {
      console.error('Too many chat errors, forcing page refresh');
      window.location.reload();
      return;
    }

    // Attempt automatic recovery
    this.attemptRecovery();

    // Set timeout to reset error state
    if (this.errorResetTimeout) {
      clearTimeout(this.errorResetTimeout);
    }
    
    this.errorResetTimeout = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        errorMessage: '',
        errorCount: 0 
      });
    }, this.resetDelay);
  }

  componentWillUnmount() {
    if (this.errorResetTimeout) {
      clearTimeout(this.errorResetTimeout);
    }
  }

  private attemptRecovery = () => {
    try {
      // Clear chat state
      chat.clearChat();
      
      // Reset processed message keys
      chat.processedMessageKeys.clear();
      
      // Clear message keys
      chat.clearMessageKeys();
      
      console.log('Chat recovery attempted');
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    }
  };

  private handleManualRetry = () => {
    this.setState({ 
      hasError: false, 
      errorMessage: '',
      errorCount: 0 
    });
    this.attemptRecovery();
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="chat-error-boundary">
          <div className="error-message">
            <h3>Chat Temporarily Unavailable</h3>
            <p>Something went wrong with the chat system.</p>
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.errorMessage}</pre>
            </details>
            <div className="error-actions">
              <button 
                className="retry-button"
                onClick={this.handleManualRetry}
              >
                Try Again
              </button>
              <button 
                className="refresh-button"
                onClick={this.handleRefresh}
              >
                Refresh Page
              </button>
            </div>
            <p className="error-info">
              Error count: {this.state.errorCount}/{this.maxErrors}
              {this.state.errorCount < this.maxErrors && (
                <span> • Auto-retry in {this.resetDelay / 1000} seconds</span>
              )}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;