import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActivityDetail = ({ route }) => {
  const { item } = route.params;  // Destructure the 'item' directly from route.params
  console.log("Activity", item);  // Log the item to confirm it's being passed correctly

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>Bắt đầu: {new Date(item.start_date).toLocaleDateString()}</Text>
      <Text style={styles.date}>Kết thúc: {new Date(item.end_date).toLocaleDateString()}</Text>
      <Text style={styles.createdBy}>Người tạo: {item.created_by}</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  createdBy: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default ActivityDetail;
