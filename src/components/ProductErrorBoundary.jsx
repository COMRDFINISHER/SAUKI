import { Component } from "react";

export default class ProductErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Product card failed to render:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: "#fff", border: "1px solid #E5E3DA", borderRadius: 10,
          padding: 16, fontSize: 12, color: "#888780", textAlign: "center",
        }}>
          This product couldn't be displayed.
        </div>
      );
    }
    return this.props.children;
  }
}
