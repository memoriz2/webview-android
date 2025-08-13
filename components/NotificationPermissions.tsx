import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";

export default function NotificationPermissions() {
  const [notificationPermission, setNotificationPermission] = useState<
    string | null
  >(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 알림 권한 확인
  useEffect(() => {
    checkNotificationPermission();
    registerForPushNotificationsAsync();
  }, []);

  // 알림 권한 확인
  const checkNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      console.log("현재 알림 권한 상태:", status);
      setNotificationPermission(status);
    } catch (error) {
      console.error("알림 권한 확인 오류:", error);
    }
  };

  // 푸시 알림 토큰 등록
  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("푸시 알림 권한이 거부되었습니다.");
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-project-id", // 실제 프로젝트 ID로 변경 필요
      });
      console.log("푸시 토큰:", token.data);
      setExpoPushToken(token.data);
    } catch (error) {
      console.error("푸시 토큰 등록 오류:", error);
    }
  };

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    setLoading(true);
    try {
      console.log("알림 권한 요청 시작");
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("권한 요청 후 상태:", status);
      setNotificationPermission(status);

      if (status === "granted") {
        console.log("알림 권한이 허용되었습니다!");
        await registerForPushNotificationsAsync();
      } else {
        console.log("알림 권한이 거부되었습니다.");
      }
    } catch (error) {
      console.error("알림 권한 요청 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 테스트 알림 전송
  const sendTestNotification = async () => {
    if (notificationPermission !== "granted") {
      console.log("알림 권한이 필요합니다.");
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "테스트 알림",
          body: "이것은 테스트 알림입니다!",
          data: { data: "goes here" },
        },
        trigger: null, // 즉시 알림 전송
      });
      console.log("테스트 알림이 전송되었습니다.");
    } catch (error) {
      console.error("테스트 알림 전송 오류:", error);
    }
  };

  // 권한 상태에 따른 UI 렌더링
  const renderPermissionStatus = () => {
    if (notificationPermission === null) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>권한 상태 확인 중...</Text>
        </View>
      );
    }

    const isGranted = notificationPermission === "granted";

    return (
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isGranted ? "#4CAF50" : "#F44336" },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: isGranted ? "#4CAF50" : "#F44336" },
          ]}
        >
          {isGranted
            ? "알림 권한 허용됨"
            : `알림 권한 ${notificationPermission}`}
        </Text>
      </View>
    );
  };

  // 푸시 토큰 표시
  const renderPushToken = () => {
    if (!expoPushToken) {
      return (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenText}>푸시 토큰이 등록되지 않았습니다.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenTitle}>푸시 토큰:</Text>
        <Text style={styles.tokenText} numberOfLines={3}>
          {expoPushToken}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔔 푸시 알림</Text>
          <Text style={styles.headerSubtitle}>
            중요한 정보를 알림으로 받아보세요
          </Text>
        </View>

        {/* 권한 상태 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>권한 상태</Text>
          {renderPermissionStatus()}
        </View>

        {/* 권한 요청 버튼 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>권한 요청</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestNotificationPermission}
            disabled={loading}
          >
            <Text style={styles.permissionButtonText}>
              {loading ? "권한 요청 중..." : "알림 권한 요청"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 푸시 토큰 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>푸시 토큰</Text>
          {renderPushToken()}
        </View>

        {/* 테스트 알림 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테스트 알림</Text>
          <TouchableOpacity
            style={[
              styles.testButton,
              notificationPermission !== "granted" && styles.testButtonDisabled,
            ]}
            onPress={sendTestNotification}
            disabled={notificationPermission !== "granted"}
          >
            <Text style={styles.testButtonText}>테스트 알림 전송</Text>
          </TouchableOpacity>
        </View>

        {/* 설명 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>푸시 알림이 필요한 이유</Text>
          <Text style={styles.description}>
            • 중요한 업데이트 알림{"\n"}• 새로운 메시지 알림{"\n"}• 일정 및 약속
            알림{"\n"}• 보안 알림
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FF9800",
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
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  permissionButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  tokenContainer: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  tokenTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 12,
    color: "#6c757d",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
