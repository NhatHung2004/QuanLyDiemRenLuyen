import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Dimensions, Button, TextInput, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { authApis, endpoints } from '../../../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Import expo-file-system
import * as Print from 'expo-print'; // Import expo-print
import * as Sharing from 'expo-sharing'; // Import expo-sharing
import Papa from 'papaparse';

const TrainingScoreStatistics = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [classificationFilter, setClassificationFilter] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');

  const facultiesMapping = {
    "Khoa CNTT": 1,
    "Khoa Kinh Tế": 2,
  };

  // Biểu đồ phân bổ xếp loại
  const classificationLabels = Object.keys(data.classification_distribution || {});
  const classificationCounts = Object.values(data.classification_distribution || {}).map(Number);

  const chartData = classificationLabels.map((label, index) => ({
    name: label,
    population: classificationCounts[index],
    color: index === 0 ? '#34b6f1' : '#ffcd38', // Thêm màu sắc tùy thuộc vào chỉ mục
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("id");

      const facultyId = facultyFilter ? facultiesMapping[facultyFilter] : null;
      if (facultyFilter && !facultyId) {
        alert("Tên khoa không hợp lệ");
        setLoading(false);
        return;
      }

      const params = {
        ...(facultyId && { department: facultyId }),
        ...(classificationFilter && { classification: classificationFilter }),
      };

      const response = await authApis(token).get(endpoints["trainingScoreStatistics"], { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xuất PDF
  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      // Gửi request để lấy file từ API
      const response = await authApis(token).get(endpoints["exportReport"]);
      console.log("response", response.data);

      // Phân tích chuỗi CSV thành mảng đối tượng
      Papa.parse(response.data, {
        complete: async (result) => {
          console.log(result);

          // Tạo nội dung HTML để xuất PDF
          const htmlContent = `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  table { width: 100%; border-collapse: collapse; }
                  table, th, td { border: 1px solid black; }
                  th, td { padding: 8px; text-align: left; }
                </style>
              </head>
              <body>
                <h1>Điểm rèn luyện</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Class</th>
                      <th>Term</th>
                      <th>Total Score</th>
                      <th>Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${result.data.map(row => `
                      <tr>
                        <td>${row[0]}</td>
                        <td>${row[1]}</td>
                        <td>${row[2]}</td>
                        <td>${row[3]}</td>
                        <td>${row[4]}</td>
                        <td>${row[5]}</td>
                        <td>${row[6]}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `;

          // In ra file PDF từ nội dung HTML
          const { uri } = await Print.printToFileAsync({ html: htmlContent });
          console.log('File saved at:', uri);

          // Lưu file PDF vào bộ nhớ thiết bị
          const filePath = FileSystem.documentDirectory + 'training_score_report.pdf';
          console.log('File saved at:', filePath);
          await FileSystem.moveAsync({
            from: uri,
            to: filePath,
          });

          // Mở file PDF
          openFile(filePath);
          Alert.alert('Xuất file thành công', `File PDF đã được lưu tại: ${filePath}`);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          Alert.alert('Lỗi', 'Không thể phân tích dữ liệu CSV.');
        }
      });
    } catch (error) {
      console.error("Error exporting file:", error);
      Alert.alert('Lỗi', 'Không thể xuất file.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm mở file PDF
  const openFile = async (filePath) => {
    try {
      // Kiểm tra nếu tính năng chia sẻ có sẵn trên thiết bị
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath); // Chia sẻ hoặc mở file
      } else {
        Alert.alert('Không thể mở file', 'Tính năng chia sẻ không khả dụng trên thiết bị này.');
      }
    } catch (error) {
      console.log('Error opening file:', error);
      Alert.alert('Lỗi', 'Không thể mở file');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thống kê điểm rèn luyện</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập xếp loại"
        value={classificationFilter}
        onChangeText={setClassificationFilter}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tên khoa (vd: Khoa CNTT)"
        value={facultyFilter}
        onChangeText={setFacultyFilter}
      />

      <Button title="Gửi" onPress={handleSubmit} />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Phân bổ xếp loại</Text>
            <PieChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(34, 124, 230, ${opacity})`,
                strokeWidth: 2,
                barPercentage: 0.6,
                useShadowColorFromDataset: false,
              }}
              accessor="population"
              backgroundColor="transparent"
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Điểm rèn luyện trung bình</Text>
            <Text style={styles.cardText}>{data.average_score || "N/A"}</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Tổng số sinh viên</Text>
            <Text style={styles.cardText}>{data.total_students || "N/A"}</Text>
          </Card>

          {/* Nút xuất PDF */}
          <Button title="Xuất PDF" onPress={handleExportPDF} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontWeight: 'bold', fontSize: 20, marginBottom: 20, textAlign: 'center' },
  card: { marginBottom: 20, padding: 10, borderRadius: 8, backgroundColor: '#f7f7f7' },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardText: { fontSize: 14, marginTop: 5 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    borderRadius: 4,
  },
});

export default TrainingScoreStatistics;
