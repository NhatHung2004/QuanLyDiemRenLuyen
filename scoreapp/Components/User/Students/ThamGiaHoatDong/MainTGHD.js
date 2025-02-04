// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
// import { authApis, endpoints } from '../../../../configs/APIs';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';

// const MainTGHD = () => {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [nextPage, setNextPage] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     const fetchTokenAndActivities = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('token');
//         setToken(storedToken);
//         if (storedToken) {
//           fetchActivities(storedToken, endpoints['activities']); // Gọi API trang đầu tiên
//         }
//       } catch (error) {
//         console.error('Lỗi khi tải dữ liệu:', error);
//       }
//     };
//     fetchTokenAndActivities();
//   }, []);

//   // Hàm gọi API phân trang
//   const fetchActivities = async (storedToken, url) => {
//     if (!url || loadingMore) return;

//     setLoadingMore(true);
//     try {
//       const response = await authApis(storedToken).get(url);
//       if (response.status === 200) {
//         setActivities((prev) => [...prev, ...response.data.results]); // Thêm dữ liệu mới vào danh sách cũ
//         setNextPage(response.data.next); // Lưu link trang tiếp theo
//         setHasMore(!!response.data.next); // Kiểm tra còn trang tiếp theo không
//       } else {
//         console.error('Không thể tải danh sách hoạt động:', response);
//       }
//     } catch (error) {
//       console.error('Lỗi khi tải dữ liệu:', error);
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   // Gọi API khi cuộn đến cuối danh sách
//   const loadMore = () => {
//     if (hasMore && token) {
//       fetchActivities(token, nextPage);
//     }
//   };

//   const navigation = useNavigation();

//   const renderActivity = ({ item }) => (
//     <View style={styles.activityRow}>
//       <View style={styles.activityContent}>
//         <Text style={styles.activityName}>{item.title}</Text>
//         <Text style={styles.activityDate}>Bắt đầu: {item.start_date}</Text>
//         <Text style={styles.activityDate}>Kết thúc: {item.end_date}</Text>
//       </View>
//       <TouchableOpacity
//         style={styles.detailButton}
//         onPress={() => navigation.navigate('ActivityDetail', { item })}>
//         <Text style={styles.detailButtonText}>Xem chi tiết</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.headerText}>Danh Sách Hoạt Động</Text>

//       {loading ? (
//         <Text>Đang tải dữ liệu...</Text>
//       ) : activities.length === 0 ? (
//         <Text>Không có hoạt động nào</Text>
//       ) : (
//         <FlatList
//           data={activities}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderActivity}
//           extraData={activities}
//           onEndReached={loadMore} // Gọi loadMore khi cuộn đến cuối danh sách
//           onEndReachedThreshold={0.5} // Gọi khi còn 50% danh sách chưa hiển thị
//           ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#4CAF50" /> : null}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: '#f0f0f0' },
//   headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
//   activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, marginVertical: 8, borderRadius: 8 },
//   activityContent: { flex: 1 },
//   activityName: { fontSize: 18, fontWeight: 'bold' },
//   activityDate: { fontSize: 12, color: '#888', marginTop: 2 },
//   detailButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5 },
//   detailButtonText: { color: 'white', fontSize: 14 },
// });

// export default MainTGHD;

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
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
          fetchActivities(storedToken, endpoints['activities']);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };
    fetchTokenAndActivities();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2); // Lấy ngày, đảm bảo 2 chữ số
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Lấy tháng (tháng bắt đầu từ 0)
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  const fetchActivities = async (storedToken, url) => {
    if (!url || loadingMore) return;

    setLoadingMore(true);
    try {
      const response = await authApis(storedToken).get(url);
      if (response.status === 200) {
        setActivities((prev) => [...prev, ...response.data.results]);
        setNextPage(response.data.next);
        setHasMore(!!response.data.next);
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
        <Text style={styles.activityDate}>Bắt đầu:  {formatDate(item.start_date)}</Text>
        <Text style={styles.activityDate}>Kết thúc: {formatDate(item.end_date)}</Text>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : activities.length === 0 ? (
        <Text style={styles.noDataText}>Không có hoạt động nào</Text>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivity}
          extraData={activities}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#4CAF50" /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f7fb',
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00796B', // Xanh lá cây tươi
    marginBottom: 15,
    textAlign: 'center',
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
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#757575',
    marginTop: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activityDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  detailButton: {
    backgroundColor: '#00796B', // Nút xanh lá cây tươi
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
  },
});

export default MainTGHD;
