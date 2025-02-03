import React, { useState, useEffect } from "react";
import {
    Text,
    ScrollView,
    View,
    ImageBackground,
    Dimensions,
    Image,
    StyleSheet
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const UserProfile = () => {
    const [user, setUser] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        department: "",
        role: "",
        image: "https://via.placeholder.com/150"
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await AsyncStorage.getItem('userInfor');
                if (currentUser) {
                    setUser(JSON.parse(currentUser));
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };
        fetchUser();
    }, []);

    const userFields = [
        { label: "Username", value: user.username },
        { label: "Email", value: user.email },
        { label: "First Name", value: user.first_name },
        { label: "Last Name", value: user.last_name },
        { label: "Department", value: user.department },
        { label: "Role", value: user.role }
    ];

    return (
        <ImageBackground
            source={require('../../assets/log-reg/background-login-register.avif')}
            style={styles.background}
            blurRadius={5} // Làm mờ nền để tăng độ rõ ràng cho nội dung
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>User Profile</Text>

                {/* Ảnh đại diện */}
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: user.image }} style={styles.avatar} />
                </View>

                {/* Hiển thị các thông tin người dùng */}
                {userFields.map((field, index) => (
                    <TextInput
                        key={index}
                        label={field.label}
                        value={field.value}
                        editable={false}
                        mode="outlined"
                        style={styles.input}
                    />
                ))}
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        padding: 20,
        minHeight: height * 0.5,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        width: width * 0.9,
        alignItems: "center",
        marginTop: 30
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: "#007BFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    input: {
        marginBottom: 12,
        width: "100%"
    }
});

export default UserProfile;
