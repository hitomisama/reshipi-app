import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View as RNView, 
  Image, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------- OCR 识别工具函数 -----------
async function ocrImageBase64(base64: string) {
  const apiKey = Constants.expoConfig?.extra?.apiKey;
  if (!apiKey) throw new Error('API密钥未配置');

  const body = {
    requests: [
      {
        image: { content: base64 },
        features: [{ type: 'TEXT_DETECTION' }],
      },
    ],
  };

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`API错误 (${res.status}): ${errorData.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const text = data.responses?.[0]?.fullTextAnnotation?.text || '';

  // 解析商品明细（可根据你的逻辑调整）
  const lines = text.split('\n');
  const parsed: { item: string; price: number }[] = [];
  const skipKeywords = ['合計', '小計', '税込', '割引', '釣り', '現金', 'ポイント', '点', '数量', '個'];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i].trim();
    const inlineMatch = current.match(/^(.+?)\s+¥?\s*(\d{2,5})円?/);
    if (inlineMatch) {
      const name = inlineMatch[1].trim();
      const price = parseInt(inlineMatch[2].replace(/,/g, ''));
      if (name !== '' && price >= 30 && price <= 10000 && !skipKeywords.some(word => name.includes(word))) {
        parsed.push({ item: name, price });
      }
      continue;
    }
    if (i + 1 < lines.length) {
      const nameLine = current;
      const priceLine = lines[i + 1].trim();
      const priceMatch = priceLine.match(/^¥?\s*([\d,]+)\s*$/);
      if (
        priceMatch &&
        nameLine !== '' &&
        !skipKeywords.some(word => nameLine.includes(word)) &&
        !/数量|個/.test(nameLine)
      ) {
        const price = parseInt(priceMatch[1].replace(/,/g, ''));
        if (price >= 30 && price <= 10000) {
          parsed.push({ item: nameLine, price });
          i++;
        }
      }
    }
  }

  return { text, items: parsed };
}
// ----------- OCR 识别工具函数 END -----------

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // 请求相机和相册权限
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      
      setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
      
      // 如果有权限，获取最新的相册照片作为预览
      if (mediaStatus === 'granted') {
        loadLatestPhoto();
      }
    })();
  }, []);
  
  // 加载最近的照片作为预览
  const loadLatestPhoto = async () => {
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: 'photo',
        sortBy: MediaLibrary.SortBy.creationTime
      });
      
      if (assets && assets.length > 0) {
        setGalleryPreview(assets[0].uri);
      }
    } catch (error) {
      console.log('获取照片预览失败:', error);
    }
  };
  
  // 拍照并识别
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
        setCapturedImage(photo.uri);
        // 保存照片到相册
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        // 刷新预览
        loadLatestPhoto();

        // OCR识别
        if (photo.base64) {
          const ocrResult = await ocrImageBase64(photo.base64);
          await saveItemsToStorage(ocrResult.items); // 新增：保存到本地
          router.push({
            pathname: '/home/ocrresult',
            params: { 
              image: photo.uri,
              items: JSON.stringify(ocrResult.items)
            }
          });
        } else {
          Alert.alert('エラー', '画像のbase64データが取得できませんでした');
        }
      } catch (error) {
        Alert.alert('エラー', '写真撮影または認識に失敗しました。もう一度お試しください');
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  // 从相册选择并识别
  const pickImage = async () => {
    try {
      setIsProcessing(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const imageUri = selectedImage.uri;
        if (selectedImage.base64) {
          const ocrResult = await ocrImageBase64(selectedImage.base64);
          await saveItemsToStorage(ocrResult.items); // 新增：保存到本地
          router.push({
            pathname: '/home/ocrresult',
            params: { 
              image: imageUri,
              items: JSON.stringify(ocrResult.items)
            }
          });
        } else {
          Alert.alert('エラー', '画像のbase64データが取得できませんでした');
        }
      }
    } catch (error) {
      console.error('选择图片或识别失败:', error);
      Alert.alert('エラー', '画像の選択または認識に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 保存识别结果到本地
  const saveItemsToStorage = async (items: any[]) => {
    try {
      // 读取旧的历史
      const json = await AsyncStorage.getItem('ocr_items');
      const oldItems = json ? JSON.parse(json) : [];
      // 新的历史在最前面
      const newItems = [{ items, date: Date.now() }, ...oldItems];
      await AsyncStorage.setItem('ocr_items', JSON.stringify(newItems));
    } catch (e) {
      console.log('保存失败', e);
    }
  };

  // Web端：页面加载时自动弹出图片选择
  useEffect(() => {
    if (Platform.OS === 'web') {
      pickImage();
    }
  }, []);

  // 处理权限问题
  if (hasPermission === null) {
    return <ThemedView style={styles.container}><ThemedText>カメラの権限をリクエストしています...</ThemedText></ThemedView>;
  }
  if (hasPermission === false) {
    return <ThemedView style={styles.container}><ThemedText>カメラへのアクセスが許可されていません。設定で許可してください。</ThemedText></ThemedView>;
  }

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity onPress={pickImage} style={{ marginTop: 40 }}>
          <ThemedText style={{ fontSize: 18, color: '#2196F3' }}>
            画像を選択
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* 导航栏配置 */}
      <Stack.Screen 
        options={{
          title: 'レシートをスキャン',
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#2196F3" />
            </TouchableOpacity>
          ),
        }}
      />

      {!isProcessing ? (
        <>
          {/* 相机视图 - 不包含子组件 */}
          <CameraView 
            style={styles.camera} 
            facing={type}
            ref={cameraRef}
          />
          
          {/* 按钮容器 - 使用绝对定位覆盖在相机上 */}
          <RNView style={styles.buttonContainer}>
            {/* 相册预览按钮 */}
            <TouchableOpacity 
              style={styles.galleryPreview} 
              onPress={pickImage}
            >
              {galleryPreview ? (
                <Image 
                  source={{ uri: galleryPreview }} 
                  style={styles.previewImage}
                />
              ) : (
                <RNView style={styles.placeholderPreview}>
                  <Ionicons name="images" size={20} color="white" />
                </RNView>
              )}
            </TouchableOpacity>

            {/* 拍照按钮 */}
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <RNView style={styles.captureInner} />
            </TouchableOpacity>
            
            {/* 翻转相机按钮 */}
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => {
                setType(type === 'back' ? 'front' : 'back');
              }}>
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </RNView>
          
          {/* 提示文本 */}
          <ThemedText style={styles.instructionText}>
            レシートを撮影するか、アルバムから選択してください
          </ThemedText>
        </>
      ) : (
        <RNView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>画像を処理中...</ThemedText>
        </RNView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captureButton: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  galleryPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'white',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButton: {
    alignSelf: 'center',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    marginLeft: 15,
  },
  instructionContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  }
});