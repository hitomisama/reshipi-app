import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, View, Text, ActionSheetIOS, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function ManualInputScreen() {

  // 分类选项，与 ocrresult.tsx 保持一致
  const CATEGORY_OPTIONS = [
    '選択',
    '食材',
    '飲み物',
    '果物',
    'おやつ',
    '外食',
    '他',
  ];

  const [items, setItems] = useState<{ item: string; price: string; category: string }[]>([
    { item: '', price: '', category: CATEGORY_OPTIONS[0] }
  ]);
  // 店铺名称
  const [shop, setShop] = useState('');
  // 用于电脑端下拉菜单的状态
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);

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

  // 显示分类选择器
  const showCategoryPicker = (index: number) => {
    if (Platform.OS === 'web') {
      // Web端显示/隐藏下拉菜单
      setDropdownVisible(dropdownVisible === index ? null : index);
    } else if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['キャンセル', ...CATEGORY_OPTIONS],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            updateItemCategory(index, CATEGORY_OPTIONS[buttonIndex - 1]);
          }
        }
      );
    } else {
      // Android 使用 Alert
      const buttons = CATEGORY_OPTIONS.map((option) => ({
        text: option,
        onPress: () => updateItemCategory(index, option),
      }));
      buttons.push({
        text: 'キャンセル',
        onPress: () => {},
      });
      
      Alert.alert('項目を選択', '', buttons);
    }
  };

  // Web端选择分类
  const selectCategory = (index: number, category: string) => {
    updateItemCategory(index, category);
    setDropdownVisible(null);
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
      price: parseInt(item.price),
      category: item.category,
    }));

    try {
      // 保存到本地存储
      await saveItemsToStorage(formattedItems, shop);

      // 跳转到结果页面，并同步商店名
      router.push({
        pathname: '/(tabs)/ocrresult',
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
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: '手動入力',
          headerShown: false,
          headerStyle: {
            backgroundColor: '#FEFDED',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#4D2615',
          },
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#2196F3" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* 合计金额显示 */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>合計</Text>
            <Text style={styles.totalValue}>
              {items.reduce((total, item) => total + (parseInt(item.price) || 0), 0)}円
            </Text>
          </View>
        </View>

        {/* 日期和店铺信息 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>日付</Text>
            <Text style={styles.infoValue}>
              {new Date().getFullYear()}年 {String(new Date().getMonth() + 1).padStart(2, '0')}月 {String(new Date().getDate()).padStart(2, '0')}日
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>店舗</Text>
            <TextInput
              style={styles.shopInput}
              placeholder="店舗名"
              value={shop}
              onChangeText={setShop}
            />
          </View>
        </View>

        {/* 商品表格 */}
        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>商品</Text>
            <Text style={styles.tableHeaderCell}>項目</Text>
            <Text style={styles.tableHeaderCell}>金額</Text>
          </View>
          
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <TextInput
                style={[styles.tableCell, styles.itemInput]}
                placeholder="入力"
                placeholderTextColor="#999"
                value={item.item}
                onChangeText={(value) => updateItemName(index, value)}
              />
              
              <View style={styles.categoryContainer}>
                <TouchableOpacity 
                  style={styles.pickerContainer}
                  onPress={() => showCategoryPicker(index)}
                >
                  <Text style={styles.categoryText}>
                    {item.category}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
                
                {/* Web端下拉菜单 */}
                {Platform.OS === 'web' && dropdownVisible === index && (
                  <View style={styles.dropdown}>
                    {CATEGORY_OPTIONS.map((option, optionIndex) => (
                      <TouchableOpacity
                        key={optionIndex}
                        style={[
                          styles.dropdownItem,
                          option === item.category && styles.dropdownItemSelected
                        ]}
                        onPress={() => selectCategory(index, option)}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          option === item.category && styles.dropdownItemTextSelected
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.priceContainer}>
                <TextInput
                  style={[styles.tableCell, styles.priceInput]}
                  placeholder="入力"
                  placeholderTextColor="#999"
                  value={item.price}
                  onChangeText={(value) => updateItemPrice(index, value)}
                  keyboardType="numeric"
                />
                <Text style={styles.currencyText}>円</Text>
                {items.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeItem(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#f44336" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 添加商品按钮 */}
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.addButtonText}>項目を追加</Text>
        </TouchableOpacity>

        {/* 登録按钮 */}
        <TouchableOpacity style={styles.registerButton} onPress={handleSave}>
          <Text style={styles.registerButtonText}>登録</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    paddingTop: 91,
    flex: 1,
    backgroundColor: '#FEFDED',
  },
  backButton: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    maxWidth: isWeb ? 400 : undefined,
    alignSelf: isWeb ? 'center' : 'stretch',
  },
  totalSection: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4D2615',
  },
  totalLabel: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4D2615',
    fontFamily: 'azuki_font',
  },
  totalValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4D2615',
    fontFamily: 'azuki_font',
  },
  infoSection: {
    marginBottom: 70,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4D2615',
  },
  infoLabel: {
    fontSize: 26,
    color: '#4D2615',
    minWidth: 60,
    fontFamily: 'azuki_font',
  },
  infoValue: {
    fontSize: 26,
    color: '#4D2615',
    fontFamily: 'azuki_font',
  },
  shopInput: {
    flex: 1,
    fontSize: 26,
    color: '#4d261572',
    textAlign: 'right',
    paddingVertical: 4,
    fontFamily: 'azuki_font',
  },
  tableSection: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#4D2615',
    marginBottom: 21,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4D2615',
    textAlign: 'center',
    fontFamily: 'azuki_font',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4D2615',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    color: '#4D2615',
    textAlign: 'center',
    paddingVertical: 5,
    fontFamily: 'azuki_font',
    width: '100%',
  },
  itemInput: {
    flex: 1,
    textAlign: 'left',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    fontSize: 14,
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android 阴影
    elevation: 2,
  },
  categoryContainer: {
    flex: 1,
    position: 'relative',
    marginRight: 8,
    
  },
  pickerContainer: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android 阴影
    elevation: 2,
    
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#4D2615',
    fontFamily: 'azuki_font',
    textAlign: 'center',
  },
  dropdownItemTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 14,
    color: '#4D2615',
    fontFamily: 'azuki_font',
    flex: 1,
    textAlign: 'center',
        paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceInput: {
    flex: 1,
    textAlign: 'right',
    marginRight: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
    fontSize: 14,
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android 阴影
    elevation: 2,
  },
  currencyText: {
    fontSize: 16,
    color: '#4D2615',
    marginRight: 8,
    fontFamily: 'azuki_font',
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 10,
    borderStyle: 'dashed',
    backgroundColor: '#f8f8f8',
  },
  addButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontSize: 16,
    fontFamily: 'azuki_font',
  },
  registerButton: {
    backgroundColor: '#FFB6C1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  registerButtonText: {
    color: '#4D2615',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'azuki_font',
  },
});
