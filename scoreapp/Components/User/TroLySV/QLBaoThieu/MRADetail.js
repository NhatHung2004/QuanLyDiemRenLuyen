import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { authApis, endpoints } from "../../../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MRADetail = ({ route, navigation }) => {
    console.log("route", route);
    const { item } = route.params;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleDelete = async () => {
        Alert.alert(
            "Xoá báo cáo",
            "Bạn có chắc chắn muốn xoá báo cáo này không?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xoá",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            const reportId = item.id;
                            const deleteUrl = `${authApis(token).defaults.baseURL}${endpoints['deleteActivity'](reportId)}`;

                            console.log("Delete URL: ", deleteUrl);

                            const response = await authApis(token).delete(deleteUrl, {
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                            });

                            console.log("response status", response.status);

                            if (response.status === 204) {
                                Alert.alert("Thành công", "Báo cáo đã được xoá!");
                                navigation.navigate("MissingReportActivities");
                            }
                        } catch (error) {
                            console.error("Error deleting report:", error);
                            Alert.alert("Lỗi", "Không thể xoá báo cáo, vui lòng thử lại.");
                        }
                    },
                },
            ]
        );
    };

    const handleConfirm = async () => {
        Alert.alert(
            "Xác nhận thành công",
            "Bạn có chắc chắn báo cáo này đã hoàn thành và đúng yêu cầu không?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xác nhận",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            const form = {
                                "evidence": item.evidence,
                                "is_approved": true,
                                "student": item.student,
                                "activity": item.activity
                            };

                            console.log("form", form);

                            const response = await authApis(token).post(endpoints['comfirmActivity'](item.id), form);
                            console.log("response status", response.status);

                            if (response.status === 200) {
                                Alert.alert("Thành công", "Báo cáo đã được xác nhận!");
                                navigation.navigate("MissingReportActivities");
                            } else {
                                Alert.alert("Lỗi", "Không thể xác nhận báo cáo, vui lòng thử lại.");
                            }

                        } catch (error) {
                            console.error("Error confirming report:", error);
                            Alert.alert("Lỗi", "Không thể xác nhận báo cáo, vui lòng thử lại.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                {/* Thông tin sinh viên */}
                {item.studentName && (
                    <Text style={styles.label}>
                        <Text style={styles.boldText}>Tên sinh viên: </Text>{item.studentName}
                    </Text>
                )}

                {/* Thông tin hoạt động */}
                {item.activityName && (
                    <Text style={styles.label}>
                        <Text style={styles.boldText}>Tên hoạt động: </Text>{item.activityName}
                    </Text>
                )}

                {/* Chứng cứ */}
                {item.evidence && (
                    <View style={styles.imageContainer}>
                        <Text style={styles.boldText}>Minh chứng:</Text>
                        <Image source={{ uri: item.evidence }} style={styles.image} />
                    </View>
                )}

                {/* Tình trạng phê duyệt */}
                <Text style={styles.label}>
                    <Text style={styles.boldText}>Tình trạng phê duyệt: </Text>
                    <Text style={item.is_approved ? styles.approvedText : styles.pendingText}>
                        {item.is_approved ? "Đã phê duyệt" : "Chưa phê duyệt"}
                    </Text>
                </Text>

                {/* Ngày tạo */}
                <Text style={styles.label}>
                    <Text style={styles.boldText}>Ngày tạo: </Text>
                    {formatDate(item.created_at)}
                </Text>

                {/* Hai nút hành động */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleDelete} style={[styles.button, styles.deleteButton]}>
                        <Text style={styles.buttonText}>Xoá</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
                        <Text style={styles.buttonText}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f0f2f5",
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        color: "#333",
    },
    boldText: {
        fontWeight: "bold",
        color: "#000",
    },
    approvedText: {
        color: "#28a745",
        fontWeight: "bold",
    },
    pendingText: {
        color: "#dc3545",
        fontWeight: "bold",
    },
    imageContainer: {
        marginTop: 10,
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        resizeMode: "contain",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: "#dc3545",
        marginRight: 5,
    },
    confirmButton: {
        backgroundColor: "#28a745",
        marginLeft: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default MRADetail;
