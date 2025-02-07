import axios from "axios";

const BASE_URL = 'https://hungnhat.pythonanywhere.com/';

export const endpoints = {
    'login': '/o/token/',
    'user': id =>  `/users/${id}/`,  // Endpoint lấy thông tin người dùng hiện tại
    'users': '/users/', 
    'register': '/users/', // Endpoint đăng ký tài khoản
    'activities': '/activities/',  // Endpoint lấy danh sách hoạt động
    'registerActivity': '/activities/register/',  // Endpoint đăng ký hoạt động
    'joinedActivities': '/activities/participated/',  // Endpoint lấy danh sách hoạt động đã tham gia
    'cancelActivity':  '/activities/participated/', // Endpoint xoá hoạt động đã tham gia 
    'comments': id => `/activities/${id}/comments/`,  // Endpoint lấy danh sách bình luận
    'createComment': id =>  `/activities/${id}/comments/`,  // Endpoint tạo bình luận
    'missingReport': id =>  `/activities/${id}/report_missing/`,
    'missingReports': '/missing_report/', 
    'deleteActivity': id => `/missing_report/${id}/`,
    'comfirmActivity': id => `/missing_report/${id}/approve/`,
    'disciplineScore': '/scores/student_score/',
    'trainingScoreStatistics': '/scores/stats_score/',
    'exportReport': '/scores/export_file/',
    'getScores': '/scores/',
    'deleteUser': id => `/users/${id}/`,
    'initScores': '/scores/',
    'updateScores': '/scores/update_score/',
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
