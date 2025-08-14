import React, { useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";

export default function WebViewComponent() {
  console.log("WebView 컴포넌트 렌더링 시작");

  const currentUrl = "https://www.greensupia.com";
  const webViewRef = useRef<WebView>(null);

  // 컴포넌트 마운트 시 로그
  React.useEffect(() => {
    console.log("WebView 컴포넌트 마운트됨");
    return () => {
      console.log("WebView 컴포넌트 언마운트됨");
    };
  }, []);

  // 웹뷰 에러 처리
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    Alert.alert(
      "웹뷰 오류",
      "페이지를 불러올 수 없습니다. URL을 확인해주세요.",
      [{ text: "확인", style: "default" }]
    );
  };

  console.log("WebView 컴포넌트 렌더링 중, currentUrl:", currentUrl);

  return (
    <View style={styles.container}>
      {/* WebView만 화면 꽉차게 */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webView}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        userAgent="WebViewApp/1.0"
        geolocationEnabled={true}
        onMessage={(event) =>
          console.log("WebView 메시지:", event.nativeEvent.data)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webView: {
    flex: 1,
  },
});
