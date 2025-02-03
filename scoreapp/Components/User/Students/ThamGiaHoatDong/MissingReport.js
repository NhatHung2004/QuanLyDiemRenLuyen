import { Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, ImageBackground, Dimensions, Image, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../../../configs/APIs";

const { width, height } = Dimensions.get("window");

const MissingReport = () => {
    const [report, setReport] = useState({
        title: "",
        description: "",
        image: "", // URL của ảnh sau khi upload lên Cloudinary
    });

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);

    // Hàm tải ảnh lên Cloudinary
    const uploadImageToCloudinary = async (imageUri) => {
        const data = new FormData();
        const fileUri = imageUri.replace("file://", "");
        console.log("File URI:", fileUri);

        data.append("file", {
            uri: fileUri,
            type: "image/jpeg", // Có thể thay đổi tùy theo định dạng ảnh
            name: "activity.jpg",
        });
        data.append("upload_preset", "your_upload_preset"); // Thay 'your_upload_preset' bằng preset của bạn

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
        console.log("here");

        const result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // Hàm báo thiếu hoạt động
    const reportActivity = async () => {
        setLoading(true);
        try {
            const imageUrl = image ? await uploadImageToCloudinary(image.uri) : "";
            console.log("Image URL:", imageUrl);

            if (!imageUrl && image) {
                alert("Image upload failed. Try again!");
                setLoading(false);
                return;
            }

            const form = new FormData();
            const updatedReport = { ...report, image: imageUrl };
            Object.keys(updatedReport).forEach((key) => form.append(key, updatedReport[key]));

            // Gửi yêu cầu báo thiếu hoạt động
            await APIs.post(endpoints['report_missing_activity'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("Activity reported:", updatedReport);
            alert("Báo thiếu hoạt động thành công!");

        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground style={styles.imageBackground}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={pickImage}>
                            <Text style={styles.buttonText}>Chọn Ảnh Minh Chứng</Text>
                        </TouchableOpacity>
                    </View>

                    {image && (
                        <View style={styles.imageContainer}>
                            <Text style={styles.imageText}>Ảnh Đã Chọn:</Text>
                            <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                        </View>
                    )}

                    <TextInput 
                        label="Tiêu Đề Báo Cáo" 
                        style={styles.input} 
                        placeholder="Nhập tiêu đề báo cáo" 
                        value={report.title} 
                        onChangeText={(text) => setReport({ ...report, title: text })} 
                        mode="outlined" 
                    />
                    
                    <TextInput 
                        label="Mô Tả Báo Cáo" 
                        style={styles.input} 
                        placeholder="Nhập mô tả báo cáo" 
                        value={report.description} 
                        onChangeText={(text) => setReport({ ...report, description: text })} 
                        mode="outlined" 
                    />

                    <Button 
                        style={styles.submitButton} 
                        icon="send" 
                        mode="contained" 
                        onPress={reportActivity} 
                        loading={loading} 
                        disabled={loading}>
                        Gửi Báo Cáo
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    imageBackground: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        width,
    },
    scrollViewContainer: {
        padding: 20,
        minHeight: height * 0.4,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 10,
        justifyContent: 'center',
        margin: 10,
        marginTop: 30,
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        marginTop: 10,
    },
    buttonText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    imageContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    imageText: {
        marginBottom: 10,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    input: {
        marginBottom: 15,
    },
    submitButton: {
        marginTop: 20,
        backgroundColor: '#A2D1F7',
    },
});

export default MissingReport;
