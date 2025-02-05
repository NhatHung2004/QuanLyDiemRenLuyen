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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2); 
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchComments();
    checkJoinedStatus();
    // console.log("item", item);
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

      if (response.status === 200) {
        Alert.alert("Thành công", "Bạn đã đăng ký hoạt động thành công!");
        setJoined(true); // Cập nhật trạng thái đã tham gia
      } else {
        Alert.alert("Lỗi", "Đăng ký không thành công, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký hoạt động:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || "Đã xảy ra lỗi, vui lòng thử lại.";

      Alert.alert("Lỗi", errorMessage);
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
        navigation.navigate("JoinedActivities");
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
          <Text style={styles.date}>📅 Start Date: {formatDate(item.start_date)}</Text>
          <Text style={styles.date}>⏳ End Date: {formatDate(item.end_date)}</Text>
  
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
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',  // Nền sáng, nhẹ nhàng
    padding: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5', // Màu xanh đậm dễ nhìn
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#616161', // Màu chữ tối nhẹ
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  date: {
    fontSize: 14,
    color: '#1976D2', // Màu xanh lam
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  commentSection: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    marginTop: 20,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',  // Màu nền nhẹ cho comment
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#616161',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 25,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '85%',
    alignItems: 'center',
    marginTop: 15,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});


export default ActivityDetail;



