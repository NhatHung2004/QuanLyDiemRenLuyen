import React, { useEffect, useState } from "react";
import { View, ScrollView, Dimensions, ActivityIndicator, StyleSheet } from "react-native";
import { DataTable, Text, Card } from "react-native-paper";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../../../configs/APIs";

const DisciplineScore = ({ studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("id");
        const response = await authApis(token).get(endpoints["disciplineScore"], {
          params: { student_id: userId },
        });
        setData(response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  if (!data) {
    return <Text style={styles.error}>Không có dữ liệu</Text>;
  }

  const labels = Object.keys(data.scores);
  const scores = Object.values(data.scores).map(Number);
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 60; // Nhỏ hơn Card để tránh bo góc
  const maxScore = Math.ceil(Math.max(...scores) / 5) * 5 || 10; // Bội số của 5

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.header}>
        Điểm Rèn Luyện - {data.term}
      </Text>

      {/* Biểu đồ cột */}
      <Card style={styles.card}>
        <Text style={styles.chartTitle}>Biểu đồ điểm rèn luyện</Text>
        <View style={styles.chartWrapper}>
          <BarChart
            data={{ labels: labels, datasets: [{ data: scores }] }}
            width={chartWidth} // Nhỏ hơn container để tránh bị bo viền
            height={220}
            yAxisLabel=""
            yAxisSuffix=" điểm"
            fromZero={true}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 124, 230, ${opacity})`,
              barPercentage: 0.6,
              propsForLabels: { fontSize: 12 },
              yAxisInterval: 1, // Đảm bảo chia theo từng khoảng
            }}
            verticalLabelRotation={0}
            style={styles.chart}
            yAxisInterval={5} // Bước nhảy 5
            yAxisMax={maxScore} // Đặt giới hạn cao nhất theo bội số của 5
          />
        </View>
      </Card>

      {/* Bảng điểm chi tiết */}
      <Card style={styles.card}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={styles.columnHeader}>Điều</DataTable.Title>
            <DataTable.Title numeric style={styles.columnHeader}>Điểm</DataTable.Title>
          </DataTable.Header>

          {labels.map((label, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{label}</DataTable.Cell>
              <DataTable.Cell numeric>{scores[index]}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card>

      {/* Tổng điểm & Xếp loại - Tách riêng */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryText}>Tổng điểm</Text>
          <Text style={styles.summaryValue}>{data.total_score}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryText}>Xếp loại</Text>
          <Text style={styles.summaryValue}>{data.classification}</Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { marginBottom: 10, fontWeight: "bold", textAlign: "center" },
  card: { marginBottom: 16, padding: 16, borderRadius: 10 },
  chartTitle: { textAlign: "center", fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  chartWrapper: { alignItems: "center" }, // Giữ biểu đồ căn giữa
  chart: { borderRadius: 10 },
  columnHeader: { fontWeight: "bold" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 5,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
  },
  summaryText: { fontSize: 16, fontWeight: "bold" },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: "#1E88E5" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { textAlign: "center", color: "red", marginTop: 20 },
});

export default DisciplineScore;
