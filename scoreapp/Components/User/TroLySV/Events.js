import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Events = () => {
    const navigation = useNavigation();

    // Dữ liệu các danh mục
    const categories = [
        { 
            id: '1', 
            title: 'Quản lý tài khoản', 
            image: require('../../../assets/TLSinhVien/manager-account2.webp'),
            backgroundColor: '#FFB6C1',
            onPress: () => alert('Đi đến hoạt động tham gia')
        },
        { 
            id: '2', 
            title: 'Thống kê điểm rèn luyện', 
            image: require('../../../assets/TLSinhVien/staticss.jpg'),
            backgroundColor: '#FF8C00',
            onPress: () => alert('Đi đến điểm rèn luyện')
        },
        { 
            id: '3', 
            title: 'Quản lý hoạt động', 
            image: require('../../../assets/TLSinhVien/manager-activity.webp'),
            backgroundColor: '#D3D3D3',
            onPress: () => navigation.navigate('ManageEvents'), 
        },
        { 
            id: '4', 
            title: 'Quản lý báo thiếu', 
            image: require('../../../assets/TLSinhVien/manager-missing-report.jpg'),
            backgroundColor: '#90EE90',
            onPress: () => navigation.navigate('MissingReportActivities'), // Sử dụng đúng tên màn hình
        },
        { 
            id: '5', 
            title: 'Quản lý danh sách sinh viên', 
            image: require('../../../assets/TLSinhVien/manager-list-student.jpg'),
            backgroundColor: '#FFFACD',
            onPress: () => alert('Đi đến hoạt động tham gia')
        },
        { 
            id: '6', 
            title: 'Cập nhật điểm rèn luyện', 
            image: require('../../../assets/TLSinhVien/update-points.jpg'),
            backgroundColor: '#ADD8E6',
            onPress: () => alert('Đi đến điểm rèn luyện')
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.row}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.card, { backgroundColor: category.backgroundColor }]}
                        onPress={category.onPress}
                    >
                        <View style={styles.imageContainer}>
                            <Image source={category.image} style={styles.image} />
                        </View>
                        <Text style={styles.cardText}>{category.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
    },
    card: {
        width: '48%', 
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden', 
        elevation: 3, 
    },
    imageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#fff', 
        borderRadius: 10, 
        overflow: 'hidden', 
    },
    image: {
        width: '100%', 
        height: '100%', 
        resizeMode: 'cover', 
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        padding: 10,
    },
});

export default Events;
