import axios from "axios";
import config from "../config";
import { getFingerprint } from "./generators"

// Create an instance of Axios for API requests
const API = axios.create({
  baseURL: config.BACKEND_API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Add a request interceptor to compute fingerprint before each request
API.interceptors.request.use(
  async (requestConfig) => {
    try {
      const fingerprint = await getFingerprint();
      requestConfig.headers["X-Fingerprint-ID"] = fingerprint; // Add fingerprint to headers
    } catch (error) {
      console.error("Fingerprint computation error:", error);
    }
    return requestConfig;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

export default API;
