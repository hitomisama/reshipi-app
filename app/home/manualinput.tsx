import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function ManualInputScreen() {
  // 商品选项
  const productOptions = [
    '米', 'パン', '牛乳', '卵', '肉', '野菜', '果物', 'お菓子', '飲料', '調味料', '日用品', 'その他'
  ];

  // 分类选项，与 ocrresult.tsx 保持一致
  const CATEGORY_OPTIONS = [
    '食材',
    '飲み物',
    'おやつ',
    '外食',
    '他',
  ];

  const [items, setItems] = useState<{ item: string; price: string; category: string }[]>([
    { item: '', price: '', category: CATEGORY_OPTIONS[0] }
  ]);
  // 店铺名称
  const [shop, setShop] = useState('');

  // 添加新项目
  const addItem = () => {
    setItems([...items, { item: '', price: '', category: CATEGORY_OPTIONS[0] }]);
  };

  // 删除项目
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // 更新项目名称
  const updateItemName = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].item = value;
    setItems(newItems);
  };

  // 更新项目价格
  const updateItemPrice = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].price = value;
    setItems(newItems);
  };

  // 新增：更新分类
  const updateItemCategory = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].category = value;
    setItems(newItems);
  };

  // 保存数据到本地存储
  const saveItemsToStorage = async (items: any[], shop: string) => {
    try {
      const json = await AsyncStorage.getItem('ocr_items');
      const oldItems = json ? JSON.parse(json) : [];
      const newItems = [{ items, shop, date: Date.now() }, ...oldItems];
      await AsyncStorage.setItem('ocr_items', JSON.stringify(newItems));
    } catch (e) {
      console.log('保存失败', e);
    }
  };

  // 保存并跳转
  const handleSave = async () => {
    // 验证数据
    const validItems = items.filter(item => 
      item.item.trim() !== '' && item.price.trim() !== '' && !isNaN(Number(item.price))
    );

    if (validItems.length === 0) {
      Alert.alert('エラー', '少なくとも1つの有効な項目を入力してください');
      return;
    }

    // 转换数据格式
    const formattedItems = validItems.map(item => ({
      item: item.item.trim(),
      price: parseInt(item.price)
    }));

    try {
      // 保存到本地存储
      await saveItemsToStorage(formattedItems, shop);
      
      // 跳转到结果页面
      router.push({
        pathname: '/home/ocrresult',
        params: { 
          image: '', // 手动输入没有图片
          items: JSON.stringify(formattedItems),
          shop: shop
        }
      });
    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: '手動入力',
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#2196F3" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <ThemedText style={styles.title}>商品明細を入力</ThemedText>
        {/* 店铺名称输入栏 */}
        <ThemedView style={styles.shopRow}>
          <ThemedText style={styles.shopLabel}>店舗名</ThemedText>
          <TextInput
            style={styles.shopInput}
            placeholder="例：西友"
            value={shop}
            onChangeText={setShop}
          />
        </ThemedView>
        
        {items.map((item, index) => (
          <ThemedView key={index} style={styles.itemContainer}>
            <ThemedView style={styles.itemRow}>
              <TextInput
                style={[styles.input, styles.itemInput]}
                placeholder="商品名"
                value={item.item}
                onChangeText={(value) => updateItemName(index, value)}
              />
              {/* 分类下拉选择 */}
              <Picker
                selectedValue={item.category}
                style={[styles.input, styles.categoryInput, {paddingLeft: 0, paddingRight: 0}]}
                onValueChange={(value) => updateItemCategory(index, value)}
                dropdownIconColor="#2196F3"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="価格"
                value={item.price}
                onChangeText={(value) => updateItemPrice(index, value)}
                keyboardType="numeric"
              />
              {items.length > 1 && (
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeItem(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#f44336" />
                </TouchableOpacity>
              )}
            </ThemedView>
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
          <ThemedText style={styles.addButtonText}>項目を追加</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>保存</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  itemInput: {
    flex: 2,
    marginRight: 8,
  },
  categoryInput: {
    flex: 1,
    marginRight: 8,
    minWidth: 80,
  },
  priceInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shopLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 60,
  },
  shopInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});
