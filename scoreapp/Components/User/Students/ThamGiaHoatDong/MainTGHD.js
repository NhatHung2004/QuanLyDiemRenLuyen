import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { authApis, endpoints } from '../../../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const MainTGHD = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchTokenAndActivities = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
        if (storedToken) {
          fetchActivities(storedToken, endpoints['activities']); // Gọi API trang đầu tiên
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };
    fetchTokenAndActivities();
  }, []);

  // Hàm gọi API phân trang
  const fetchActivities = async (storedToken, url) => {
    if (!url || loadingMore) return;

    setLoadingMore(true);
    try {
      const response = await authApis(storedToken).get(url);
      if (response.status === 200) {
        setActivities((prev) => [...prev, ...response.data.results]); // Thêm dữ liệu mới vào danh sách cũ
        setNextPage(response.data.next); // Lưu link trang tiếp theo
        setHasMore(!!response.data.next); // Kiểm tra còn trang tiếp theo không
      } else {
        console.error('Không thể tải danh sách hoạt động:', response);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Gọi API khi cuộn đến cuối danh sách
  const loadMore = () => {
    if (hasMore && token) {
      fetchActivities(token, nextPage);
    }
  };

  const navigation = useNavigation();

  const renderActivity = ({ item }) => (
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
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivity}
          extraData={activities}
          onEndReached={loadMore} // Gọi loadMore khi cuộn đến cuối danh sách
          onEndReachedThreshold={0.5} // Gọi khi còn 50% danh sách chưa hiển thị
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#4CAF50" /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f0f0' },
  headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, marginVertical: 8, borderRadius: 8 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 18, fontWeight: 'bold' },
  activityDate: { fontSize: 12, color: '#888', marginTop: 2 },
  detailButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5 },
  detailButtonText: { color: 'white', fontSize: 14 },
});

export default MainTGHD;
