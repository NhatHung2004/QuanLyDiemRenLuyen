import { Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, ImageBackground, Dimensions, Image } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";

const { width, height } = Dimensions.get("window");

const Register = () => {
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        department: 1,
        role: "Student", // Đặt giá trị mặc định cho 'role'
        image: "",
    });

    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(null);

    const fields = [
        { key: "username", title: "Username", secure: false, icon: "account-circle", maxLength: 150 },
        { key: "email", title: "Email", secure: false, icon: "email", maxLength: 254 },
        { key: "password", title: "Password", secure: true, icon: "lock", maxLength: 128 },
        { key: "first_name", title: "First Name", secure: false, icon: "account", maxLength: 150 },
        { key: "last_name", title: "Last Name", secure: false, icon: "account", maxLength: 150 },
        { key: "department", title: "Department", secure: false, icon: "office-building" },
    ];

    const updateUser = (value, field) => {
        setUser({ ...user, [field]: value });
    };

    // Hàm tải ảnh lên Cloudinary
    const uploadImageToCloudinary = async (imageUri) => {
        const data = new FormData();
        const fileUri = imageUri.replace("file://", "");
        console.log("File URI:", fileUri);

        data.append("file", {
            uri: fileUri,
            type: "image/jpeg", // Có thể thay đổi tùy theo định dạng ảnh
            name: "profile.jpg",
        });
        data.append("upload_preset", "my_preset"); // Thay 'your_upload_preset' bằng preset của bạn

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/pqbou11/image/upload", {
                method: "POST",
                body: data,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            return result.secure_url; // Trả về URL của ảnh đã upload
        } catch (error) {
            console.error("Upload failed:", error);
            return null;
        }
    };

    // Hàm chọn ảnh từ thư viện
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

    // Hàm đăng ký người dùng
    const register = async () => {
        setLoading(true);
        try {
            const imageUrl = avatar ? await uploadImageToCloudinary(avatar.uri) : "";
            console.log("Image URL:", imageUrl);

            if (!imageUrl && avatar) {
                alert("Image upload failed. Try again!");
                setLoading(false);
                return;
            }

            const form = new FormData();
            const updatedUser = { ...user, image: imageUrl };
            Object.keys(updatedUser).forEach((key) => form.append(key, updatedUser[key]));

            // Gửi yêu cầu đăng ký người dùng
            await APIs.post(endpoints['register'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("User registered:", updatedUser);
            alert("Đăng ký thành công!");

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
                        <TouchableOpacity style={{ marginTop: 10 }} onPress={pickImage}>
                            <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Chọn Ảnh Hồ Sơ</Text>
                        </TouchableOpacity>
                    </View>

                    {avatar && (
                        <View style={{ alignItems: "center", marginVertical: 20 }}>
                            <Text style={{ marginBottom: 10 }}>Ảnh Đã Chọn:</Text>
                            <Image source={{ uri: avatar.uri }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: "#ccc" }} />
                        </View>
                    )}

                    {fields.map(f => (
                        <TextInput key={f.key} label={f.title} right={<TextInput.Icon icon={f.icon} />} secureTextEntry={f.secure} style={{ marginBottom: 15 }} placeholder={f.title} value={user[f.key]} onChangeText={t => updateUser(t, f.key)} mode="outlined" maxLength={f.maxLength} />
                    ))}

                    <Button style={{ marginTop: 20, backgroundColor: '#A2D1F7' }} icon="account-check" mode="contained" onPress={register} loading={loading} disabled={loading}>
                        Đăng Ký
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

export default Register;
