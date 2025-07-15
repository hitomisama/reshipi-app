import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  View,
  TextInput,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ThemedText, ThemedView } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '@/app/store/budgetStore';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import * as MediaLibrary from 'expo-media-library';
import { Picker } from '@react-native-picker/picker';

// 工具函数：将 ph:// URI 转换为本地可用 URI
async function getLocalUriFromPhUri(phUri: string) {
  if (phUri.startsWith('ph://')) {
    const assetId = phUri.replace('ph://', '').split('/')[0];
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(assetId);
      // 只返回本地 file:// 路径
      if (asset.localUri && asset.localUri.startsWith('file://')) {
        return asset.localUri;
      }
      // asset.uri 可能是 assets-library:// 或其它协议，不能直接用
      return null;
    } catch (e) {
      console.warn('无法转换 ph:// uri', e);
      return null;
    }
  }
  return phUri;
}

// 定义类型接口
interface OCRItem {
  item: string;
  price: number;
  category?: string; // 新增
}

const CATEGORY_OPTIONS = [
  '食材',
  '飲み物',
  'おやつ',
  '外食',
  '他',
];

export default function OCRResultScreen() {
  const params = useLocalSearchParams();
  const [results, setResults] = useState<OCRItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [image, setImage] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => {
    // 默认今天日期 yyyy年MM月dd日
    const d = new Date();
    return `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日`;
  });
  const [shop, setShop] = useState<string>('');

  // 获取预算store函数
  const addExpense = useBudgetStore((state) => state.addExpense);
  const budget = useBudgetStore((state) => state.budget);
  const setBudget = useBudgetStore((state) => state.setBudget);
  
  useEffect(() => {
    async function handleImage() {
      if (params.image) {
        const realUri = await getLocalUriFromPhUri(params.image as string);
        if (realUri) {
          setImage(realUri);
        } else {
          setImage(null);
        }
      }
      
      if (params.items) {
        try {
          const itemsData = Array.isArray(params.items) ? params.items[0] : params.items;
          const parsedItems: OCRItem[] = JSON.parse(itemsData as string).map((item: OCRItem) => ({
            ...item,
            category: '他',
          }));
          setResults(parsedItems);
          const sum = parsedItems.reduce((acc, item) => acc + item.price, 0);
          setTotal(sum);
        } catch (error) {
          console.error('解析商品数据失败', error);
          // 使用硬编码数据作为后备
          const fallbackResults: OCRItem[] = [
            { item: "牛丼", price: 610, category: '外食' },
            { item: "タバコ", price: 610, category: '他' }
          ];
          setResults(fallbackResults);
          setTotal(fallbackResults.reduce((sum, item) => sum + item.price, 0));
        }
      } else {
        // 如果没有传递数据，使用示例数据
        const exampleResults: OCRItem[] = [
          { item: "牛丼", price: 610, category: '外食' },
          { item: "タバコ", price: 610, category: '他' }
        ];
        setResults(exampleResults);
        setTotal(exampleResults.reduce((sum, item) => sum + item.price, 0));
      }

      // 新增逻辑：如果从 manualinput 跳转过来，设置商店名
      if (params.shop) {
        setShop(params.shop as string);
      }
    }
    handleImage();
  }, [params.image, params.items, params.shop]);
  
  // 保存结果到预算中
  const saveResults = () => {
    const newBudget = budget - total;
    setBudget(newBudget);

    addExpense({
      id: uuidv4(),
      date: new Date().toISOString(),
      items: results,
      total,
    });

    if (budget < total) {
      const exceed = total - budget;
      Alert.alert('警告', `予算を${exceed}円超えています`);
    } else {
      Alert.alert('成功', `レシートが保存されました！消費 ${total}¥、残り予算 ${newBudget}¥`);
    }

    // 无论弹窗如何，保存后直接跳转到 history 页面
    if (Platform.OS === 'web') {
      setTimeout(() => router.push('/history'), 100);
    } else {
      setTimeout(() => router.push('/history'), 500); // 给弹窗一点时间
    }
  };

  function showCategoryPicker(current: string, onSelect: (value: string) => void) {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
        options: [...CATEGORY_OPTIONS, 'キャンセル'],
        cancelButtonIndex: CATEGORY_OPTIONS.length,
        title: '項目を選択',
      }, (buttonIndex) => {
        if (buttonIndex < CATEGORY_OPTIONS.length) {
          onSelect(CATEGORY_OPTIONS[buttonIndex]);
        }
      });
    } else if (Platform.OS === 'web') {
      const value = window.prompt('項目を入力/選択してください：' + CATEGORY_OPTIONS.join('、'), current);
      if (value && CATEGORY_OPTIONS.includes(value)) {
        onSelect(value);
      }
    } else {
      // Android: 简单弹窗
      Alert.alert(
        '項目を選択',
        '',
        [
          ...CATEGORY_OPTIONS.map(opt => ({ text: opt, onPress: () => onSelect(opt) })),
          { text: 'キャンセル', style: 'cancel' as const }
        ]
      );
    }
  }

  // 在 return 语句中，将所有组件改为使用 ThemedView 和 ThemedText
  return (
    <ThemedView style={[styles.container, {backgroundColor:'#FFFFF5'}]}>
      <Stack.Screen 
        options={{
          title: 'レシート撮影画面',
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
        {/* 合计/日期/店铺 */}
        <ThemedView style={styles.infoSection}>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>合計</ThemedText>
            <ThemedText style={styles.infoValue}>{total}円</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>日付</ThemedText>
            <TextInput
              style={styles.infoInput}
              value={date}
              onChangeText={setDate}
              placeholder="2025年05月02日"
            />
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>店舗</ThemedText>
            <TextInput
              style={styles.infoInput}
              value={shop}
              onChangeText={setShop}
              placeholder="コンビニ名"
            />
          </ThemedView>
        </ThemedView>
        {/* 商品表格 */}
        <ThemedView style={styles.tableSection}>
          <ThemedView style={styles.tableHeader}>
            <ThemedText style={styles.tableHeaderCell}>商品</ThemedText>
            <ThemedText style={styles.tableHeaderCell}>項目</ThemedText>
            <ThemedText style={styles.tableHeaderCell}>金額</ThemedText>
          </ThemedView>
          {results.map((item, index) => (
            <ThemedView key={index} style={styles.tableRow}>
              <TextInput
                style={styles.tableCell}
                value={item.item}
                onChangeText={text => {
                  const newResults = [...results];
                  newResults[index].item = text;
                  setResults(newResults);
                }}
              />
              {/* 分类选择：点击文本弹窗选择 */}
              <TouchableOpacity
                style={[styles.tableCell, styles.categoryCell]}
                onPress={() => showCategoryPicker(item.category || '他', (value) => {
                  const newResults = [...results];
                  newResults[index].category = value;
                  setResults(newResults);
                })}
              >
                <ThemedText style={styles.categoryCellText}>
                  {item.category || '他'}
                </ThemedText>
              </TouchableOpacity>
              <TextInput
                style={styles.tableCell}
                value={item.price.toString()}
                keyboardType="numeric"
                onChangeText={text => {
                  const newResults = [...results];
                  newResults[index].price = parseInt(text) || 0;
                  setResults(newResults);
                  setTotal(newResults.reduce((acc, i) => acc + i.price, 0));
                }}
              />
            </ThemedView>
          ))}
        </ThemedView>

        {/* 登録按钮 */}
        <TouchableOpacity style={styles.registerButton} onPress={saveResults}>
          <ThemedText style={styles.registerButtonText}>登録</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
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
  placeholderImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholderText: {
    marginTop: 10,
    color: '#666',
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
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  secondaryButton: {
    backgroundColor: '#9E9E9E',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#FFFFF5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    width: 50,
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    marginLeft: 10,
  },
  infoInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 2,
  },
  tableSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    padding: 4,
    fontSize: 15,
    marginHorizontal: 2,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
  },
  categoryCell: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  categoryCellText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  categoryNoteBox: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: 'transparent',
    paddingRight: 10,
  },
  categoryNoteTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  categoryNoteItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 1,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});