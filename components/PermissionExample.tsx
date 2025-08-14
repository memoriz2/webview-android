import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAllPermissions } from "../hooks/useAllPermissions";

export const PermissionExample: React.FC = () => {
  const {
    location,
    notification,
    photo,
    requestAllPermissions,
    checkAllPermissions,
    allPermissions,
  } = useAllPermissions();

  const handleRequestAllPermissions = async () => {
    const results = await requestAllPermissions();
    console.log("모든 권한 요청 결과:", results);
  };

  const handleCheckAllPermissions = async () => {
    const results = await checkAllPermissions();
    console.log("모든 권한 상태:", results);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>권한 관리 예시</Text>

      {/* 개별 권한 요청 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>개별 권한 요청</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={location.requestLocationPermission}
        >
          <Text style={styles.buttonText}>
            위치 권한 요청 ({location.hasLocationPermission ? "허용" : "거부"})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={notification.requestNotificationPermission}
        >
          <Text style={styles.buttonText}>
            알림 권한 요청 (
            {notification.hasNotificationPermission ? "허용" : "거부"})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={photo.requestGalleryPermission}
        >
          <Text style={styles.buttonText}>
            갤러리 권한 요청 ({photo.hasGalleryPermission ? "허용" : "거부"})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={photo.requestCameraPermission}
        >
          <Text style={styles.buttonText}>
            카메라 권한 요청 ({photo.hasCameraPermission ? "허용" : "거부"})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 통합 권한 관리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>통합 권한 관리</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestAllPermissions}
        >
          <Text style={styles.buttonText}>모든 권한 한번에 요청</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCheckAllPermissions}
        >
          <Text style={styles.buttonText}>모든 권한 상태 확인</Text>
        </TouchableOpacity>
      </View>

      {/* 현재 권한 상태 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 권한 상태</Text>
        <Text style={styles.statusText}>
          위치: {allPermissions.location ? "✅" : "❌"}
        </Text>
        <Text style={styles.statusText}>
          알림: {allPermissions.notification ? "✅" : "❌"}
        </Text>
        <Text style={styles.statusText}>
          갤러리: {allPermissions.gallery ? "✅" : "❌"}
        </Text>
        <Text style={styles.statusText}>
          카메라: {allPermissions.camera ? "✅" : "❌"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
});
