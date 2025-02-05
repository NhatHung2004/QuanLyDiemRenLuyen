import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { authApis, endpoints } from '../../../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';

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
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
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
        <Text style={styles.activityDate}>📅 Bắt đầu: {formatDate(item.start_date)}</Text>
        <Text style={styles.activityDate}>⏳ Kết thúc: {formatDate(item.end_date)}</Text>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : activities.length === 0 ? (
        <Text style={styles.noDataText}>🚫 Không có hoạt động nào</Text>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivity}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#4CAF50" /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#00796B',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#00796B',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#757575',
    marginTop: 20,
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detailButton: {
    backgroundColor: '#00796B',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  detailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MainTGHD;
