import React from "react";
import { StatusBar } from "expo-status-bar";
import WebViewComponent from "./components/WebView";
import { useAllPermissions } from "./hooks/useAllPermissions";

export default function App() {
  console.log("App.tsx 렌더링 시작");
  const { requestAllPermissions } = useAllPermissions();

  React.useEffect(() => {
    requestAllPermissions();
  }, [requestAllPermissions]);
  return (
    <>
      <StatusBar style="light" backgroundColor="#2196F3" />
      <WebViewComponent />
    </>
  );
}
