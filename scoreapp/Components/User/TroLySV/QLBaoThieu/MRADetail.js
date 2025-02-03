import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { authApis, endpoints } from "../../../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MRADetail = ({ route, navigation }) => {
    console.log("route", route);
    const { item } = route.params; // Lấy đúng dữ liệu từ params

    const handleDelete = async () => {
        Alert.alert(
            "Xoá báo cáo",
            "Bạn có chắc chắn muốn xoá báo cáo này không?",
            [
                {
                    text: "Huỷ",
                    style: "cancel",
                },
                {
                    text: "Xoá",
                    onPress: async () => {
                        try {
                            // Lấy token từ AsyncStorage
                            const token = await AsyncStorage.getItem("token");
    
                            // Lấy id của báo cáo
                            const reportId = item.id;
    
                            // Ghép URL đầy đủ
                            const deleteUrl = `${authApis(token).defaults.baseURL}${endpoints['deleteActivity'](reportId)}`;
                            console.log("Delete URL: ", deleteUrl);  // Kiểm tra URL trước khi gửi yêu cầu
    
                            // Gọi API xoá báo cáo
                            const response = await authApis(token).delete(deleteUrl, {
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                            });

                            console.log("response status", response.status);
    
                            if (response.status === 204) {
                                Alert.alert("Thành công", "Báo cáo đã được xoá!");
                                navigation.goBack();
                            }
                        } catch (error) {
                            console.error("Error deleting report:", error);
                            Alert.alert("Lỗi", "Không thể xoá báo cáo, vui lòng thử lại.");
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };
    

    const handleConfirm = () => {
        // Xử lý hành động xác nhận báo thiếu thành công
        Alert.alert(
            "Xác nhận thành công",
            "Bạn có chắc chắn báo cáo này đã hoàn thành và đúng yêu cầu không?",
            [
                {
                    text: "Huỷ",
                    style: "cancel",
                },
                {
                    text: "Xác nhận",
                    onPress: async () => {
                        try {
                            // Lấy token từ AsyncStorage
                            const token = await AsyncStorage.getItem("token");
    
                            // Lấy id của báo cáo
                            const reportId = item.id;
    
                            const form = {
                                "evidence": item.evidence,
                                "is_approved": true,
                                "student": item.student,
                                "activity": item.activity
                            };
    
                            console.log("form", form);
    
                            // Gọi API xác nhận báo cáo
                            const response = await authApis(token).post(endpoints['comfirmActivity'](item.id), form);
                            console.log("response status", response.status);
                            if (response.status === 200) {
                                Alert.alert("Thành công", "Báo cáo đã được xác nhận!");
                                navigation.goBack(); // Quay lại trang trước sau khi xác nhận thành công
                            } else {
                                Alert.alert("Lỗi", "Không thể xác nhận báo cáo, vui lòng thử lại.");
                            }
    
                        } catch (error) {
                            console.error("Error confirming report:", error);
                            Alert.alert("Lỗi", "Không thể xác nhận báo cáo, vui lòng thử lại.");
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };
    

    return (
        <ScrollView style={{ flex: 1, padding: 15, backgroundColor: "#f8f9fa" }}>
            {/* Thông tin sinh viên */}
            {item.studentName && (
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Tên sinh viên: </Text>
                    {item.studentName}
                </Text>
            )}

            {/* Thông tin hoạt động */}
            {item.activityName && (
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Tên hoạt động: </Text>
                    {item.activityName}
                </Text>
            )}

            {/* Chứng cứ */}
            {item.evidence && (
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>Chứng cứ:</Text>
                    <Image
                        source={{ uri: item.evidence }}
                        style={{ width: "100%", height: 200, marginTop: 10 }}
                        resizeMode="contain"
                    />
                </View>
            )}

            {/* Tình trạng phê duyệt */}
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
                <Text style={{ fontWeight: "bold" }}>Tình trạng phê duyệt: </Text>
                {item.is_approved ? "Đã phê duyệt" : "Chưa phê duyệt"}
            </Text>

            {/* Ngày tạo */}
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
                <Text style={{ fontWeight: "bold" }}>Ngày tạo: </Text>
                {new Date(item.created_at).toLocaleDateString()}
            </Text>

            {/* Hai nút hành động */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                        backgroundColor: "#dc3545",
                        padding: 10,
                        borderRadius: 5,
                        flex: 1,
                        marginRight: 5,
                    }}
                >
                    <Text style={{ color: "white", textAlign: "center" }}>Xoá</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleConfirm}
                    style={{
                        backgroundColor: "#28a745",
                        padding: 10,
                        borderRadius: 5,
                        flex: 1,
                        marginLeft: 5,
                    }}
                >
                    <Text style={{ color: "white", textAlign: "center" }}>Xác nhận báo thiếu thành công</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default MRADetail;
