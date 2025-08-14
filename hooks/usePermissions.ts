import { useState } from "react";
import { Platform } from "react-native";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

export const usePermissions = () => {
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const requestGalleryPermission = async () => {
    try {
      let permission;

      if (Number(Platform.Version) >= 33) {
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else {
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      const result = await request(permission);
      setHasGalleryPermission(result === RESULTS.GRANTED);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error("갤러리 권한 요청 오류:", error);
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const permission = PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);
      setHasCameraPermission(result === RESULTS.GRANTED);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error("카메라 권한 요청 오류:", error);
      return false;
    }
  };

  return {
    hasGalleryPermission,
    hasCameraPermission,
    requestGalleryPermission,
    requestCameraPermission,
  };
};
