import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";

export default function WebViewComponent() {
  console.log("WebView 컴포넌트 렌더링 시작");

  const [url, setUrl] = useState("https://www.greensupia.com");
  const [currentUrl, setCurrentUrl] = useState("https://www.greensupia.com");
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // 컴포넌트 마운트 시 로그
  React.useEffect(() => {
    console.log("WebView 컴포넌트 마운트됨");
    return () => {
      console.log("WebView 컴포넌트 언마운트됨");
    };
  }, []);

  // URL 이동
  const handleGoToUrl = () => {
    console.log("URL 이동 시도:", url);
    if (url.trim()) {
      let processedUrl = url.trim();

      // http:// 또는 https://가 없으면 https:// 추가
      if (
        !processedUrl.startsWith("http://") &&
        !processedUrl.startsWith("https://")
      ) {
        processedUrl = "https://" + processedUrl;
      }

      console.log("처리된 URL:", processedUrl);
      setCurrentUrl(processedUrl);
      setUrl(processedUrl);
    }
  };

  // 뒤로 가기
  const handleGoBack = () => {
    console.log("뒤로 가기 시도, canGoBack:", canGoBack);
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  // 앞으로 가기
  const handleGoForward = () => {
    console.log("앞으로 가기 시도, canGoForward:", canGoForward);
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  // 새로고침
  const handleRefresh = () => {
    console.log("새로고침 시도");
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // 홈으로 이동
  const handleGoHome = () => {
    console.log("홈으로 이동");
    setCurrentUrl("https://www.greensupia.com");
    setUrl("https://www.greensupia.com");
  };

  // 웹뷰 로딩 시작
  const handleLoadStart = () => {
    console.log("웹뷰 로딩 시작");
    setIsLoading(true);
  };

  // 웹뷰 로딩 완료
  const handleLoadEnd = () => {
    console.log("웹뷰 로딩 완료");
    setIsLoading(false);
  };

  // 웹뷰 네비게이션 상태 변경
  const handleNavigationStateChange = (navState: any) => {
    console.log("네비게이션 상태 변경:", navState);
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

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
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌐 웹뷰</Text>
        <Text style={styles.headerSubtitle}>
          웹사이트를 앱 내에서 바로 확인하세요
        </Text>
      </View>

      {/* URL 입력 및 네비게이션 */}
      <View style={styles.navigationContainer}>
        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.urlInput}
            value={url}
            onChangeText={setUrl}
            placeholder="URL을 입력하세요"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleGoToUrl}
          />
          <TouchableOpacity style={styles.goButton} onPress={handleGoToUrl}>
            <Text style={styles.goButtonText}>이동</Text>
          </TouchableOpacity>
        </View>

        {/* 네비게이션 버튼들 */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
            onPress={handleGoBack}
            disabled={!canGoBack}
          >
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              !canGoForward && styles.navButtonDisabled,
            ]}
            onPress={handleGoForward}
            disabled={!canGoForward}
          >
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleRefresh}>
            <Text style={styles.navButtonText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleGoHome}>
            <Text style={styles.navButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 로딩 표시 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>페이지 로딩 중...</Text>
        </View>
      )}

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <Text style={styles.debugText}>
          WebView 컨테이너 (currentUrl: {currentUrl})
        </Text>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webView}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          userAgent="WebViewApp/1.0"
          onMessage={(event) =>
            console.log("WebView 메시지:", event.nativeEvent.data)
          }
        />
      </View>

      {/* 현재 URL 표시 */}
      <View style={styles.currentUrlContainer}>
        <Text style={styles.currentUrlLabel}>현재 페이지:</Text>
        <Text style={styles.currentUrlText} numberOfLines={1}>
          {currentUrl}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
  },
  navigationContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  urlInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  urlInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  goButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: "center",
  },
  goButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navButton: {
    backgroundColor: "#FF9800",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  navButtonText: {
    fontSize: 18,
    color: "#ffffff",
  },
  loadingContainer: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    alignItems: "center",
  },
  loadingText: {
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "500",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webView: {
    flex: 1,
  },
  currentUrlContainer: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  currentUrlLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  currentUrlText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "monospace",
  },
  debugText: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    textAlign: "center",
    fontSize: 12,
    color: "#555",
  },
});
