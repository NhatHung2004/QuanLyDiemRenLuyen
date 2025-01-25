import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Dialog, Portal, Button, Menu, IconButton } from 'react-native-paper';

const HDThamGia = () => {
    // Mẫu dữ liệu hoạt động đã tham gia
    const activities = [
        { id: '1', name: 'Hội thảo phát triển kỹ năng', date: '01/10/2023' },
        { id: '2', name: 'Lớp học lập trình React Native', date: '10/11/2023' },
        { id: '3', name: 'Chuyến dã ngoại cuối tuần', date: '15/12/2023' },
        { id: '4', name: 'Buổi đào tạo Python cơ bản', date: '05/01/2024' },
        { id: '5', name: 'Hội nghị công nghệ quốc tế', date: '20/12/2023' },
    ];

    const [visible, setVisible] = useState(false);  // Trạng thái của dialog
    const [selectedActivity, setSelectedActivity] = useState(null); // Hoạt động được chọn
    const [menuVisible, setMenuVisible] = useState(false); // Trạng thái menu

    // Hàm hiển thị dialog với thông tin hoạt động
    const showDialog = (activity) => {
        setSelectedActivity(activity);
        setVisible(true);
    };

    // Hàm ẩn dialog
    const hideDialog = () => setVisible(false);

    // Mở/đóng menu
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Các hoạt động tham gia</Text>
            {activities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                    <View style={styles.activityInfo}>
                        <View style={styles.activityText}>
                            <Text style={styles.activityName}>{activity.name}</Text>
                            <Text style={styles.activityDate}>Ngày đăng ký: {activity.date}</Text>
                        </View>

                        {/* Biểu tượng 3 chấm */}
                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}
                            anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
                        >
                            <Menu.Item onPress={() => showDialog(activity)} title="Xem chi tiết" />
                            <Menu.Item onPress={() => alert('Xoá hoạt động')} title="Xoá hoạt động" />
                        </Menu>
                    </View>
                </View>
            ))}

            {/* Dialog hiển thị chi tiết thông tin */}
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Chi tiết hoạt động</Dialog.Title>
                    <Dialog.Content>
                        {selectedActivity && (
                            <>
                                <Text style={styles.dialogText}>Tên hoạt động: {selectedActivity.name}</Text>
                                <Text style={styles.dialogText}>Ngày đăng ký: {selectedActivity.date}</Text>
                            </>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Đóng</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#f0f4f8',
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    activityInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activityText: {
        flex: 1,
    },
    activityName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4b4b4b',
        marginBottom: 5,
    },
    activityDate: {
        fontSize: 14,
        color: '#888',
    },
    dialogText: {
        fontSize: 16,
        color: '#4b4b4b',
        marginBottom: 10,
    },
});

export default HDThamGia;
