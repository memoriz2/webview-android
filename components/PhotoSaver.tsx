import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from "react-native-image-picker";
import RNFS from "react-native-fs";
import { usePermissions } from "../hooks/usePermissions";

interface PhotoSaverProps {
  onPhotoSaved?: (path: string) => void;
}

export const PhotoSaver: React.FC<PhotoSaverProps> = ({ onPhotoSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    hasGalleryPermission,
    hasCameraPermission,
    requestGalleryPermission,
    requestCameraPermission,
  } = usePermissions();

  const openSettings = () => {
    Linking.openSettings();
  };

  const showPermissionAlert = (type: "gallery" | "camera") => {
    const title = type === "gallery" ? "갤러리 접근 권한" : "카메라 권한";
    const message = `${title}이 필요합니다. 설정에서 권한을 허용해주세요.`;

    Alert.alert(title, message, [
      { text: "취소", style: "cancel" },
      { text: "설정으로 이동", onPress: openSettings },
    ]);
  };

  const saveImageToGallery = async (imagePath: string) => {
    try {
      setIsLoading(true);

      // Android에서 갤러리에 저장
      const fileName = `IMG_${Date.now()}.jpg`;
      const destPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;

      await RNFS.copyFile(imagePath, destPath);

      // 갤러리 새로고침을 위한 미디어 스캔
      await RNFS.scanFile(destPath);

      onPhotoSaved?.(destPath);
      Alert.alert("성공", "사진이 갤러리에 저장되었습니다.");
    } catch (error) {
      console.error("이미지 저장 오류:", error);
      Alert.alert("오류", "사진 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async (response: ImagePickerResponse) => {
    if (response.didCancel) return;

    if (response.errorCode) {
      Alert.alert("오류", "이미지 선택에 실패했습니다.");
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri) {
        await saveImageToGallery(asset.uri);
      }
    }
  };

  const selectFromGallery = async () => {
    if (!hasGalleryPermission) {
      const granted = await requestGalleryPermission();
      if (!granted) {
        showPermissionAlert("gallery");
        return;
      }
    }

    const options = {
      mediaType: "photo" as const,
      quality: 0.8 as const,
      maxWidth: 1920,
      maxHeight: 1080,
    };

    launchImageLibrary(options, handleImagePicker);
  };

  const takePhoto = async () => {
    if (!hasCameraPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        showPermissionAlert("camera");
        return;
      }
    }

    const options = {
      mediaType: "photo" as const,
      quality: 0.8 as const,
      maxWidth: 1920,
      maxHeight: 1080,
    };

    launchCamera(options, handleImagePicker);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사진 저장</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={selectFromGallery}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "처리중..." : "갤러리에서 선택"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={takePhoto}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "처리중..." : "사진 촬영"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
