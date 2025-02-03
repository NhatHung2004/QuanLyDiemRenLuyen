import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  TextInput, FlatList, Image, ActivityIndicator, 
  ScrollView 
} from 'react-native';
import APIs, { authApis, endpoints } from '../../../../configs/APIs';
import { useNavigation } from '@react-navigation/native';

const ActivityDetail = ({ route }) => {
  const { item } = route.params;  

  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState([]);
  const [joined, setJoined] = useState(false); // Kiểm tra đã tham gia chưa
  const navigation = useNavigation();

  useEffect(() => {
    fetchComments();
    checkJoinedStatus();
  });

  const fetchComments = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if (storedToken) {
        const response = await authApis(storedToken).get(endpoints['comments'](item.id));
        if (response.status === 200) {
          const commentsData = response.data;
          const updatedComments = await Promise.all(commentsData.map(async (comment) => {
            const userResponse = await authApis(storedToken).get(endpoints['user'](comment.user));
            if (userResponse.status === 200) {
              return {
                ...comment,
                userDetail: userResponse.data
              };
            }
            return comment;
          }));

          setComments(updatedComments);
        } else {
          console.error('Không thể tải comment:', response);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkJoinedStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) return;

      const response = await authApis(token).get(endpoints['joinedActivities']);
      
      if (response.status === 200) {
        const joinedActivities = response.data;
        setJoined(joinedActivities.some(activity => activity.id === item.id));
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra hoạt động đã tham gia:", error);
    }
  };

  const handleAddComment = async () => {
    try {
      const userId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");

      if (!comment.trim()) return;

      const newComment = {
        content: comment,
        created_at: new Date().toISOString(),
        user: userId,
        activity: item.id,
      };

      const res = await authApis(token).post(endpoints['createComment'](item.id), newComment);

      if (res.status === 200) {
        setComments([...comments, res.data]); 
        setComment('');
        Alert.alert("Thành công", "Bình luận của bạn đã được gửi.");
      } else {
        Alert.alert("Lỗi", "Không thể gửi bình luận.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi bình luận.");
    }
  };

  const handleRegisterActivity = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const studentId = await AsyncStorage.getItem("id");

      if (!token || !studentId) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để tham gia hoạt động.");
        return;
      }

      const registerData = {
        activity_id: parseInt(item.id, 10),
        student_id: parseInt(studentId, 10),
      };

      const response = await authApis(token).post(endpoints['registerActivity'], registerData);

      if (response.status === 201) {
        Alert.alert("Thành công", "Bạn đã đăng ký hoạt động thành công!");
        setJoined(true); // Cập nhật trạng thái đã tham gia
      } else {
        Alert.alert("Lỗi", "Đăng ký không thành công, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký hoạt động:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng ký hoạt động.");
    }
  };

  const handleCancelActivity = async () => {
    try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            Alert.alert("Lỗi", "Bạn cần đăng nhập để huỷ tham gia.");
            return;
        }

        console.log("Huỷ tham gia hoạt động ID:", item.id);

        const response = await authApis(token).request({
            method: "DELETE",
            url: endpoints['cancelActivity'],
            data: { activity_id: item.id }, // Gửi activity_id trong body
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("response", response.status)

        if (response.status === 200) {
            Alert.alert("Huỷ thành công", "Bạn đã huỷ tham gia hoạt động.");
            setJoined(false);
        } else {
            Alert.alert("Lỗi", "Huỷ không thành công, vui lòng thử lại.");
        }
    } catch (error) {
        console.error("Lỗi khi huỷ tham gia hoạt động:", error.response?.data || error.message);
        Alert.alert("Lỗi", error.response?.data?.message || "Đã xảy ra lỗi khi huỷ tham gia hoạt động.");
    }
  };

  const handleReportMissingActivity = () => {
    navigation.navigate('MissingReport', {item});
  }

  return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>📅 Bắt đầu: {new Date(item.start_date).toLocaleDateString()}</Text>
          <Text style={styles.date}>⏳ Kết thúc: {new Date(item.end_date).toLocaleDateString()}</Text>
          <Text style={styles.createdBy}>👤 Người tạo: {item.created_by}</Text>
  
          {joined ? (
            <>
              <TouchableOpacity style={[styles.button, styles.disabledButton]}>
                <Text style={styles.buttonText}>Đã tham gia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelActivity}>
                <Text style={styles.cancelButtonText}>Huỷ tham gia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportButton} onPress={handleReportMissingActivity}>
                  <Text style={styles.reportButtonText}>Báo thiếu hoạt động</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegisterActivity}>
              <Text style={styles.buttonText}>Tham gia Hoạt Động</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
  
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>💬 Bình luận</Text>
  
          {loading ? (
            <ActivityIndicator size="large" color="#1976D2" />
          ) : (
            <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Image 
                  source={{ uri: item.userDetail?.image || "https://via.placeholder.com/40" }} 
                  style={styles.avatar} 
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentUsername}>{item.userDetail?.username || "Người dùng ẩn danh"}</Text>
                  <Text style={styles.commentText}>{item.content}</Text>
                  <Text style={styles.commentTime}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
              </View>
            )}
            style={{ maxHeight: 300 }} 
            keyboardShouldPersistTaps="handled"
          />
          )}

        {/* Ô nhập bình luận */}
        
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Viết bình luận..."
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', padding: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5, alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1976D2', marginBottom: 10, textAlign: 'center' },
  description: { fontSize: 16, color: '#333', marginBottom: 15, textAlign: 'center' },
  date: { fontSize: 14, color: '#555', marginBottom: 5, textAlign: 'center' },
  createdBy: { fontSize: 14, color: '#777', fontStyle: 'italic', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#2196F3', padding: 12, borderRadius: 25, width: '80%', alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  disabledButton: { backgroundColor: '#B0BEC5' },
  cancelButton: { backgroundColor: '#F44336', padding: 12, borderRadius: 25, width: '80%', alignItems: 'center', marginTop: 10 },
  cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  commentSection: { backgroundColor: '#fff', borderRadius: 15, padding: 15, elevation: 3 },
  commentTitle: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginBottom: 10 },
  commentItem: { flexDirection: 'row', backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8, marginBottom: 5, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  commentContent: { flex: 1 },
  commentUsername: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  commentText: { fontSize: 14, color: '#333', marginTop: 2 },
  commentTime: { fontSize: 12, color: '#777', marginTop: 2 },
  commentInputContainer: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#CCC', borderRadius: 20, padding: 10, fontSize: 14, backgroundColor: '#FFF' },
  sendButton: { marginLeft: 10, backgroundColor: '#2196F3', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20 },
  sendButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  reportButton: { backgroundColor: '#FF9800', padding: 12, borderRadius: 25, width: '80%', alignItems: 'center', marginTop: 10 },
  reportButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

export default ActivityDetail;
