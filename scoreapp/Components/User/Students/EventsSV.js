import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Events = () => {
    const navigation = useNavigation();
    const categories = [
        { 
            id: '1', 
            title: 'Xem hoạt động tham gia', 
            image: require('../../../assets/SinhVien/study-points.png'), 
            backgroundColor: '#FFB6C1', 
            onPress: () => navigation.navigate('JoinedActivities') 
        },
        { 
            id: '2', 
            title: 'Xem điểm rèn luyện', 
            image: require('../../../assets/SinhVien/activity.jpg'), 
            backgroundColor: '#FF8C00', 
            onPress: () => navigation.navigate('DisciplineScore')
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.row}>
                {categories.map((category, index) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.card, { backgroundColor: category.backgroundColor }]} 
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
