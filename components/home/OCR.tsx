// 导入必要的依赖
import Constants from 'expo-constants'; // 用于访问Expo配置和环境变量
import * as ImagePicker from 'expo-image-picker'; // 用于图片选择功能
import { useEffect, useState } from 'react'; // React钩子，用于状态管理和生命周期
import { ActivityIndicator, Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native'; // UI组件

// API配置对象 - 定义Google Vision API的端点
const API_CONFIG = {
  endpoint: 'https://vision.googleapis.com/v1/images:annotate' // Google Vision OCR API的URL
};

export default function OCRScreen() {
  // 状态变量定义
  const [imageUri, setImageUri] = useState<string | null>(null); // 存储选中图片的URI
  const [ocrText, setOcrText] = useState<string>(''); // 存储OCR识别结果文本
  const [isLoading, setIsLoading] = useState<boolean>(false); // 控制加载状态显示
  const [apiConfigured, setApiConfigured] = useState<boolean>(false); // 标记API密钥是否已配置
  const [items, setItems] = useState<{ name: string; price: number }[]>([]); // 存储结构化商品明细
  
  // 组件加载时检查API配置 - 使用useEffect在组件挂载时执行
  useEffect(() => {
    // 尝试从Expo配置中获取API密钥
    const apiKey = Constants.expoConfig?.extra?.apiKey;
    if (apiKey) {
      // 如果找到密钥，则标记API已配置
      console.log('API密钥已配置');
      setApiConfigured(true);
    } else {
      // 如果未找到密钥，输出警告
      console.warn('API密钥未配置，OCR功能将不可用');
    }

    console.log("完整的Constants对象:", JSON.stringify(Constants, null, 2));
    console.log("API密钥:", Constants.expoConfig?.extra?.apiKey);
    // 或尝试旧版访问方式
    console.log("旧版API密钥:", Constants.manifest?.extra?.apiKey);
  }, []); // 空依赖数组表示仅在组件挂载时执行一次

  // 图片选择函数 - 处理用户选择或拍摄图片的逻辑
  const pickImage = async () => {
    try {
      // 检查API密钥是否已配置，如未配置则提示用户
      if (!apiConfigured) {
        Alert.alert('配置错误', 'API密钥未配置，请先设置app.config.js和.env文件');
        return;
      }
      
      // 请求相册访问权限
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        // 如果用户拒绝权限，显示错误提示
        Alert.alert('权限错误', '需要相册访问权限');
        return;
      }

      // 打开图片选择器，允许编辑，并获取base64格式
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true, // 请求base64格式数据，用于API调用
        allowsEditing: true, // 允许用户编辑所选图片
        quality: 1, // 图片质量设置为最高
      });

      // 如果用户选择了图片（未取消）
      if (!result.canceled) {
        const asset = result.assets[0]; // 获取选择的资源
        setImageUri(asset.uri); // 设置图片URI以便显示
        if (asset.base64) {
          // 如果成功获取base64数据，则发送给OCR处理
          sendToOCR(asset.base64);
        } else {
          // 如果无法获取base64数据，显示错误
          Alert.alert('错误', '无法获取图片数据');
        }
      }
    } catch (error) {
      // 捕获整个图片选择过程中的任何错误
      console.error('图片选择错误:', error);
      Alert.alert('错误', '选择图片时发生错误');
    }
  };

  // 新增拍照函数 - 通过相机拍照并发送图片至OCR
  const takePhoto = async () => {
    try {
      if (!apiConfigured) {
        Alert.alert('配置错误', 'API密钥未配置，请先设置app.config.js和.env文件');
        return;
      }

      // 请求相机权限
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('权限错误', '需要相机访问权限');
        return;
      }

      // 打开相机，允许编辑，并获取base64格式
      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        if (asset.base64) {
          sendToOCR(asset.base64);
        } else {
          Alert.alert('错误', '无法获取图片数据');
        }
      }
    } catch (error) {
      console.error('拍照错误:', error);
      Alert.alert('错误', '拍照时发生错误');
    }
  };

  // OCR处理函数 - 将图片发送到Google Vision API并处理结果
  const sendToOCR = async (base64: string) => {
    // 设置加载状态为true，显示加载指示器
    setIsLoading(true);
    try {
      // 从Expo配置中获取API密钥
      const apiKey = Constants.expoConfig?.extra?.apiKey;

      // 检查API密钥是否存在
      if (!apiKey) {
        throw new Error('API密钥未配置');
      }

      // 构建API请求体 - Google Vision API要求的格式
      const body = {
        requests: [
          {
            image: { content: base64 }, // base64编码的图片数据
            features: [{ type: 'TEXT_DETECTION' }], // 请求文本检测功能
          },
        ],
      };

      console.log('正在发送OCR请求...');
      // 发送HTTP POST请求到Google Vision API
      const res = await fetch(
        `${API_CONFIG.endpoint}?key=${apiKey}`, // URL附加API密钥
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body), // 序列化请求体
        }
      );

      // 处理非成功的HTTP状态码
      if (!res.ok) {
        // 尝试解析错误数据，若失败则使用空对象
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`API错误 (${res.status}): ${errorData.error?.message || res.statusText}`);
      }

      // 解析API响应数据
      const data = await res.json();
      // 从响应中提取识别的文本
      const text = data.responses?.[0]?.fullTextAnnotation?.text;
      
      // 处理文本结果
      if (!text) {
        // 如果未检测到文本，设置提示信息
        setOcrText('未检测到文本，请尝试其他图片。');
        setItems([]);
      } else {
        // 如果成功检测到文本，更新状态
        setOcrText(text);

        const lines = text.split('\n');
        const parsed: { name: string; price: number }[] = [];
        // 扩展 skipKeywords
        const skipKeywords = ['合計', '小計', '税込', '割引', '釣り', '現金', 'ポイント', '点', '数量', '個'];

        for (let i = 0; i < lines.length; i++) {
          const current = lines[i].trim();

          // 1. 优先：商品名＋价格在同一行
          const inlineMatch = current.match(/^(.+?)\s+¥?\s*(\d{2,5})円?/);
          if (inlineMatch) {
            const name = inlineMatch[1].trim();
            const price = parseInt(inlineMatch[2].replace(/,/g, ''));
            if (name !== '' && price >= 30 && price <= 10000 && !skipKeywords.some(word => name.includes(word))) {
              parsed.push({ name, price });
            }
            continue;
          }

          // 2. 补充：商品名与价格在不同的行
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
                parsed.push({ name: nameLine, price });
                i++; // 跳过已处理的价格行
              }
            }
          }
        }

        setItems(parsed);
        console.log('🧾 提取出的商品明细:', parsed);
      }
    } catch (error) {
      // 捕获OCR处理过程中的任何错误
      console.error('OCR处理错误:', error);
      // 在界面上显示错误信息
      setOcrText(`识别失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setItems([]);
      Alert.alert('错误', `OCR处理时发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      // 无论成功或失败，最终都要关闭加载状态
      setIsLoading(false);
    }
  };

  // 组件渲染UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 当API未配置时显示警告和设置指南 */}
      {!apiConfigured && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ API密钥未配置。请按照以下步骤设置:
          </Text>
          <Text style={styles.instructionText}>
            1. 在项目根目录创建app.config.js文件{'\n'}
            2. 在项目根目录创建.env文件并添加GOOGLE_VISION_API_KEY{'\n'}
            3. 安装dotenv: npm install dotenv{'\n'}
            4. 重启应用
          </Text>
        </View>
      )}
      
      {/* 按钮区域，包含拍照和图库选择 */}
      <View style={styles.buttonContainer}>
        <Button
          title="写真を撮る"
          onPress={takePhoto}
          disabled={isLoading || !apiConfigured}
        />
        <View style={{ height: 10 }} />
        {/* <Button
          title="🖼 从图库选择"
          onPress={pickImage}
          disabled={isLoading || !apiConfigured}
        /> */}
      </View>
      
      {/* 加载状态指示器 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>正在处理图像...</Text>
        </View>
      )}
      
      {/* 显示选择的图片 */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
      )}
      
      {/* 显示OCR识别结果 */}
      {/* {ocrText !== '' && (
        <View style={styles.textContainer}>
          <Text style={styles.resultText}>{ocrText}</Text>
        </View>
      )} */}

      {items.length > 0 && (
        <View style={styles.textContainer}>
          <Text style={styles.resultText}>商品明细：</Text>
          {items.map((item, index) => (
            <Text key={index} style={styles.resultText}>
              {item.name}：{item.price}円
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// 使用StyleSheet定义样式 - 提高性能并集中管理样式
const styles = StyleSheet.create({
  container: {
    padding: 20, // 内边距
  },
  buttonContainer: {
    marginTop: 40, // 顶部外边距
    alignItems: 'center', // 水平居中对齐
  },
  loadingContainer: {
    marginTop: 20, // 顶部外边距
    alignItems: 'center', // 水平居中对齐
  },
  loadingText: {
    marginTop: 10, // 顶部外边距
  },
  image: {
    width: 300, // 图片宽度
    height: 300, // 图片高度
    marginTop: 20, // 顶部外边距
    alignSelf: 'center', // 自身居中对齐
  },
  textContainer: {
    marginTop: 20, // 顶部外边距
    padding: 10, // 内边距
    backgroundColor: '#f9f9f9', // 背景色
    borderRadius: 5, // 边框圆角
    // 阴影效果 - 平台特定
    elevation: 3, // Android阴影
    shadowColor: "#000", // iOS阴影颜色
    shadowOffset: {
      width: 0, // iOS阴影X偏移
      height: 1, // iOS阴影Y偏移
    },
    shadowOpacity: 0.22, // iOS阴影透明度
    shadowRadius: 2.22, // iOS阴影半径
  },
  resultText: {
    fontSize: 16, // 文字大小
  },
  warningContainer: {
    marginTop: 20, // 顶部外边距
    padding: 15, // 内边距
    backgroundColor: '#fff3cd', // 警告背景色
    borderColor: '#ffeeba', // 边框颜色
    borderWidth: 1, // 边框宽度
    borderRadius: 5, // 边框圆角
  },
  warningText: {
    fontSize: 16, // 文字大小
    color: '#856404', // 文字颜色
    fontWeight: 'bold', // 文字粗细
    marginBottom: 10, // 底部外边距
  },
  instructionText: {
    fontSize: 14, // 文字大小
    color: '#856404', // 文字颜色
  }
});