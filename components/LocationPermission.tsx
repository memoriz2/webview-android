import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";

export default function LocationPermission() {
  const [locationPermission, setLocationPermission] =
    useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRequested, setAutoRequested] = useState(false);

  // 앱 시작 시 자동으로 위치 권한 요청 및 위치 가져오기
  useEffect(() => {
    if (!autoRequested) {
      autoRequestLocationPermission();
      setAutoRequested(true);
    }
  }, [autoRequested]);

  // 자동 위치 권한 요청
  const autoRequestLocationPermission = async () => {
    setLoading(true);
    try {
      // 1. 현재 권한 상태 확인
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log("자동 실행 - 현재 위치 권한 상태:", status);
      setLocationPermission(status);

      // 2. 권한이 이미 허용된 경우 - 알림 없이 바로 위치 가져오기
      if (status === Location.PermissionStatus.GRANTED) {
        console.log("위치 권한이 이미 허용됨 - 알림 없이 현재 위치 가져오기");
        await getCurrentLocation();
        return;
      }

      // 3. 권한이 거부된 경우 - 사용자에게 권한 요청
      if (status === Location.PermissionStatus.DENIED) {
        console.log("위치 권한이 거부됨 - 권한 요청 다이얼로그 표시");
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        console.log("권한 요청 후 상태:", newStatus);
        setLocationPermission(newStatus);

        if (newStatus === Location.PermissionStatus.GRANTED) {
          await getCurrentLocation();
        }
        return;
      }

      // 4. 권한이 아직 결정되지 않은 경우 - 사용자에게 권한 요청
      if (status === Location.PermissionStatus.UNDETERMINED) {
        console.log("위치 권한이 결정되지 않음 - 권한 요청 다이얼로그 표시");
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        console.log("권한 요청 후 상태:", newStatus);
        setLocationPermission(newStatus);

        if (newStatus === Location.PermissionStatus.GRANTED) {
          await getCurrentLocation();
        }
        return;
      }
    } catch (error) {
      console.error("자동 위치 권한 요청 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 위치 권한 상태 확인 (수동)
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log("수동 권한 확인:", status);
      setLocationPermission(status);

      // 알림 제거 - 콘솔에만 기록
      if (status === Location.PermissionStatus.GRANTED) {
        console.log("위치 권한이 이미 허용되어 있습니다.");
      } else if (status === Location.PermissionStatus.DENIED) {
        console.log("위치 권한이 거부되어 있습니다.");
      } else {
        console.log("위치 권한이 결정되지 않았습니다.");
      }
    } catch (error) {
      console.error("위치 권한 확인 오류:", error);
      console.log("위치 권한 상태를 확인할 수 없습니다.");
    }
  };

  // 수동 위치 권한 요청
  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      // 현재 권한 상태 재확인
      const currentStatus = await Location.getForegroundPermissionsAsync();
      console.log("권한 요청 전 현재 상태:", currentStatus.status);

      if (currentStatus.status === Location.PermissionStatus.GRANTED) {
        console.log("위치 권한이 이미 허용되어 있습니다.");
        setLocationPermission(currentStatus.status);
        await getCurrentLocation();
        setLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("권한 요청 후 상태:", status);
      setLocationPermission(status);

      if (status === Location.PermissionStatus.GRANTED) {
        console.log("위치 권한이 허용되었습니다!");
        await getCurrentLocation();
      } else if (status === Location.PermissionStatus.DENIED) {
        console.log("위치 권한이 거부되었습니다.");
      } else {
        console.log(`권한 상태: ${status}`);
      }
    } catch (error) {
      console.error("위치 권한 요청 오류:", error);
      console.log("위치 권한 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 현재 위치 가져오기 (모든 알림 제거)
  const getCurrentLocation = async () => {
    // 권한 상태 재확인
    const currentStatus = await Location.getForegroundPermissionsAsync();
    if (currentStatus.status !== Location.PermissionStatus.GRANTED) {
      console.log("위치 가져오기 실패 - 권한 없음:", currentStatus.status);
      return;
    }

    setLoading(true);
    try {
      console.log("현재 위치 가져오기 시작");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      console.log("위치 정보 획득 성공:", location.coords);
      setCurrentLocation(location);
      console.log("위치 정보를 성공적으로 가져왔습니다.");
    } catch (error) {
      console.error("위치 가져오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 위치 서비스 활성화 확인
  const checkLocationServices = async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      console.log("위치 서비스 활성화 상태:", isEnabled);

      if (!isEnabled) {
        console.log("위치 서비스가 비활성화되어 있습니다.");
      } else {
        console.log("위치 서비스가 활성화되어 있습니다.");
      }
      return isEnabled;
    } catch (error) {
      console.error("위치 서비스 확인 오류:", error);
      return false;
    }
  };

  // 권한 상태에 따른 UI 렌더링
  const renderPermissionStatus = () => {
    if (locationPermission === null) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>권한 상태 확인 중...</Text>
        </View>
      );
    }

    const isGranted = locationPermission === Location.PermissionStatus.GRANTED;

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
          {isGranted ? "위치 권한 허용됨" : `위치 권한 ${locationPermission}`}
        </Text>
      </View>
    );
  };

  // 현재 위치 정보 표시
  const renderLocationInfo = () => {
    if (!currentLocation) return null;

    return (
      <View style={styles.locationInfo}>
        <Text style={styles.locationTitle}>현재 위치 정보</Text>
        <Text style={styles.locationText}>
          위도: {currentLocation.coords.latitude.toFixed(6)}
        </Text>
        <Text style={styles.locationText}>
          경도: {currentLocation.coords.longitude.toFixed(6)}
        </Text>
        <Text style={styles.locationText}>
          정확도: {currentLocation.coords.accuracy?.toFixed(1)}m
        </Text>
        <Text style={styles.locationText}>
          시간: {new Date(currentLocation.timestamp).toLocaleString()}
        </Text>
      </View>
    );
  };

  // 현재 위치 가져오기 버튼 표시 조건
  const shouldShowLocationButton = () => {
    return locationPermission === Location.PermissionStatus.GRANTED;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📍 위치 권한 관리</Text>
          <Text style={styles.headerSubtitle}>
            GPS 위치 정보 접근을 위한 권한을 설정하세요
          </Text>
        </View>

        {/* 자동 실행 상태 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자동 실행 상태</Text>
          <View style={styles.autoStatusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: autoRequested ? "#4CAF50" : "#FF9800" },
              ]}
            />
            <Text style={styles.autoStatusText}>
              {autoRequested ? "자동 실행 완료" : "자동 실행 대기 중..."}
            </Text>
          </View>
        </View>

        {/* 권한 상태 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>권한 상태</Text>
          {renderPermissionStatus()}
        </View>

        {/* 권한 확인 버튼 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>권한 상태 확인</Text>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={checkLocationPermission}
          >
            <Text style={styles.checkButtonText}>권한 상태 확인</Text>
          </TouchableOpacity>
        </View>

        {/* 권한 요청 버튼 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>권한 요청</Text>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              loading && styles.permissionButtonDisabled,
            ]}
            onPress={requestLocationPermission}
            disabled={loading}
          >
            <Text style={styles.permissionButtonText}>
              {loading ? "처리 중..." : "위치 권한 요청"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 위치 서비스 확인 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>위치 서비스</Text>
          <TouchableOpacity
            style={styles.serviceButton}
            onPress={checkLocationServices}
          >
            <Text style={styles.serviceButtonText}>위치 서비스 상태 확인</Text>
          </TouchableOpacity>
        </View>

        {/* 현재 위치 가져오기 */}
        {shouldShowLocationButton() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>현재 위치</Text>
            <TouchableOpacity
              style={[
                styles.locationButton,
                loading && styles.locationButtonDisabled,
              ]}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Text style={styles.locationButtonText}>
                {loading ? "위치 확인 중..." : "현재 위치 가져오기"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 위치 정보 표시 */}
        {renderLocationInfo()}

        {/* 설명 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>위치 권한이 필요한 이유</Text>
          <Text style={styles.description}>
            • 현재 위치 기반 서비스 제공{"\n"}• 지도 및 네비게이션 기능{"\n"}•
            위치 기반 추천 서비스{"\n"}• 비상 상황 시 위치 정보 전송
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
    backgroundColor: "#2196F3",
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
  autoStatusContainer: {
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
  autoStatusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF9800",
  },
  checkButton: {
    backgroundColor: "#9C27B0",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  checkButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  permissionButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  serviceButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  serviceButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  locationButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  locationButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  locationButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  locationInfo: {
    backgroundColor: "#E8F5E8",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#2E7D32",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
