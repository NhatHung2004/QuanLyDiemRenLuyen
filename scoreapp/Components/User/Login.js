import { useContext, useState } from "react";
import { MyDispatchContext } from "../../configs/UserContext";
import APIs, { authApis, endpoints } from "../../configs/APIs";
import { KeyboardAvoidingView, Platform, Dimensions, ImageBackground, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserIcon } from "lucide-react";
import { useNavigation } from "@react-navigation/native";


const { width, height } = Dimensions.get("window");

const Login = () => {
    const [user, setUser] = useState({
        "username": "",
        "password": ""
    });

    const navigation = useNavigation();


    const users = {
        "username": {
            "title": "Tên đăng nhập",
            "field": "username",
            "secure": false,
            "icon": "text"
        },  "password": {
            "title": "Mật khẩu",
            "field": "password",
            "secure": true,
            "icon": "eye"
        }
    }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(""); // Trạng thái để xử lý lỗi
    const dispatch = useContext(MyDispatchContext);

    const updateUser = (value, field) => {
        setUser({...user, [field]: value});
    }

    

    const login = async () => {
        try {
            setLoading(true);

            
            const res = await APIs.post(endpoints['login'], {
                "client_id": "KzMtb3OoKJSPZIBSJu8CidnS1XS0c64f73hXPJB5",
                "client_secret": "i1gbaDd30L9YEhSf7xwOPwVB4c8Xl3uWEiaAeYCZoMVpPZcSo5wkjiSbVZU3pf8EzYce6GNDudcOUKOfkQr9uQhPENCAikyrSJVRkcDPZKGZVYUytkZ38g5F1lAK388f",
                'grant_type': "password",
                ...user
            });
            
            console.info(res.data.user);
            setUser(res.data.user);
            const id = res.data.user.id;
            // Lưu id vào AsyncStorage
            await AsyncStorage.setItem('id', JSON.stringify(id));
            // Lưu token vào AsyncStorage
            await AsyncStorage.setItem('token', res.data.access_token);
            console.log("token1", res.data.access_token);
            // Lưu thông tin của người dùng
            await AsyncStorage.setItem('userInfor', JSON.stringify(res.data.user));
            
            // console.info(res.data.user);

            setTimeout(async () => {
                const token = await AsyncStorage.getItem("token");
                console.info(token);
                const user = await authApis(token).get(endpoints['user'](id));
                await AsyncStorage.setItem('userIf', JSON.stringify(user.data));
            
                dispatch({"type": "login", "payload": user.data});

            }, 500);
           
            
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    

    return (
        <ImageBackground
            source={require("../../assets/log-reg/background-login-register.avif")}
            style={{ width, height, justifyContent: "center", alignItems: "center" }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1, width }}
            >
                <ScrollView
                    contentContainerStyle={{
                        padding: 20,
                        minHeight: height * 0.4,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: 10,
                        marginHorizontal: 10,
                        marginTop: 200
                    }}
                >
                    <Text
                        style={{
                            fontSize: 24,
                            fontWeight: "bold",
                            textAlign: "center",
                            marginBottom: 20
                        }}
                    >
                        Đăng nhập
                    </Text>

                    {Object.values(users).map((u) => (
                        <TextInput
                            key={u.field}
                            label={u.title}
                            right={<TextInput.Icon icon={u.icon} />}
                            secureTextEntry={u.secure}
                            value={user[u.field]}
                            onChangeText={(text) => updateUser(text, u.field)}
                            mode="outlined"
                            style={{ marginBottom: 15 }}
                        />
                    ))}

                    {error ? (
                        <Text style={{ color: "red", textAlign: "center", marginBottom: 15 }}>
                            {error}
                        </Text>
                    ) : null}

                    <Button
                        onPress={() => {
                            login(); // Call the login function
                        }}
                        loading={loading}
                        disabled={loading}
                        style={{ backgroundColor: "#A2D1F7" }}
                        icon="account-check"
                        mode="contained"
                    >
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </Button>
                    {/* Chưa có tài khoản? Đăng ký */}
                    <Text style={{ textAlign: "center", marginTop: 10 }}>
                        Chưa có tài khoản?{" "}
                        <Text
                            style={{ color: "#007AFF", fontWeight: "bold" }}
                            onPress={() => navigation.navigate("Register")}
                        >
                            Đăng ký
                        </Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

export default Login;
