import { Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, ImageBackground, Dimensions, Image, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import APIs, { authApis, endpoints } from "../../../../configs/APIs";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

const MissingReport = ({ route }) => {

    const { item } = route.params;  

    const [report, setReport] = useState({
        student_id: null, // student_id sẽ được gán sau khi lấy từ AsyncStorage
        evidence: "", // URL của ảnh sau khi upload lên Cloudinary
    });

    const [loading, setLoading] = useState(false);
    const [evidence, setEvidence] = useState(null);  // Changed image to evidence

    // Lấy student_id từ AsyncStorage khi component được load
    useEffect(() => {
        const fetchStudentId = async () => {
            try {
                const studentId = await AsyncStorage.getItem('id');
                console.log("studentId", studentId);
                if (studentId !== null) {
                    setReport(prevReport => ({
                        ...prevReport,
                        student_id: studentId,
                    }));
                }
            } catch (error) {
                console.error("Error fetching student_id from AsyncStorage:", error);
            }
        };

        console.log("item_id", item.id);
        fetchStudentId();
    }, []);

    // Hàm tải ảnh lên Cloudinary
    const uploadEvidenceToCloudinary = async (evidenceUri) => {  // Changed image to evidence
        const data = new FormData();
        const fileUri = evidenceUri.replace("file://", "");  // Changed image to evidence
        console.log("File URI:", fileUri);

        data.append("file", {
            uri: fileUri,
            type: "image/jpeg", // Có thể thay đổi tùy theo định dạng ảnh
            name: "activity.jpg",
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
    const pickEvidence = async () => {  // Changed pickImage to pickEvidence
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
            setEvidence(result.assets[0]);  // Changed image to evidence
        }
    };

    // Hàm báo thiếu hoạt động
    const reportActivity = async () => {
        setLoading(true);
        try {
            const evidenceUrl = evidence ? await uploadEvidenceToCloudinary(evidence.uri) : "";  // Changed image to evidence
            console.log("Evidence URL:", evidenceUrl);

            if (!evidenceUrl && evidence) {  // Changed image to evidence
                alert("Image upload failed. Try again!");  // Changed image to evidence
                setLoading(false);
                return;
            }

            const form = new FormData();
            const updatedReport = { ...report, evidence: evidenceUrl };  // Changed image to evidence
            Object.keys(updatedReport).forEach((key) => form.append(key, updatedReport[key]));

            const activity_id = item.id;

            if (!activity_id) {
                alert("Activity ID is missing.");
                setLoading(false);
                return;
            }

            const token = await AsyncStorage.getItem("token");
            console.log("token", token);
            // Gửi yêu cầu báo thiếu hoạt động
            const endpoint = endpoints['missingReport'](activity_id);  // Truyền activity_id vào endpoint

            console.log("form", form);
            await authApis(token).post(endpoint, form, {
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
                        <TouchableOpacity style={styles.button} onPress={pickEvidence}>  {/* Changed pickImage to pickEvidence */}
                            <Text style={styles.buttonText}>Chọn Ảnh Minh Chứng</Text>
                        </TouchableOpacity>
                    </View>

                    {evidence && (  // Changed image to evidence
                        <View style={styles.imageContainer}>
                            <Text style={styles.imageText}>Ảnh Đã Chọn:</Text>
                            <Image source={{ uri: evidence.uri }} style={styles.selectedImage} />  {/* Changed image to evidence */}
                        </View>
                    )}

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
