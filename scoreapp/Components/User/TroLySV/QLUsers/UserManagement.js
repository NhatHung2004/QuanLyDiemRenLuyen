import React, { useState, useEffect } from "react";
import { View, FlatList, Image, Modal, TouchableOpacity, Dimensions, Alert } from "react-native";
import { Button, TextInput, Card, Avatar, Text, ActivityIndicator, IconButton } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import APIs, { authApis, endpoints } from "../../../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const UserManagement = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPage, setNextPage] = useState(endpoints["users"]); // URL trang đầu tiên
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu hay không
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "Assistant",
        image: "",
    });

    const [avatar, setAvatar] = useState(null);
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        if (!nextPage || loadingMore) return; // Không gọi API nếu đã hết trang

        setLoadingMore(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(nextPage);

            if (res.status === 200) {
                const filteredUsers = res.data.results.filter(user => user.role === "Student");
                setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
                setNextPage(res.data.next); // Cập nhật URL trang tiếp theo
                setHasMore(!!res.data.next); // Kiểm tra còn dữ liệu không
            } else {
                console.error("Không thể tải danh sách người dùng:", res);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const updateUser = (value, field) => {
        setUser({ ...user, [field]: value });
    };

    const deleteUser = async (userId) => {
        console.log("userID",userId);
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa trợ lý sinh viên này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            await authApis(token).delete(endpoints['deleteUser'](userId));
                            
                            alert("Xóa user thành công!");
                            setUsers(users.filter(user => user.id !== userId));
                        } catch (error) {
                            alert("Lỗi khi xóa trợ lý sinh viên. Vui lòng thử lại.");
                        }
                    },
                },
            ]
        );
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Cần quyền truy cập thư viện ảnh!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
            setAvatar(result.assets[0]);
        }
    };

    const register = async () => {
        setLoading(true);
        try {
            const form = new FormData();
            const updatedUser = { ...user, image: avatar ? avatar.uri : "" };
            Object.keys(updatedUser).forEach((key) => form.append(key, updatedUser[key]));

            await APIs.post(endpoints['register'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Thêm Trợ Lý Sinh Viên thành công!");
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: "#F5F7FA" }}>
            <Button 
                mode="contained" 
                onPress={() => setModalVisible(true)}
                style={{ marginBottom: 15, backgroundColor: "#007AFF" }}
            >
                Thêm Trợ Lý Sinh Viên
            </Button>

            {loading && <ActivityIndicator animating={true} size="large" color="#007AFF" style={{ marginVertical: 10 }} />}

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={{ marginBottom: 10, borderRadius: 10, elevation: 3 }}>
                        <Card.Title
                            title={item.username}
                            subtitle={item.email}
                            left={(props) => (
                                <Avatar.Image 
                                    {...props} 
                                    source={{ uri: item.image || "https://via.placeholder.com/150" }} 
                                    size={50} 
                                />
                            )}
                            right={(props) => (
                                <IconButton
                                    {...props} 
                                    icon="close-circle" 
                                    color="red" 
                                    onPress={() => deleteUser(item.id)} 
                                />
                            )}
                        />
                    </Card>
                )}
                onEndReached={() => hasMore && fetchUsers()} // Chỉ tải khi còn dữ liệu
                onEndReachedThreshold={0.5}
                ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#007AFF" /> : null}
            />

            {/* Modal thêm trợ lý sinh viên */}
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: width * 0.9, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                        <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: "bold", textAlign: "center" }}>
                            Thêm Trợ Lý Sinh Viên
                        </Text>

                        <TouchableOpacity onPress={pickImage} style={{ alignItems: "center", marginBottom: 20 }}>
                            <Avatar.Image 
                                source={{ uri: avatar?.uri || "https://via.placeholder.com/150" }} 
                                size={100} 
                                style={{ backgroundColor: "#ddd" }}
                            />
                            <Text style={{ color: '#007BFF', marginTop: 10 }}>Chọn Ảnh Hồ Sơ</Text>
                        </TouchableOpacity>

                        <TextInput label="Username" value={user.username} onChangeText={t => updateUser(t, "username")} mode="outlined" style={{ marginBottom: 10 }} />
                        <TextInput label="Email" value={user.email} onChangeText={t => updateUser(t, "email")} mode="outlined" style={{ marginBottom: 10 }} />
                        <TextInput label="Mật khẩu" value={user.password} secureTextEntry onChangeText={t => updateUser(t, "password")} mode="outlined" style={{ marginBottom: 10 }} />
                        <TextInput label="Họ" value={user.first_name} onChangeText={t => updateUser(t, "first_name")} mode="outlined" style={{ marginBottom: 10 }} />
                        <TextInput label="Tên" value={user.last_name} onChangeText={t => updateUser(t, "last_name")} mode="outlined" style={{ marginBottom: 10 }} />

                        <Button style={{ marginTop: 20, backgroundColor: '#007AFF' }} mode="contained" onPress={register} loading={loading} disabled={loading}>
                            Đăng Ký
                        </Button>

                        <Button style={{ marginTop: 10 }} mode="outlined" onPress={() => setModalVisible(false)}>Hủy</Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default UserManagement;
