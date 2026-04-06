import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class VisibleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[FATAL ERROR]", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      const e = this.state.error;
      const msg = e?.message || String(e);
      const stack = e?.stack?.split("\n").slice(0,8).join("\n") || "";
      const comp = this.state.info?.componentStack?.split("\n").slice(0,6).join("\n") || "";
      return (
        <div style={{position:"fixed",inset:0,background:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32,fontFamily:"monospace",direction:"ltr",zIndex:99999}}>
          <div style={{fontSize:32}}>Warning</div>
          <div style={{fontSize:18,fontWeight:"bold",color:"#dc2626"}}>React Error</div>
          <pre style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,padding:16,maxWidth:800,overflow:"auto",fontSize:12,color:"#7f1d1d"}}>{msg}</pre>
          <pre style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:16,maxWidth:800,overflow:"auto",fontSize:11,color:"#475569"}}>{stack}</pre>
          <pre style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:16,maxWidth:800,overflow:"auto",fontSize:11,color:"#166534"}}>{comp}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <VisibleErrorBoundary>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </VisibleErrorBoundary>
  );
} else {
  document.body.innerHTML = "<div style=color:red>ERROR: root not found</div>";
}
