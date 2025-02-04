import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';



const Events = () => {
    const navigation = useNavigation();
    // Mẫu dữ liệu với màu nền, hình ảnh và các thông tin của danh mục
    const categories = [
        { 
            id: '1', 
            title: 'Xem hoạt động tham gia', 
            image: require('../../../assets/SinhVien/study-points.png'), // Hình ảnh của danh mục
            backgroundColor: '#FFB6C1', // Màu nền đỏ nhạt
            onPress: () => navigation.navigate('JoinedActivities') // Chuyển hướng đến m
        },
        { 
            id: '2', 
            title: 'Xem điểm rèn luyện', 
            image: require('../../../assets/SinhVien/activity.jpg'), 
            backgroundColor: '#FF8C00', // Màu nền cam
            onPress: () => navigation.navigate('DisciplineScore') // Chuyển hướng đến m
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.row}>
                {categories.map((category, index) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.card, { backgroundColor: category.backgroundColor }]} // Áp dụng màu nền riêng
                        onPress={category.onPress}
                    >
                        <View style={styles.imageContainer}>
                            <Image source={category.image} style={styles.image} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardText}>{category.title}</Text>
                        </View>
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
        flexWrap: 'wrap', // Cho phép các mục xuống dòng khi hết chỗ
        justifyContent: 'space-between', // Tạo khoảng cách đều giữa các mục
    },
    card: {
        width: '48%', // Mỗi mục chiếm 48% chiều rộng của một hàng (2 mục trên 1 hàng)
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden', // Đảm bảo hình ảnh và nội dung không bị tràn ra ngoài thẻ
        elevation: 3, // Tạo bóng cho thẻ
    },
    imageContainer: {
        width: '100%',
        height: 150, // Giảm chiều cao của hình ảnh xuống 100px
        backgroundColor: '#fff', // Đặt màu nền trắng cho hình ảnh
        borderRadius: 10, // Bo góc cho phần hình ảnh
        overflow: 'hidden', // Giới hạn hình ảnh trong khung vuông
    },
    image: {
        width: '100%', // Đảm bảo hình ảnh chiếm toàn bộ chiều rộng của container
        height: '100%', // Chiều cao bằng với chiều cao của container
        resizeMode: 'cover', // Đảm bảo hình ảnh không bị méo và bao phủ hết vùng chứa
    },
    textContainer: {
        padding: 10,
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
});


export default Events;
