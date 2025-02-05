import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../../../configs/APIs';
import { AntDesign } from '@expo/vector-icons';

const DisciplineScoreUpdate = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scoreData, setScoreData] = useState({});

  const fetchTrainingScores = async () => {
    let allScores = [];
    let nextPage = endpoints['getScores']; // Đặt URL ban đầu cho phân trang
    
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Tiến hành tải tất cả các trang
      while (nextPage) {
        const response = await authApis(token).get(nextPage); // Gọi API với URL phân trang
        
        if (response.status === 200) {
          allScores = [...allScores, ...response.data.results]; // Thêm kết quả vào danh sách
          nextPage = response.data.next; // Cập nhật URL trang tiếp theo
        } else {
          console.error('Lỗi khi tải điểm rèn luyện:', response);
          break;
        }
      }
      
      return allScores; // Trả về tất cả điểm đã tải
    } catch (error) {
      console.error('Lỗi khi tải điểm rèn luyện:', error);
      return [];
    }
  };
  

  const fetchUsers = async (url) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userResponse = await authApis(token).get(url);
      if (userResponse.status === 200) {
        const users = userResponse.data.results.filter(user => user.role === "Student");
  
        // Lấy điểm rèn luyện cho tất cả sinh viên
        const trainingScores = await fetchTrainingScores();
        console.log("trainingScores", trainingScores);
  
        // Kết hợp điểm vào thông tin sinh viên
        const usersWithScores = users.map(user => {
          const userScore = trainingScores.find(score => score.student === user.id);
          return {
            ...user,
            hasScore: !!userScore,
            scoreData: userScore ? userScore.scores : { "Điều 1": "", "Điều 2": "", "Điều 3": "", "Điều 4": "" }
          };
        });
  
        setUsers(prevUsers => [...prevUsers, ...usersWithScores]);
        setNextPage(userResponse.data.next);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sinh viên:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  

  useEffect(() => {
    fetchUsers(endpoints['users']);
  }, []);

  const handleLoadMore = () => {
    if (nextPage && !loadingMore) {
      setLoadingMore(true);
      fetchUsers(nextPage);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    // Điền điểm vào modal từ state đã lưu
    setScoreData(user.scoreData);
    setModalVisible(true);
  };
  

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleInitializeScore = async (user) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await authApis(token).post(endpoints['initScores'], {
        "term": "HK1-2024-2025",
        "scores": { "Điều 1": 0, "Điều 2": 0, "Điều 3": 0, "Điều 4": 0 },
        "total_score": 0,
        "classification": "Chưa có",
        "student": user.id
      });

      if (response.status === 201) {
        alert('Điểm rèn luyện đã được khởi tạo!');
        setUsers(prevUsers => prevUsers.map(u => (u.id === user.id ? { ...u, hasScore: true } : u)));
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo điểm:', error);
    }
  };

  const handleUpdateScore = async () => {
    if (!selectedUser) return;
    try {
      const token = await AsyncStorage.getItem('token');

      // Kiểm tra điểm trước khi gửi
      const isValidScores = Object.keys(scoreData).every(key => {
        const score = Number(scoreData[key]);
        return score >= 0 && score <= 25; // Kiểm tra điểm nằm trong khoảng 0-25
      });

      if (!isValidScores) {
        alert('Điểm không hợp lệ. Các điểm phải nằm trong khoảng 0 đến 25.');
        return;
      }

      // Chuyển đổi điểm thành số (nếu chưa phải là số)
      const sanitizedScores = Object.keys(scoreData).reduce((acc, key) => {
        acc[key] = isNaN(Number(scoreData[key])) ? 0 : Number(scoreData[key]);
        return acc;
      }, {});

      console.log("Dữ liệu gửi lên:", {
        "student_id": selectedUser.id,
        "scores": sanitizedScores,
        "term": "HK1-2024-2025"
      });

      const response = await authApis(token).patch(endpoints['updateScores'], {
        "student_id": selectedUser.id,
        "scores": sanitizedScores,
        "term": "HK1-2024-2025"
      });

      if (response.status === 200) {
        alert('Điểm rèn luyện đã được cập nhật!');
      }
    } catch (error) {
      if (error.response) {
        console.error('Lỗi khi cập nhật điểm:', error.response.data);
      } else {
        console.error('Lỗi khi cập nhật điểm:', error.message);
      }
    } finally {
      closeModal();
    }
};



  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userId}>ID: {item.id}</Text>
              {item.hasScore ? (
                <TouchableOpacity style={styles.updateButton} onPress={() => openModal(item)}>
                  <Text style={styles.updateButtonText}>Cập nhật điểm rèn luyện</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.initializeButton} onPress={() => handleInitializeScore(item)}>
                  <Text style={styles.initializeButtonText}>Khởi tạo điểm</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore && <ActivityIndicator size="large" color="#4CAF50" />}
        />
      )}

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nhập điểm rèn luyện</Text>
              <TouchableOpacity onPress={closeModal}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            {Object.keys(scoreData).map((key) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={`Nhập điểm cho ${key}`}
                keyboardType="numeric"
                value={scoreData[key].toString()} // Hiển thị điểm hiện tại
                onChangeText={(text) => setScoreData({ ...scoreData, [key]: text })}
              />
            ))}
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateScore}>
              <Text style={styles.saveButtonText}>Lưu điểm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  card: { backgroundColor: 'white', padding: 20, marginVertical: 12, borderRadius: 12, elevation: 5 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  updateButton: { backgroundColor: '#FF9800', padding: 12, borderRadius: 8, marginTop: 15 },
  updateButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  initializeButton: { backgroundColor: '#00CC00', padding: 12, borderRadius: 8, marginTop: 15 },
  initializeButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginHorizontal: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 10, fontSize: 16 },
  saveButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginTop: 15 },
  saveButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});

export default DisciplineScoreUpdate;

