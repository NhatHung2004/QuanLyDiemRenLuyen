import axios from "axios";

const BASE_URL = 'https://hungnhat.pythonanywhere.com/';

export const endpoints = {
    'login': '/o/token/',
    'user': id =>  `/users/${id}/`,  // Endpoint lấy thông tin người dùng hiện tại
    'register': '/users/', // Endpoint đăng ký tài khoản
    'activities': '/activities/',  // Endpoint lấy danh sách hoạt động
}

// Axios instance cho các yêu cầu không cần xác thực
export default axios.create({
    baseURL: BASE_URL
});

// Axios instance cho các yêu cầu có xác thực (có token)
export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',  // Đảm bảo gửi dữ liệu ở định dạng JSON
        }
    });
};
