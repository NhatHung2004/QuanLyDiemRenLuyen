import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../../../configs/APIs';

const JoinedActivities = () => {  
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2); 
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchJoinedActivities = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.info("Token", token);

        const response = await authApis(token).get(endpoints['joinedActivities']);
        if (response.status === 200) {
          setJoinedActivities(response.data || []);
          console.info("Joined Activities", response.data);
        } else {
          console.error('Không thể lấy dữ liệu, mã lỗi:', response.status);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách hoạt động:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedActivities();
  }, [navigation]);

  const renderActivity = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.activityName}>{item.title}</Text>
      <Text style={styles.activityDate}>Bắt đầu: {formatDate(item.start_date)}</Text>
      <Text style={styles.activityDate}>Kết thúc: {formatDate(item.end_date)}</Text>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate('ActivityDetail', { item })}>
        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : joinedActivities.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa tham gia hoạt động nào.</Text>
      ) : (
        <FlatList
          data={joinedActivities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivity}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50', 
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 12,
    borderRadius: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5, 
  },
  activityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', 
  },
  activityDate: {
    fontSize: 14,
    color: '#777', 
    marginTop: 4,
  },
  detailButton: {
    marginTop: 15,
    backgroundColor: '#00796B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
});

export default JoinedActivities;
