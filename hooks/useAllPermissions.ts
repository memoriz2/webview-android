import { useLocationPermission } from "./useLocationPermission";
import { useNotificationPermission } from "./useNotificationPermission";
import { usePermissions } from "./usePermissions";

export const useAllPermissions = () => {
  const locationPermission = useLocationPermission();
  const notificationPermission = useNotificationPermission();
  const photoPermission = usePermissions();

  const requestAllPermissions = async () => {
    const results = await Promise.allSettled([
      locationPermission.requestLocationPermission(),
      notificationPermission.requestNotificationPermission(),
      photoPermission.requestGalleryPermission(),
      photoPermission.requestCameraPermission(),
    ]);

    return {
      location: results[0].status === "fulfilled" ? results[0].value : false,
      notification:
        results[1].status === "fulfilled" ? results[1].value : false,
      gallery: results[2].status === "fulfilled" ? results[2].value : false,
      camera: results[3].status === "fulfilled" ? results[3].value : false,
    };
  };

  const checkAllPermissions = async () => {
    const results = await Promise.allSettled([
      locationPermission.checkLocationPermission(),
      notificationPermission.checkNotificationPermission(),
    ]);

    return {
      location: results[0].status === "fulfilled" ? results[0].value : false,
      notification:
        results[1].status === "fulfilled" ? results[1].value : false,
      gallery: photoPermission.hasGalleryPermission,
      camera: photoPermission.hasCameraPermission,
    };
  };

  return {
    // 개별 권한 훅들
    location: locationPermission,
    notification: notificationPermission,
    photo: photoPermission,

    // 통합 권한 관리
    requestAllPermissions,
    checkAllPermissions,

    // 모든 권한 상태
    allPermissions: {
      location: locationPermission.hasLocationPermission,
      notification: notificationPermission.hasNotificationPermission,
      gallery: photoPermission.hasGalleryPermission,
      camera: photoPermission.hasCameraPermission,
    },
  };
};
