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
  Platform,
  Text
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ThemedText, ThemedView } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import * as MediaLibrary from 'expo-media-library';
import { Picker } from '@react-native-picker/picker';
import { useSuccessAlert } from '@/components/SuccessAlert';

// 工具函数：将 ph:// URI 转换为本地可用 URI
async function getLocalUriFromPhUri(phUri: string) {
  if (phUri.startsWith('ph://')) {
    const assetId = phUri.replace('ph://', '').split('/')[0];
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(assetId);
      // 优先使用本地 file:// 路径
      if (asset.localUri && asset.localUri.startsWith('file://')) {
        return asset.localUri;
      }
      // 如果没有本地 URI，尝试使用 asset.uri
      if (asset.uri) {
        return asset.uri;
      }
      return null;
    } catch (e) {
      console.warn('无法转换 ph:// uri:', e);
      return null;
    }
  }
  // 如果不是 ph:// 协议，直接返回
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
  const [budget, setBudgetState] = useState<number>(30000);
  const [hasBeenSaved, setHasBeenSaved] = useState<boolean>(false);
  
  // 使用独立的成功提示逻辑
  const { show: showSuccessAlert, SuccessAlertComponent } = useSuccessAlert();

  // 从AsyncStorage加载预算
  const loadData = async () => {
    try {
      const budgetJson = await AsyncStorage.getItem('app_budget');
      if (budgetJson) {
        setBudgetState(parseFloat(budgetJson));
      }
    } catch (error) {
      console.log('加载预算失败:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  
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
  
  // 保存結果到AsyncStorage和更新預算
  const saveResults = async () => {
    try {
      const newBudget = budget - total;
      
      // 更新預算到AsyncStorage
      await AsyncStorage.setItem('app_budget', newBudget.toString());
      setBudgetState(newBudget);

      // 检查是否来自手动输入
      const isFromManualInput = params.shop && !params.image;
      
      if (isFromManualInput) {
        // 如果来自手动输入，更新已存在的记录而不是添加新记录
        const existingJson = await AsyncStorage.getItem('ocr_items');
        const existingItems = existingJson ? JSON.parse(existingJson) : [];
        
        // 查找并更新最近的记录（假设是第一条记录）
        if (existingItems.length > 0) {
          existingItems[0] = {
            items: results,
            shop: shop,
            date: existingItems[0].date, // 保持原始时间
            total: total
          };
          
          // 保存更新后的历史数据
          await AsyncStorage.setItem('ocr_items', JSON.stringify(existingItems));
        }
      } else {
        // 对于非手动输入的数据，添加新记录
        const purchaseRecord = {
          items: results,
          shop: shop,
          date: Date.now(),
          total: total
        };

        // 读取现有的历史记录
        const existingJson = await AsyncStorage.getItem('ocr_items');
        const existingItems = existingJson ? JSON.parse(existingJson) : [];
        
        // 添加新记录到历史数据开头
        const updatedItems = [purchaseRecord, ...existingItems];
        
        // 保存更新后的历史数据
        await AsyncStorage.setItem('ocr_items', JSON.stringify(updatedItems));
      }

      // 标记为已保存
      setHasBeenSaved(true);

      // 顯示成功提示
      showSuccessAlert();

    } catch (error) {
      console.log('保存失败:', error);
      Alert.alert('错误', '保存失败，请重试');
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

  // 处理返回按钮点击
  const handleBack = () => {
    // 检查来源，决定返回到哪个页面
    const isFromManualInput = params.shop && !params.image;
    
    if (hasBeenSaved) {
      // 如果已保存，直接跳转到 history 页面（因为成功提示已经处理了数据清除）
      router.push('/(tabs)/history');
    } else {
      // 如果未保存，保留数据并返回到来源页面
      if (isFromManualInput) {
        // 从手动输入来的，返回手动输入页面（数据保留）
        router.back();
      } else {
        // 从OCR扫描来的，返回相机页面
        router.back();
      }
    }
  };

  return (
    <View style={[styles.container, {backgroundColor:'#FFFFF5'}]}>
      {/* 返回按钮 */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Image 
          source={require('@/assets/images/returnbutton.png')} 
          style={styles.backButtonImage}
        />
      </TouchableOpacity>
      
      <View style={styles.readingResultTitle}>
        <Text style={{
    color: '#000',
    textAlign: 'center',
    fontFamily: 'azuki_font',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 22,
    marginVertical: 12,
    marginTop: 20,
  }}>読み取り結果編集</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>

        {/* 合计/日期/店铺 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>合計</Text>
            <Text style={styles.infoValue}>{total}円</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>日付</Text>
            <TextInput
              style={styles.infoInput}
              value={date}
              onChangeText={setDate}
              placeholder="2025年05月02日"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>店舗</Text>
            <TextInput
              style={styles.infoInput}
              value={shop}
              onChangeText={setShop}
              placeholder="コンビニ名"
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
          {results.map((item, index) => (
            <View key={index} style={styles.tableRow}>
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
                <Text style={styles.categoryCellText}>
                  {item.category || '他'}
                </Text>
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
            </View>
          ))}
        </View>

        {/* 登録按钮 */}
        <TouchableOpacity style={styles.registerButton} onPress={saveResults}>
          <Text style={styles.registerButtonText}>登録</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 成功提示組件 */}
      <SuccessAlertComponent 
        onDataReload={loadData} 
        onSuccess={() => {
          const isFromManualInput = params.shop && !params.image;
          
          if (isFromManualInput) {
            // 来自手动输入页面，需要清除手动输入页面的数据
            router.push({
              pathname: '/(tabs)/manualinput',
              params: { clearData: 'true' }
            });
          } else {
            // 来自OCR扫描，返回相机页面（不需要特殊清除逻辑）
            router.push('/(tabs)/Camera');
          }
        }}
      />
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: isWeb ? 400 : undefined,
    alignSelf: isWeb ? 'center' : 'stretch',
  },
  scrollContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  backButtonImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  receiptImage: {
    width: '90%',
    height: 200,
    marginBottom: 20,
    marginHorizontal: '5%',
    borderRadius: 10,
    resizeMode: 'contain',
  },
  placeholderImage: {
    width: '90%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: '5%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
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
    fontFamily: 'azuki_font',
  },
  infoValue: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'azuki_font',
  },
  infoInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 2,
    fontFamily: 'azuki_font',
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
    fontFamily: 'azuki_font',
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
    fontFamily: 'azuki_font',
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
    fontFamily: 'azuki_font',
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
    fontFamily: 'azuki_font',
  },
  readingResultTitle: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'azuki_font',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 22,
    marginVertical: 12,
    marginTop: 20,
  },
});