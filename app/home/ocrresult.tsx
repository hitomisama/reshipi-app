import React from 'react';
import { StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

export default function OCRResultScreen() {
  const { image } = useLocalSearchParams();
  
  // 这里通常会有实际的OCR结果数据
  // 示例数据
  const results = [
    { item: "咖啡", price: 380 },
    { item: "三明治", price: 500 },
    { item: "矿泉水", price: 120 },
    { item: "税", price: 100 }
  ];
  
  // 计算总价
  const total = results.reduce((sum, item) => sum + item.price, 0);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: '扫描结果',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2196F3" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollContainer}>
        {/* 扫描的图片 */}
        <Image 
          source={{ uri: image }} 
          style={styles.receiptImage}
          resizeMode="contain"
        />
        
        {/* OCR结果 */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>识别结果</Text>
          
          {/* 商品列表 */}
          <View style={styles.itemsContainer}>
            {results.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.item}</Text>
                <Text style={styles.itemPrice}>{item.price}¥</Text>
              </View>
            ))}
            
            {/* 总价 */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>总计</Text>
              <Text style={styles.totalPrice}>{total}¥</Text>
            </View>
          </View>
          
          {/* 保存按钮 */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {
              // 实现保存逻辑
              router.push('/');
            }}
          >
            <Text style={styles.saveButtonText}>保存结果</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  backButton: {
    marginLeft: 15,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  resultsContainer: {
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  itemsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});