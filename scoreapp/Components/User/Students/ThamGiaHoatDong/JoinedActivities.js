import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../../../configs/APIs';

const JoinedActivities = () => {
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
      <Text style={styles.activityDate}>Bắt đầu: {item.start_date}</Text>
      <Text style={styles.activityDate}>Kết thúc: {item.end_date}</Text>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate('ActivityDetail', { activity: item })}>
        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
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
    backgroundColor: '#f0f0f0',
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
  activityDate: {
    fontSize: 14,
    color: '#555',
  },
  detailButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  detailButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default JoinedActivities;
