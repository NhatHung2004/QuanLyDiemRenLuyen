import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Button, Card, Modal, Portal, TextInput, ActivityIndicator } from "react-native-paper";
import { authApis, endpoints } from "../../../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ManageEvents = () => {
  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: "", description: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [token, setToken] = useState(null);

  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day); 
    return date.toISOString(); 
  };

  useEffect(() => {
      fetchActivities();
  }, []);

  const fetchActivities = async (url = endpoints["activities"]) => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);

      if (storedToken) {
        const response = await authApis(storedToken).get(url);
        if (response.status === 200) {
          setActivities(response.data.results);
          setNextPage(response.data.next); // Lưu URL trang tiếp theo
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreActivities = async () => {
    if (!nextPage || loadingMore) return;
    try {
      setLoadingMore(true);
      const response = await authApis(token).get(nextPage);
      if (response.status === 200) {
        setActivities((prevActivities) => [...prevActivities, ...response.data.results]);
        setNextPage(response.data.next); // Cập nhật trang tiếp theo
      }
    } catch (error) {
      console.error("Lỗi khi tải thêm hoạt động:", error);
    } finally {
      setLoadingMore(false);
    }
  };
  

  const addActivity = async () => {
    if (!newActivity.name || !newActivity.description || !newActivity.startDate || !newActivity.endDate) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    try {
      const formattedStartDate = formatDate(newActivity.startDate);
      const formattedEndDate = formatDate(newActivity.endDate);
      console.log(newActivity);

      const id = await AsyncStorage.getItem("id");
      console.log("id", id);
      const response = await authApis(token).post(endpoints["activities"], {
        title: newActivity.name,
        description: newActivity.description,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        created_by: id,
      });
      if (response.status === 201) {
        setActivities([...activities, response.data]);
        setModalVisible(false);
        setNewActivity({ name: "", description: "", startDate: "", endDate: "" });
      }
    } catch (error) {
      console.error("Lỗi khi thêm hoạt động:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f8f9fa" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Quản lý hoạt động</Text>
      <Button mode="contained" icon="plus" onPress={() => setModalVisible(true)}>
        Thêm hoạt động
      </Button>

      {loading ? (
        <ActivityIndicator animating size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={{ marginVertical: 10 }}>
              <Card.Title title={item.title} subtitle={`Người tạo: ${item.created_by}`} />
              <Card.Content>
                <Text>{item.description}</Text>
                <Text>Bắt đầu: {new Date(item.start_date).toLocaleDateString("vi-VN")}</Text>
                <Text>Kết thúc: {new Date(item.end_date).toLocaleDateString("vi-VN")}</Text>
              </Card.Content>
            </Card>
          )}
          onEndReached={loadMoreActivities} // Gọi khi cuộn đến cuối danh sách
          onEndReachedThreshold={0.5} // Gần cuối danh sách 50% thì tải tiếp
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 10 }} /> : null}
        />
      )}

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: "white", padding: 20, margin: 20, borderRadius: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Thêm hoạt động</Text>
          <TextInput label="Tên hoạt động" value={newActivity.name} onChangeText={(text) => setNewActivity({ ...newActivity, name: text })} style={{ marginBottom: 10 }} />
          <TextInput label="Mô tả" value={newActivity.description} onChangeText={(text) => setNewActivity({ ...newActivity, description: text })} style={{ marginBottom: 10 }} />

          {/* Chọn ngày bắt đầu */}
          <TextInput
            label="Ngày bắt đầu (DD/MM/YYYY)"
            value={newActivity.startDate}
            onChangeText={(text) => setNewActivity({ ...newActivity, startDate: text })}
            style={{ marginBottom: 10 }}
          />

          {/* Chọn ngày kết thúc */}
          <TextInput
            label="Ngày kết thúc (DD/MM/YYYY)"
            value={newActivity.endDate}
            onChangeText={(text) => setNewActivity({ ...newActivity, endDate: text })}
            style={{ marginBottom: 10 }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
            <Button mode="contained" onPress={() => setModalVisible(false)} color="grey">
              Hủy
            </Button>
            <Button mode="contained" onPress={addActivity}>Lưu</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default ManageEvents;


