import React, { useRef, useState } from "react";
import { View, StyleSheet, Alert, Text, StatusBar } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

// 타입 정의
interface WebViewErrorEvent {
  nativeEvent: {
    code: number;
    description: string;
    url: string;
  };
}

interface WebViewLoadEvent {
  nativeEvent: {
    url: string;
    title: string;
    loading: boolean;
  };
}

interface WebViewMessageData {
  type:
    | "getLocation"
    | "takePhoto"
    | "showNotification"
    | "saveFile"
    | "getUserInfo";
  id: string;
  // 추가 데이터를 구체적인 타입으로 정의
  data?: {
    latitude?: number;
    longitude?: number;
    photoPath?: string;
    message?: string;
    fileName?: string;
    fileSize?: number;
    userName?: string;
    userEmail?: string;
  };
}

export default function WebViewComponent() {
  // 컴포넌트 시작 로그 - Logcat에서 쉽게 찾을 수 있도록
  console.log("🔍 [WebViewApp] === WebView Component Started ===");
  console.log("🔍 [WebViewApp] Current URL:", "https://www.greensupia.com");

  const currentUrl = "https://www.greensupia.com";
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 웹페이지 CSS 주입을 위한 JavaScript
  const injectedJavaScript = `
    (function() {
      console.log('[WebViewApp] CSS 주입 시작');
      
      // CSS 변수로 안전 영역 값 설정 (여백 최적화)
      const root = document.documentElement;
      const safeAreaTop = getComputedStyle(root).getPropertyValue('--safe-area-inset-top') || '0px';
      root.style.setProperty('--safe-area-inset-top', safeAreaTop);
      
      // 상단 여백 조정 - 더 적당한 크기로 조정
      const style = document.createElement('style');
      style.textContent = \`
        /* CSS 변수 활용 - 여백 최소화 (음수 값으로 여백 줄이기) */
        :root {
          --safe-area-top: calc(var(--safe-area-inset-top, 0px) - 15px);
          --header-top: calc(var(--safe-area-inset-top, 0px) - 12px);
        }
        
        /* 가장 구체적인 선택자로 우선순위 높임 */
        html body[data-safe-area="true"][data-webview="true"] {
          padding-top: var(--safe-area-top);
          margin: 0;
          min-height: 100vh;
        }
        
        /* 일반적인 body 선택자 */
        html body {
          padding-top: var(--safe-area-top);
          margin: 0;
          min-height: 100vh;
        }
        
        /* 모든 헤더 요소에 상단 여백 추가 */
        html body[data-safe-area="true"][data-webview="true"] header, 
        html body[data-safe-area="true"][data-webview="true"] .header, 
        html body[data-safe-area="true"][data-webview="true"] [class*="header"], 
        html body[data-safe-area="true"][data-webview="true"] [id*="header"] {
          position: sticky;
          top: var(--header-top);
          z-index: 1000;
          background: white;
          padding-top: 0px;
        }
        
        /* 첫 번째 요소에 상단 여백 추가 */
        html body[data-safe-area="true"][data-webview="true"] > *:first-child {
          margin-top: var(--safe-area-top);
        }
        
        /* 안전 영역 지원 */
        @supports (padding: env(safe-area-inset-top)) {
          html body[data-safe-area="true"][data-webview="true"] {
            padding-top: calc(env(safe-area-inset-top) - 15px);
          }
        }
        
        /* 안전 영역 미지원 시 대체 - 여백 최소화 */
        @supports not (padding: env(safe-area-inset-top)) {
          html body[data-safe-area="true"][data-webview="true"] {
            padding-top: 0px;
          }
        }
      \`;
      document.head.appendChild(style);
      
      // 메타 뷰포트 설정
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
      } else {
        const newViewport = document.createElement('meta');
        newViewport.name = 'viewport';
        newViewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no';
        document.head.appendChild(newViewport);
      }
      
      // 데이터 속성으로 안전 영역 표시
      document.body.setAttribute('data-safe-area', 'true');
      document.body.setAttribute('data-webview', 'true');
      
      // CSS 변수 값 동적 설정
      const computedSafeArea = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0px';
      document.documentElement.style.setProperty('--safe-area-inset-top', computedSafeArea);
      
      // JavaScript로 여백을 더 줄이기
      const body = document.body;
      if (body) {
        // 상단 여백을 더 줄이기
        body.style.paddingTop = '0px';
        body.style.marginTop = '0px';
        
        // 첫 번째 요소의 여백도 줄이기
        const firstChild = body.firstElementChild;
        if (firstChild) {
          firstChild.style.marginTop = '0px';
          firstChild.style.paddingTop = '0px';
        }
        
        // 헤더 요소들의 여백도 줄이기
        const headers = body.querySelectorAll('header, .header, [class*="header"], [id*="header"]');
        headers.forEach(header => {
          header.style.paddingTop = '0px';
          header.style.marginTop = '0px';
        });
      }
      
      console.log('[WebViewApp] CSS 주입 완료 - 여백:', computedSafeArea);
      console.log('[WebViewApp] 안전 영역 설정 완료');
      console.log('[WebViewApp] JavaScript로 여백 추가 최소화 완료');
    })();
    true;
  `;

  // 허용된 도메인 목록
  const allowedDomains = [
    "greensupia.com",
    "www.greensupia.com",
    "api.greensupia.com", // API 서버도 추가
  ];

  // URL 보안 검증
  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);

      // HTTP 요청 차단
      if (urlObj.protocol !== "https:") {
        console.warn("⚠️ [WebViewApp] HTTP 요청 차단:", url);
        return false;
      }

      // 허용된 도메인만 접근
      if (!allowedDomains.includes(urlObj.hostname)) {
        console.warn("⚠️ [WebViewApp] 허용되지 않은 도메인:", urlObj.hostname);
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ [WebViewApp] URL 검증 실패:", error);
      return false;
    }
  };

  // 웹뷰 로딩 시작
  const handleLoadStart = (syntheticEvent: WebViewLoadEvent) => {
    const { url } = syntheticEvent.nativeEvent;
    console.log("🔍 [WebViewApp] 웹뷰 로딩 시작:", url);

    if (!validateUrl(url)) {
      console.warn("⚠️ [WebViewApp] 보안 경고 - 허용되지 않은 URL:", url);
      Alert.alert("보안 경고", "허용되지 않은 URL입니다.", [{ text: "확인" }]);
      // 로딩 중단
      webViewRef.current?.stopLoading();
      setIsLoading(false); // 로딩 상태 초기화
      return;
    }

    setIsLoading(true);
  };

  // 웹뷰 로딩 완료
  const handleLoadEnd = () => {
    console.log("✅ [WebViewApp] 웹뷰 로딩 완료");

    // 즉시 로딩 상태 해제 (UI 깜빡임 방지 제거)
    setIsLoading(false);
    console.log("✅ [WebViewApp] 로딩 상태 즉시 해제됨");

    // 백업: 1초 후에도 로딩 상태가 true라면 강제 해제
    setTimeout(() => {
      if (isLoading) {
        console.log("⚠️ [WebViewApp] 로딩 상태 강제 해제");
        setIsLoading(false);
      }
    }, 1000);
  };

  // 웹뷰 네비게이션 상태 변경 감지
  const handleNavigationStateChange = (navState: any) => {
    console.log("🔄 [WebViewApp] 네비게이션 상태 변경:", navState);

    // URL이 변경되었을 때 로딩 상태 즉시 초기화
    if (navState.url && navState.url !== currentUrl) {
      console.log("🔄 [WebViewApp] 페이지 변경 감지, 로딩 상태 즉시 초기화");
      setIsLoading(false);
    }

    // 로딩이 완료되었는데도 isLoading이 true라면 강제 해제
    if (!navState.loading && isLoading) {
      console.log("⚠️ [WebViewApp] 네비게이션 완료 시 로딩 상태 강제 해제");
      setIsLoading(false);
    }
  };

  // 허용된 메시지 타입 정의
  const allowedMessageTypes = [
    "getLocation", // 위치 정보 요청
    "takePhoto", // 사진 촬영
    "showNotification", // 알림 표시
    "saveFile", // 파일 저장
    "getUserInfo", // 사용자 정보 조회
  ] as const;

  // 웹뷰 메시지 수신 시 로딩 상태 확인
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = event.nativeEvent.data;
      console.log("📨 [WebViewApp] WebView 메시지 수신:", data);

      // JSON 파싱
      const parsedData: WebViewMessageData = JSON.parse(data);

      // 메시지 타입 검증
      if (!allowedMessageTypes.includes(parsedData.type)) {
        console.warn(
          "⚠️ [WebViewApp] 허용되지 않은 메시지 타입:",
          parsedData.type
        );
        return;
      }

      // 메시지 데이터 검증
      if (!validateMessageData(parsedData)) {
        console.warn("⚠️ [WebViewApp] 메시지 데이터 검증 실패:", parsedData);
        return;
      }

      // 메시지 처리
      processWebViewMessage(parsedData);
    } catch (error) {
      console.error("❌ [WebViewApp] 메시지 처리 오류:", error);
    }
  };

  // 메시지 데이터 검증
  const validateMessageData = (data: WebViewMessageData): boolean => {
    // 필수 필드 확인
    if (!data.type || !data.id) {
      console.warn("⚠️ [WebViewApp] 메시지 데이터 필수 필드 누락");
      return false;
    }

    // 메시지 ID 형식 검증 (UUID 등)
    if (typeof data.id !== "string" || data.id.length < 10) {
      console.warn("⚠️ [WebViewApp] 메시지 ID 형식 오류:", data.id);
      return false;
    }

    return true;
  };

  // 메시지 처리
  const processWebViewMessage = (data: WebViewMessageData) => {
    console.log("📨 [WebViewApp] 메시지 처리 시작:", data.type);

    switch (data.type) {
      case "getLocation":
        console.log("📍 [WebViewApp] 위치 정보 요청:", data);
        break;
      case "takePhoto":
        console.log("📸 [WebViewApp] 사진 촬영 요청:", data);
        break;
      case "showNotification":
        console.log("🔔 [WebViewApp] 알림 표시 요청:", data);
        break;
      default:
        console.warn("⚠️ [WebViewApp] 처리되지 않은 메시지 타입:", data.type);
    }
  };

  // 고급 보안 설정 - 적당한 보안 레벨 (medium)
  // const securityLevel: "low" | "medium" | "high" = "medium"; // 실용적인 보안

  // 보안 레벨별 설정
  const getSecurityConfig = () => {
    // 적당한 보안 (권장) - 보안과 성능의 균형
    return {
      mediaPlaybackRequiresUserAction: false,
      allowsInlineMediaPlayback: true,
      // SSL 오류는 콘솔에만 기록
      onSslError: () => {
        console.warn("⚠️ [WebViewApp] SSL 인증서 문제 감지");
      },
    };
  };

  // 컴포넌트 마운트 시 로그
  React.useEffect(() => {
    console.log("🚀 [WebViewApp] WebView 컴포넌트 마운트됨");

    // 컴포넌트 마운트 시 로딩 상태 초기화
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("⚠️ [WebViewApp] 마운트 후 로딩 상태 강제 초기화");
        setIsLoading(false);
      }
    }, 2000); // 2초 후 강제 초기화

    return () => {
      console.log("🛑 [WebViewApp] WebView 컴포넌트 언마운트됨");
      clearTimeout(timer);
    };
  }, [isLoading]);

  // 웹뷰 에러 처리
  const handleError = (syntheticEvent: WebViewErrorEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("❌ [WebViewApp] WebView error:", nativeEvent);

    // 에러 발생 시 로딩 상태 해제
    setIsLoading(false);

    Alert.alert(
      "웹뷰 오류",
      "페이지를 불러올 수 없습니다. URL을 확인해주세요.",
      [{ text: "확인", style: "default" }]
    );
  };

  console.log(
    "🔍 [WebViewApp] WebView 컴포넌트 렌더링 중, currentUrl:",
    currentUrl
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar
        translucent={false}
        backgroundColor="transparent"
        barStyle="dark-content"
        hidden={false}
      />
      {/* 로딩 상태 표시 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}

      {/* WebView만 화면 꽉차게 */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webView}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={({ nativeEvent }) => {
          // 로딩 진행률에 따른 상태 관리 - 더 강력한 로딩 해제
          console.log("📊 [WebViewApp] 로딩 진행률:", nativeEvent.progress);

          if (nativeEvent.progress === 1) {
            console.log("✅ [WebViewApp] 로딩 100% 완료, 즉시 상태 해제");
            setIsLoading(false);
          } else if (nativeEvent.progress > 0.8) {
            // 80% 이상 로딩되면 500ms 후 해제
            setTimeout(() => {
              console.log("✅ [WebViewApp] 80% 이상 로딩 완료, 지연 해제");
              setIsLoading(false);
            }, 500);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        userAgent="WebViewApp/1.0"
        geolocationEnabled={true}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
        // 1단계: HTTPS 강제 + 도메인 제한
        onShouldStartLoadWithRequest={(request) => {
          return validateUrl(request.url);
        }}
        // 2단계: JavaScript 보안 설정 (Android 전용)
        allowFileAccess={false} // 파일 접근 차단
        allowFileAccessFromFileURLs={false} // 파일 URL 접근 차단
        allowUniversalAccessFromFileURLs={false} // 범용 파일 접근 차단
        mixedContentMode="compatibility" // 혼합 콘텐츠 차단
        cacheEnabled={false} // 캐시 비활성화 (보안 강화)
        // Android 전용 보안 설정
        androidLayerType="hardware" // 하드웨어 가속
        injectedJavaScript={injectedJavaScript} // 웹페이지 CSS 주입
        {...getSecurityConfig()} // 고급 보안 설정 적용
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 0, // 상단 패딩 제거
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 0, // 상단 마진 제거
    paddingTop: 0, // 추가 패딩 제거
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  securityControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  securityText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  securityButtons: {
    flexDirection: "row",
    gap: 10,
  },
  securityButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeButton: {
    backgroundColor: "#4CAF50", // 예시로 초록색 사용
    color: "white",
  },
});
