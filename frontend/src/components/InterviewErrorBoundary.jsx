import { Component } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

class InterviewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Interview page crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="bg-base-100 border border-base-300 rounded-lg p-7 max-w-md w-full text-center">
          <AlertTriangleIcon className="size-10 text-error mx-auto" />
          <h1 className="text-2xl font-black mt-4">Interview needs to reconnect</h1>
          <p className="text-base-content/60 mt-2">Your interview data is saved. Reconnect to restore the live call and workspace.</p>
          <button className="btn btn-primary w-full gap-2 mt-6" onClick={() => window.location.reload()}><RefreshCwIcon className="size-4" /> Reconnect</button>
        </div>
      </div>
    );
  }
}

export default InterviewErrorBoundary;
