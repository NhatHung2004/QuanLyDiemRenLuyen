import { Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, ImageBackground, Dimensions, Image } from "react-native";
import { Button, TextInput, Menu, Divider } from "react-native-paper";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const Register = () => {
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        department: "1",
        role: "Student",
        image: "",
    });

    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [visible, setVisible] = useState(false);
    const nav = useNavigation();

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleSelectDepartment = (value) => {
        setUser(prevUser => ({ ...prevUser, department: value }));
        closeMenu();
    };

    const departmentNames = {
        "1": "Khoa Công nghệ thông tin",
        "2": "Khoa Quản trị kinh doanh",
        "3": "Khoa Kinh tế",
    };

    const fields = [
        { key: "username", title: "Username", secure: false, icon: "account-circle", maxLength: 150 },
        { key: "email", title: "Email", secure: false, icon: "email", maxLength: 254 },
        { key: "password", title: "Password", secure: true, icon: "lock", maxLength: 128 },
        { key: "first_name", title: "First Name", secure: false, icon: "account", maxLength: 150 },
        { key: "last_name", title: "Last Name", secure: false, icon: "account", maxLength: 150 },
        { key: "department", title: "Department", secure: false, icon: "office-building" },
    ];

    const navigation = useNavigation();

    const updateUser = (value, field) => {
        setUser(prevUser => ({ ...prevUser, [field]: value }));
    };

    const uploadImageToCloudinary = async (imageUri) => {
        const data = new FormData();
        const fileUri = imageUri.replace("file://", "");

        data.append("file", {
            uri: fileUri,
            type: "image/jpeg",
            name: "profile.jpg",
        });
        data.append("upload_preset", "my_preset");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/pqbou11/image/upload", {
                method: "POST",
                body: data,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            return result.secure_url;
        } catch (error) {
            console.error("Upload failed:", error);
            return null;
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
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
            const imageUrl = avatar ? await uploadImageToCloudinary(avatar.uri) : "";
            if (!imageUrl && avatar) {
                alert("Image upload failed. Try again!");
                setLoading(false);
                return;
            }

            const form = new FormData();
            const updatedUser = { ...user, image: imageUrl };
            Object.keys(updatedUser).forEach((key) => form.append(key, updatedUser[key]));

            await APIs.post(endpoints['register'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Đăng ký thành công!");
            nav.navigate("Login");
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('../../assets/log-reg/background-login-register.avif')} style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width }}>
                <ScrollView contentContainerStyle={{ padding: 20, minHeight: height * 0.4, backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: 10, justifyContent: 'center', margin: 10, marginTop: 30 }}>
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <TouchableOpacity onPress={pickImage} style={{ marginTop: 10 }}>
                            <Text style={{ color: '#007BFF', fontWeight: 'bold', fontSize: 18 }}>Chọn Ảnh Hồ Sơ</Text>
                        </TouchableOpacity>
                    </View>

                    {avatar && (
                        <View style={{ alignItems: "center", marginVertical: 20 }}>
                            <Text style={{ marginBottom: 10, fontSize: 16 }}>Ảnh Đã Chọn:</Text>
                            <Image source={{ uri: avatar.uri }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#007BFF" }} />
                        </View>
                    )}

                    {fields.map(f => (
                        f.key !== 'department' ? (
                            <TextInput
                                key={f.key}
                                label={f.title}
                                right={<TextInput.Icon icon={f.icon} />}
                                secureTextEntry={f.secure}
                                style={{ marginBottom: 15, borderRadius: 10 }}
                                placeholder={f.title}
                                value={user[f.key]}
                                onChangeText={t => updateUser(t, f.key)}
                                mode="outlined"
                                maxLength={f.maxLength}
                            />
                        ) : (
                            <View key={f.key} style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{f.title}</Text>
                                <Menu
                                    visible={visible}
                                    onDismiss={closeMenu}
                                    anchor={<TouchableOpacity style={{ backgroundColor: '#A2D1F7', padding: 10, borderRadius: 8 }} onPress={openMenu}>
                                        <Text style={{ fontSize: 16, color: '#007BFF' }}>
                                            {departmentNames[user.department] || "Chọn khoa"}
                                        </Text>
                                    </TouchableOpacity>}
                                >
                                    <Menu.Item onPress={() => handleSelectDepartment("1")} title="Khoa Công nghệ thông tin" />
                                    <Menu.Item onPress={() => handleSelectDepartment("2")} title="Khoa Quản trị kinh doanh" />
                                    <Menu.Item onPress={() => handleSelectDepartment("3")} title="Khoa Kinh tế" />
                                </Menu>
                            </View>
                        )
                    ))}

                    <Button style={{ marginTop: 20, backgroundColor: '#A2D1F7', borderRadius: 8 }} icon="account-check" mode="contained" onPress={register} loading={loading} disabled={loading}>
                        Đăng Ký
                    </Button>
                    {/* Chưa có tài khoản? Đăng ký */}
                    <Text style={{ textAlign: "center", marginTop: 10 }}>
                        Đã có tài khoản?{" "}
                        <Text
                            style={{ color: "#007AFF", fontWeight: "bold" }}
                            onPress={() => navigation.navigate("Login")}
                        >
                            Đăng nhập
                        </Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

export default Register;
