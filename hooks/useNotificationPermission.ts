import { useState } from "react";
import { Alert, Linking } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { Platform } from "react-native";

export const useNotificationPermission = () => {
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);

  const requestNotificationPermission = async () => {
    try {
      const permission =
        Platform.OS === "android" && Number(Platform.Version) >= 33
          ? (PERMISSIONS.ANDROID as any).POST_NOTIFICATIONS ??
            ("android.permission.POST_NOTIFICATIONS" as any)
          : undefined;

      if (!permission) {
        // Android 12 이하: 런타임 알림 권한 없음 → 허용으로 간주
        setHasNotificationPermission(true);
        return true;
      }

      const result = await request(permission as any);

      setHasNotificationPermission(result === RESULTS.GRANTED);

      if (result === RESULTS.GRANTED) {
        console.log("알림 권한이 허용되었습니다.");
        return true;
      } else if (result === RESULTS.DENIED) {
        console.log("알림 권한이 거부되었습니다.");
        return false;
      } else if (result === RESULTS.BLOCKED) {
        showPermissionAlert();
        return false;
      }

      return false;
    } catch (error) {
      console.error("알림 권한 요청 오류:", error);
      return false;
    }
  };

  const checkNotificationPermission = async () => {
    try {
      const permission =
        Platform.OS === "android" && Number(Platform.Version) >= 33
          ? (PERMISSIONS.ANDROID as any).POST_NOTIFICATIONS ??
            ("android.permission.POST_NOTIFICATIONS" as any)
          : undefined;

      if (!permission) {
        setHasNotificationPermission(true);
        return true;
      }

      const result = await check(permission as any);

      setHasNotificationPermission(result === RESULTS.GRANTED);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error("알림 권한 확인 오류:", error);
      return false;
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      "알림 권한 필요",
      "푸시 알림을 받으려면 설정에서 알림 권한을 허용해주세요.",
      [
        { text: "취소", style: "cancel" },
        { text: "설정으로 이동", onPress: () => Linking.openSettings() },
      ]
    );
  };

  return {
    hasNotificationPermission,
    requestNotificationPermission,
    checkNotificationPermission,
    showPermissionAlert,
  };
};
