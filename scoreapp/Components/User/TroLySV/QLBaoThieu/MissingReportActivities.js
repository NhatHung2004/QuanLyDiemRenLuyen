import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../../../configs/APIs";

const MissingReportActivities = ({ navigation }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const reportsResponse = await authApis(token).get(endpoints['missingReports']);
                const reportsData = reportsResponse.data.results;
                const userId = await AsyncStorage.getItem("id");

                const responseUser = await authApis(token).get(endpoints['user'](userId));

                let allActivities = [];
                let activitiesPageUrl = endpoints['activities'];
                while (activitiesPageUrl) {
                    const activityResponse = await authApis(token).get(activitiesPageUrl);
                    allActivities = [...allActivities, ...activityResponse.data.results];
                    activitiesPageUrl = activityResponse.data.next;
                }

                // Nếu không có báo cáo thiếu, set dữ liệu thành rỗng
                if (reportsData.length === 0) {
                    setActivities([]);
                    return;
                }

                const updatedActivities = reportsData.map(item => {
                    const activity = allActivities.find(a => a.id === item.activity);
                    return {
                        ...item,
                        studentName: responseUser.data.username,
                        activityName: activity ? activity.title : "Không xác định",
                    };
                });

                setActivities(updatedActivities);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Hiển thị khi đang tải dữ liệu
    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 20 }}>
            {activities.length === 0 ? (
                // Hiển thị thông báo khi không có dữ liệu báo thiếu
                <Text style={{ textAlign: "center", fontSize: 18, color: "#555", marginTop: 50 }}>
                    Hiện tại không có báo cáo thiếu nào.
                </Text>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, borderBottomWidth: 1, borderColor: "#ddd" }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Tên sinh viên: {item.studentName}</Text>
                            <Text>Tên hoạt động: {item.activityName}</Text>
                            <Text>Ngày tạo: {formatDate(item.created_at)}</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("MRADetail", { item })}
                                style={{
                                    backgroundColor: "#007bff",
                                    padding: 10,
                                    marginTop: 5,
                                    borderRadius: 5,
                                }}>
                                <Text style={{ color: "white", textAlign: "center" }}>Xem chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default MissingReportActivities;
