import { useState } from "react";
import { Alert, Linking } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

export const useLocationPermission = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      const result = await request(permission);

      setHasLocationPermission(result === RESULTS.GRANTED);

      if (result === RESULTS.GRANTED) {
        console.log("위치 권한이 허용되었습니다.");
        return true;
      } else if (result === RESULTS.DENIED) {
        console.log("위치 권한이 거부되었습니다.");
        return false;
      } else if (result === RESULTS.BLOCKED) {
        showPermissionAlert();
        return false;
      }

      return false;
    } catch (error) {
      console.error("위치 권한 요청 오류:", error);
      return false;
    }
  };

  const checkLocationPermission = async () => {
    try {
      const permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      const result = await check(permission);

      setHasLocationPermission(result === RESULTS.GRANTED);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error("위치 권한 확인 오류:", error);
      return false;
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      "위치 권한 필요",
      "위치 서비스를 사용하려면 설정에서 위치 권한을 허용해주세요.",
      [
        { text: "취소", style: "cancel" },
        { text: "설정으로 이동", onPress: () => Linking.openSettings() },
      ]
    );
  };

  return {
    hasLocationPermission,
    requestLocationPermission,
    checkLocationPermission,
    showPermissionAlert,
  };
};
