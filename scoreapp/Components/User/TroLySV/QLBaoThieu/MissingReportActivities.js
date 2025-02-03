import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../../../configs/APIs";
import axios from "axios";

const MissingReportActivities = ({ navigation }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy token từ AsyncStorage
                const token = await AsyncStorage.getItem("token");
                console.log("token1", token);

                // Lấy dữ liệu báo cáo thiếu
                const reportsResponse = await authApis(token).get(endpoints['missingReports']);
                const reportsData = reportsResponse.data.results;
                const userId = await AsyncStorage.getItem("id");
                console.log("userID", userId);

                // Lấy user theo Id được cho bởi Activity
                const responseUser = await authApis(token).get(endpoints['user'](userId));

                console.log("user", responseUser.data.username);
               
                

                // Lấy toàn bộ dữ liệu hoạt động từ API với phân trang
                let allActivities = [];
                let activitiesPageUrl = endpoints['activities']; // URL trang đầu tiên của activities
                while (activitiesPageUrl) {
                    const activityResponse = await authApis(token).get(activitiesPageUrl);
                    allActivities = [...allActivities, ...activityResponse.data.results];
                    activitiesPageUrl = activityResponse.data.next; // Lấy URL trang tiếp theo
                }

                
                console.log("allActivities", allActivities);

                // Cập nhật danh sách báo cáo thiếu bằng cách so khớp với tên sinh viên và tên hoạt động
                const updatedActivities = reportsData.map(item => {
                    const activity = allActivities.find(a => a.id === item.activity); // Tìm hoạt động theo id
                    
                    return {
                        ...item,
                        studentName: responseUser.data.username, // Gán tên người dùng vào studentName
                        activityName: activity ? activity.title : "Unknown", // Tương tự với hoạt động
                    };
                });

                console.log(updatedActivities); // Kiểm tra kết quả

                // Cập nhật state với danh sách hoạt động đã cập nhật
                setActivities(updatedActivities);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false); // Kết thúc quá trình loading
            }
        };

        fetchData(); // Gọi hàm fetchData
    }, []); // useEffect chỉ chạy 1 lần khi component mount

    // Hàm renderItem để hiển thị từng phần tử trong danh sách
    const renderItem = ({ item }) => (
        <View style={{ padding: 15, borderBottomWidth: 1, borderColor: "#ddd" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Tên sinh viên: {item.studentName}</Text>
            <Text>Tên hoạt động: {item.activityName}</Text>
            <Text>Ngày tạo: {new Date(item.created_at).toLocaleDateString()}</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate("MRADetail", { item })}
                style={{ backgroundColor: "#007bff", padding: 10, marginTop: 5, borderRadius: 5 }}>
                <Text style={{ color: "white", textAlign: "center" }}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    // Nếu đang loading, hiển thị ActivityIndicator
    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
            <FlatList
                data={activities} // Dữ liệu sẽ được hiển thị trong FlatList
                keyExtractor={(item) => item.id.toString()} // Dùng id làm key cho mỗi phần tử
                renderItem={renderItem} // Gọi renderItem để render mỗi phần tử
            />
        </View>
    );
};

export default MissingReportActivities;
