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
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '@/components/Themed';

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
  
  // 拍照
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        
        setCapturedImage(photo.uri);
        // 保存照片到相册
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        // 刷新预览
        loadLatestPhoto();
        
        // 处理OCR
        processImage(photo.uri);
      } catch (error) {
        Alert.alert('错误', '拍照失败，请重试');
        setIsProcessing(false);
      }
    }
  };
  
  // 从相册选择照片
  const pickImage = async () => {
    try {
      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        processImage(result.assets[0].uri);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      Alert.alert('错误', '选择照片失败，请重试');
      setIsProcessing(false);
    }
  };
  
  // 处理OCR识别
  const processImage = async (imageUri: string) => {
    try {
      // 这里调用您的OCR逻辑处理图像
      // 例如: const results = await OCRProcessor.processImage(imageUri);
      
      // 模拟OCR处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 处理完成后，导航到结果页面
      router.push({
        pathname: '/home/ocrresult',
        params: { image: imageUri }
      });
    } catch (error) {
      Alert.alert('错误', '处理图像失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理权限问题
  if (hasPermission === null) {
    return <ThemedView style={styles.container}><ThemedText>请求相机权限...</ThemedText></ThemedView>;
  }
  if (hasPermission === false) {
    return <ThemedView style={styles.container}><ThemedText>没有相机权限，请在设置中允许访问</ThemedText></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      {/* 导航栏配置 */}
      <Stack.Screen 
        options={{
          title: '扫描收据',
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
            拍摄收据或从相册选择图片
          </ThemedText>
        </>
      ) : (
        <RNView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>正在处理图像...</ThemedText>
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