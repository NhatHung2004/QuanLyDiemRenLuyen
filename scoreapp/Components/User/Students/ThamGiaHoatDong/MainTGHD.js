import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authApis, endpoints } from '../../../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const MainTGHD = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchTokenAndActivities = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);

        if (storedToken) {
          const response = await authApis(storedToken).get(endpoints['activities']);
          if (response.status === 200) {
            setActivities(response.data.results);
          } else {
            console.error('Không thể tải danh sách hoạt động:', response);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTokenAndActivities();
  }, []);

  const openModal = (activity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedActivity(null);
    setModalVisible(false);
  };

  const navigation = useNavigation();

  const renderActivity = ({ item }) => (
    console.log("item", item),
    <View style={styles.activityRow}>
      <View style={styles.activityContent}>
        <Text style={styles.activityName}>{item.title}</Text>
        <Text style={styles.activityDate}>Bắt đầu: {item.start_date}</Text>
        <Text style={styles.activityDate}>Kết thúc: {item.end_date}</Text>
      </View>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate('ActivityDetail', { item })}>
        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Danh Sách Hoạt Động</Text>

      {loading ? (
        <Text>Đang tải dữ liệu...</Text>
      ) : activities.length === 0 ? (
        <Text>Không có hoạt động nào</Text>
      ) : (
        <FlatList
            data={activities}
            numColumns={1} // Số cột cố định
            key={1} // Thay đổi giá trị key nếu numColumns thay đổi
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderActivity}
            extraData={activities}
            />

      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedActivity && (
              <>
                <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
                <Text style={styles.modalDescription}>{selectedActivity.description}</Text>
                <Text style={styles.modalDate}>Bắt đầu: {selectedActivity.start_date}</Text>
                <Text style={styles.modalDate}>Kết thúc: {selectedActivity.end_date}</Text>
                <Text style={styles.modalDate}>Người tạo: {selectedActivity.created_by}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  detailButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  detailButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default MainTGHD;
