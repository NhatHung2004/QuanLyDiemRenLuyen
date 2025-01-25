import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const Contents = ({ route }) => {
    const { item } = route.params;

    return (
        <ScrollView style={styles.container}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>Đăng: {new Date(item.timestamp).toLocaleString()}</Text>
            <Text style={styles.content}>{item.content}</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
});

export default Contents;
