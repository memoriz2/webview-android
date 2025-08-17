import * as SecureStore from "expo-secure-store";

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
}

export const useSecureToken = () => {
  // 토큰 저장
  const saveToken = async (tokenData: TokenData) => {
    try {
      await SecureStore.setItemAsync("access_token", tokenData.access_token);
      await SecureStore.setItemAsync("refresh_token", tokenData.refresh_token);
      await SecureStore.setItemAsync(
        "token_expires_at",
        tokenData.expires_at.toString()
      );
      await SecureStore.setItemAsync("user_id", tokenData.user_id);

      console.log("토큰이 안전하게 저장되었습니다.");
      return true;
    } catch (error) {
      console.error("토큰 저장 실패:", error);
      return false;
    }
  };

  // 토큰 조회
  const getToken = async (): Promise<TokenData | null> => {
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      const expiresAt = await SecureStore.getItemAsync("token_expires_at");
      const userId = await SecureStore.getItemAsync("user_id");

      if (!accessToken || !refreshToken || !expiresAt || !userId) {
        return null;
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: parseInt(expiresAt),
        user_id: userId,
      };
    } catch (error) {
      console.error("토큰 조회 실패:", error);
      return null;
    }
  };

  // 토큰 유효성 확인
  const isTokenValid = async (): Promise<boolean> => {
    const tokenData = await getToken();
    if (!tokenData) return false;

    return Date.now() < tokenData.expires_at;
  };

  // 토큰 갱신
  const refreshToken = async (): Promise<boolean> => {
    try {
      const tokenData = await getToken();
      if (!tokenData) return false;

      const response = await fetch("https://api.greensupia.com/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: tokenData.refresh_token,
        }),
      });

      if (response.ok) {
        const newTokens = await response.json();
        await saveToken({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: Date.now() + newTokens.expires_in * 1000,
          user_id: tokenData.user_id,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      return false;
    }
  };

  // 모든 토큰 삭제
  const clearAllTokens = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("token_expires_at");
      await SecureStore.deleteItemAsync("user_id");
      console.log("모든 토큰이 삭제되었습니다.");
    } catch (error) {
      console.error("토큰 삭제 실패:", error);
    }
  };

  return {
    saveToken,
    getToken,
    isTokenValid,
    refreshToken,
    clearAllTokens,
  };
};
