import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Dialog, Portal, Button, IconButton } from 'react-native-paper';

const BaoThieu = () => {
    // Dữ liệu giả hoạt động và sinh viên yêu cầu kiểm tra
    const activities = [
        { id: '1', name: 'Hội thảo phát triển kỹ năng' },
        { id: '2', name: 'Lớp học lập trình React Native' },
        { id: '3', name: 'Chuyến dã ngoại cuối tuần' },
        { id: '4', name: 'Buổi đào tạo Python cơ bản' },
        { id: '5', name: 'Hội nghị công nghệ quốc tế' },
    ];

    const studentRequests = [
        { id: '1', studentName: 'Nguyễn Văn A', activity: 'Hội thảo phát triển kỹ năng', date: '10/01/2024' },
        { id: '2', studentName: 'Lê Thị B', activity: 'Lớp học lập trình React Native', date: '11/01/2024' },
        { id: '3', studentName: 'Trần Văn C', activity: 'Buổi đào tạo Python cơ bản', date: '12/01/2024' },
    ];

    const [searchQuery, setSearchQuery] = useState(''); // Truy vấn tìm kiếm
    const [filteredActivities, setFilteredActivities] = useState([]); // Kết quả tìm kiếm
    const [selectedActivity, setSelectedActivity] = useState(null); // Hoạt động đã chọn
    const [visible, setVisible] = useState(false); // Hiển thị dialog chi tiết

    // Hàm tìm kiếm hoạt động
    const searchActivities = () => {
        const results = activities.filter((activity) =>
            activity.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredActivities(results);
    };

    // Hiển thị chi tiết yêu cầu kiểm tra lại
    const showDialog = (activity) => {
        setSelectedActivity(activity);
        setVisible(true);
    };

    // Đóng dialog
    const hideDialog = () => {
        setVisible(false);
        setSelectedActivity(null);
    };

    return (
        <View style={styles.container}>
            {/* Thanh tìm kiếm */}
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nhập hoạt động"
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
                <TouchableOpacity style={styles.searchButton} onPress={searchActivities}>
                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                </TouchableOpacity>
            </View>

            {/* Kết quả tìm kiếm hoạt động */}
            <ScrollView style={styles.searchResults}>
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                        <TouchableOpacity
                            key={activity.id}
                            style={styles.activityCard}
                            onPress={() => showDialog(activity)}
                        >
                            <Text style={styles.activityName}>{activity.name}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noResults}>Không có hoạt động nào phù hợp</Text>
                )}
            </ScrollView>

            {/* Danh sách sinh viên yêu cầu kiểm tra lại */}
            <ScrollView style={styles.studentRequests}>
                <Text style={styles.title}>Danh sách yêu cầu kiểm tra</Text>
                {studentRequests.map((request) => (
                    <View key={request.id} style={styles.requestCard}>
                        <Text style={styles.studentName}>Sinh viên: {request.studentName}</Text>
                        <Text style={styles.activityText}>Hoạt động: {request.activity}</Text>
                        <Text style={styles.dateText}>Ngày yêu cầu: {request.date}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Dialog chi tiết hoạt động */}
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Chi tiết hoạt động</Dialog.Title>
                    <Dialog.Content>
                        {selectedActivity && (
                            <Text style={styles.dialogText}>Tên hoạt động: {selectedActivity.name}</Text>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Đóng</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 5,
    },
    searchButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    searchResults: {
        maxHeight: 150, // Giới hạn chiều cao của danh sách kết quả
        marginBottom: 20,
    },
    activityCard: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    activityName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    noResults: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    studentRequests: {
        flex: 1,
    },
    requestCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 3,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    activityText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 14,
        color: '#888',
    },
    dialogText: {
        fontSize: 16,
        color: '#333',
    },
});

export default BaoThieu;
