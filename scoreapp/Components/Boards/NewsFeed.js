import React, { useContext } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Thêm hook này để điều hướng
import { formatDistanceToNow } from 'date-fns'; // Dùng để format thời gian
import { MyUserContext } from '../../configs/UserContext';

const NewsFeed = () => {
    const navigation = useNavigation(); // Khởi tạo hook điều hướng

    // Mẫu dữ liệu bảng tin
    const newsData = [
        {
            id: '1',
            title: 'Bảng tin 1',
            image: require('../../assets/board/news1.jpeg'),
            timestamp: new Date() - 1000000,
            content: 'Nội dung chi tiết của bảng tin 1. Đây là ví dụ nội dung chi tiết.',
        },
        {
            id: '2',
            title: 'Bảng tin 2',
            image: require('../../assets/board/news2.jpeg'),
            timestamp: new Date() - 20000000,
            content: 'Nội dung chi tiết của bảng tin 2. Đây là một ví dụ minh họa.',
        },
        {
            id: '3',
            title: 'Bảng tin 3',
            image: require('../../assets/board/news3.jpeg'),
            timestamp: new Date() - 50000000,
            content: 'Nội dung chi tiết của bảng tin 3. Đây là thông tin chi tiết hơn.',
        },
    ];

    const userContext = useContext(MyUserContext);
    console.log(userContext.user.username);
    console.log(userContext.isLoggedIn);

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Contents', { item })} // Điều hướng đến DetailScreen và truyền dữ liệu
            >
                <Image source={item.image} style={styles.image} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.timestamp}>
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={newsData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    card: {
        flex: 1,
        margin: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    textContainer: {
        padding: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#777',
        marginTop: 5,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});

export default NewsFeed;
