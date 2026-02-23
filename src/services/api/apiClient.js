// src/api/apiClient.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiClient = axios.create({
    baseURL: "https://core.kapradaily.com/api/v1",
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Add access token to each request
apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    // console.log("token", token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Handle expired token (401) and refresh it automatically
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest); // Retry original request
                } else {
                    await AsyncStorage.clear(); // Token refresh failed → logout
                }
            } catch (err) {
                console.error("Token refresh failed:", err);
                await AsyncStorage.clear();
            }
        }

        return Promise.reject(error);
    }
);

// 🔄 Helper function to refresh the access token
const refreshAccessToken = async () => {
    try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) return null;

        const response = await axios.post(
            "https://core.kapradaily.com/api/v1/auth/refreshtoken",
            { refreshToken: refreshToken },
            // { headers: { "Content-Type": "application/json" } }
        );

        if (response.data?.data?.accessToken) {
            await AsyncStorage.setItem("authToken", response.data?.data?.accessToken);
            return response.data?.data?.accessToken;
        }

        return null;
    } catch (error) {
        console.error("Refresh token API error:", error);
        return null;
    }
};

export default apiClient;
