import axios from "axios";
import configuration from "../configuartion";
const BASE_URL = configuration.API_URL1;

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {},
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.data === "User Denied") {
      localStorage.clear();
            window.location.replace("/login");
    } else if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const accessToken = await refreshAccessToken();
      axiosPrivate.defaults.headers.common["Authorization"] =
        "Bearer " + accessToken;
      return axiosPrivate(originalRequest);
    } else {
      throw error;
    }
  }
);
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const data = { refreshTokenSign: refreshToken };

  try {
    const response = await axios.post(
      configuration.API_URL1 + "/users/refreshAccessToken",
      data
    );
    const accessToken = response?.data?.accessToken;
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (err) {
    localStorage.clear();
    window.location.replace("/login");
  }
};
export const axiosPrivate = instance;
