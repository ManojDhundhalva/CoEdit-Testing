import { useAuth } from "../context/auth";
import API from "../utils/api";

// Create a custom hook for easy access to GET and POST
const useAPI = () => {
    const { LogOut } = useAuth();

    const GET = async (url, params = {}) => {
        try {
            const response = await API.get(url, { params });
            return response;
        } catch (error) {
            handleError(error);
        }
    };

    const POST = async (url, data = {}, params = {}) => {
        try {
            const response = await API.post(url, data, { params });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error) => {
        if (error.response) {
            // if (error.response.status === 403) LogOut(); //unauthorized
            console.error("[API request error] :", error.response.data?.message);
        } else {
            console.error("[Network or server error] :", error.message);
        }
        throw error;
    };

    return { GET, POST };
};

export default useAPI;