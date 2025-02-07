
import { Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, ImageBackground, Dimensions, Image, StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
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
    const [evidence, setEvidence] = useState(null);

    
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

    const uploadEvidenceToCloudinary = async (evidenceUri) => {  
        const data = new FormData();
        const fileUri = evidenceUri.replace("file://", "");  
        console.log("File URI:", fileUri);

        data.append("file", {
            uri: fileUri,
            type: "image/jpeg", 
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
    const pickEvidence = async () => {  
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
            setEvidence(result.assets[0]);  
        }
    };

    // Hàm báo thiếu hoạt động
    const reportActivity = async () => {
        setLoading(true);
        try {
            const evidenceUrl = evidence ? await uploadEvidenceToCloudinary(evidence.uri) : "";  // Changed image to evidence
            console.log("Evidence URL:", evidenceUrl);

            if (!evidenceUrl && evidence) { 
                alert("Image upload failed. Try again!");  
                setLoading(false);
                return;
            }

            const form = new FormData();
            const updatedReport = { ...report, evidence: evidenceUrl };  
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
            console.log("here")
            console.error("Lỗi khi đăng ký hoạt động:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || "Đã xảy ra lỗi, vui lòng thử lại.";
    
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground style={styles.imageBackground}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={pickEvidence}>  
                            <Text style={styles.buttonText}>Chọn Ảnh Minh Chứng</Text>
                        </TouchableOpacity>
                    </View>

                    {evidence && (  
                        <View style={styles.imageContainer}>
                            <Text style={styles.imageText}>Ảnh Đã Chọn:</Text>
                            <Image source={{ uri: evidence.uri }} style={styles.selectedImage} /> 
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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 15,
        justifyContent: 'center',
        margin: 10,
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#007BFF',
        backgroundColor: 'transparent',
    },
    buttonText: {
        color: '#007BFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    imageContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    imageText: {
        marginBottom: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    selectedImage: {
        width: 400,
        height: 200,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    input: {
        marginBottom: 15,
    },
    submitButton: {
        marginTop: 20,
        backgroundColor: '#007BFF',
        borderRadius: 30,
    },
});

export default MissingReport;
