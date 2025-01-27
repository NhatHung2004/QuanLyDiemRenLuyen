import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, FlatList } from 'react-native';
import { Plus, Edit, Trash } from 'lucide-react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authApis, endpoints } from '../../../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageEvents = () => {
  const [activities, setActivities] = useState([
    {
      id: '1',
      title: 'Ngày hội Đoàn viên',
      description: 'Tham gia đóng góp ý tưởng và hoạt động sôi nổi.',
      start_date: '2025-02-01',
      end_date: '2025-02-05',
      created_by: '1'
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', description: '', startDate: '', endDate: '', createdBy: '' });
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
        console.log('Token1:', storedToken);

        if (storedToken) {
          const response = await authApis(storedToken).get(endpoints['activities']);
          console.log('Response:', response.data);
          if(response.status === 200) {
            setActivities(response.data.results);
            console.log("Hoạt động:", activities);
          } else {
            console.error('Không thể tải danh sách hoạt động:', response);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }finally{
        setLoading(false);
      }
    };
    fetchToken();
  }, []);


  const addActivity = async () => {
    if (newActivity.name && newActivity.description && newActivity.startDate && newActivity.endDate) {
      // Chuyển đổi ngày tháng sang định dạng ISO 8601
      const startDateISO = new Date(newActivity.startDate).toISOString();
      const endDateISO = new Date(newActivity.endDate).toISOString();
      const id = await AsyncStorage.getItem('id');
      
  
      const activityData = {
        title: newActivity.name,
        description: newActivity.description,
        start_date: startDateISO,
        end_date: endDateISO,
        created_by: id
      };
  
      try {
        console.log('Token:', token); 
        console.log('Dữ liệu gửi lên server:', activityData);
        const response = await authApis(token).post(endpoints['activities'], activityData);
  
        if (response.status === 201) {
          const updatedActivities = await authApis(token).get(endpoints['activities']);
          setActivities(updatedActivities.data);
          setModalVisible(false);
          setNewActivity({ name: '', description: '', startDate: '', endDate: '' });
        } else {
          alert('Không thể thêm hoạt động. Vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Lỗi khi thêm hoạt động:', error);
      }
    } else {
      alert('Vui lòng điền đầy đủ thông tin!');
    }
  };
  

  const deleteActivity = (id) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const handleDateChange = (date, field) => {
    setNewActivity({ ...newActivity, [field]: date });
  };

  const renderActivity = ({ item }) => {
    console.log(item); // In ra item để kiểm tra cấu trúc dữ liệu
    return (
      <View style={styles.card}>
        <Text style={styles.activityName}>{item.title}</Text> {/* Thay đổi từ item.name thành item.title */}
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityDate}>Bắt đầu: {item.start_date}</Text>
        <Text style={styles.activityDate}>Kết thúc: {item.end_date}</Text>
        <Text style={styles.activityDate}>Người tạo: {item.created_by}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => alert(`Editing ${item.title}`)}>
            <Icon name='edit' size={18} color="white" />
            <Text style={styles.buttonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteActivity(item.id)}>
            <Icon name='delete' size={18} color="white" />
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Quản lý hoạt động</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Icon name="add" size={20} color="white" style={styles.icon} />
          <Text style={styles.addButtonText}>Thêm hoạt động</Text>
        </TouchableOpacity>
      </View>

      

      {loading ? (
        <Text>Đang tải dữ liệu...</Text>
      ) : activities.length === 0 ? (
        <Text>Không có hoạt động nào</Text> // Thông báo nếu không có hoạt động
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}  // Đảm bảo sử dụng id hợp lệ
          renderItem={renderActivity}
        />
      )}


      {/* Modal for Adding Activity */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Thêm hoạt động mới</Text>
          <TextInput
            placeholder="Tên hoạt động"
            value={newActivity.name}
            onChangeText={(text) => setNewActivity({ ...newActivity, name: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Mô tả"
            value={newActivity.description}
            onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
            style={styles.input}
          />
          <Text>Ngày bắt đầu (YYYY-MM-DD):</Text>
          <TextInput
            placeholder="Nhập ngày bắt đầu"
            value={newActivity.startDate}
            onChangeText={(text) => handleDateChange(text, 'startDate')}
            style={styles.input}
          />
          <Text>Ngày kết thúc (YYYY-MM-DD):</Text>
          <TextInput
            placeholder="Nhập ngày kết thúc"
            value={newActivity.endDate}
            onChangeText={(text) => handleDateChange(text, 'endDate')}
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={addActivity}>
              <Text style={styles.buttonText}>Lưu</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
  },
  icon: {
    fontSize: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 14,
    color: '#555',
  },
  activityDate: {
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});

export default ManageEvents;
