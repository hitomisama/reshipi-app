import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Modal, View, Image, Platform, Dimensions } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import AsyncStorage from '@react-native-async-storage/async-storage';
// 如果需要在移动端使用模糊效果，可以安装并导入 @react-native-community/blur
// import { BlurView } from '@react-native-community/blur';

import { ThemedText, ThemedView } from "@/components/Themed";
import BudgetSettingModal from "../home/BudgetSettingModal";
import BudgetBar from "../home/BudgetBar";

export default function TabOneScreen() {
  // 管理模态框显示状态的状态变量
  const [modalVisible, setModalVisible] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [budget, setBudget] = useState(30000);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  // 计算已用金额
  const used = expenses.reduce((sum, item) => {
    if (item.total) return sum + item.total;
    if (item.items) return sum + item.items.reduce((s: number, it: any) => s + (it.price || 0), 0);
    return sum + (item.price || 0);
  }, 0);
  const remaining = budget - used;

  // 打开模态框的函数
  const openModal = () => {
    setModalVisible(true);
  };

  // 关闭模态框的函数
  const closeModal = () => {
    setModalVisible(false);
  };

  // 数据重新加载回调
  const handleDataReload = async () => {
    await loadData();
  };

  // 跳转到相机的函数
  const navigateToCamera = () => {
    router.push("/(tabs)/Camera");
  };

  // 从AsyncStorage加载数据
  const loadData = async () => {
    try {
      // 加载预算
      const budgetJson = await AsyncStorage.getItem('app_budget');
      if (budgetJson) {
        setBudget(parseFloat(budgetJson));
      }
      
      // 加载支出记录
      const expensesJson = await AsyncStorage.getItem('ocr_items');
      if (expensesJson) {
        setExpenses(JSON.parse(expensesJson));
      }
    } catch (error) {
      console.log('加载数据失败:', error);
    }
  };

  useEffect(() => {
    loadData(); // 组件加载时读取数据
    
    Font.loadAsync({
      azuki: require("@/assets/fonts/azuki.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  // 使用useFocusEffect在页面获得焦点时重新加载数据
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  if (!fontsLoaded) return null; // 或显示 loading

  return (
    <ThemedView style={styles.container}>
      <View style={styles.mainContent}>
        {/* 点击文本打开模态框 */}
        <TouchableOpacity onPress={openModal}>
          <View style={styles.budgetText}>
            <ThemedText style={styles.budgetLeftText}>予算</ThemedText>
            <ThemedText style={styles.budgetRightText}>{budget}円</ThemedText>
            <Image
              source={require("@/assets/images/Pencil.png")}
              style={styles.budgetIcon}
            />
          </View>
        </TouchableOpacity>

        {/* 显示剩余预算 */}
        <ThemedView style={styles.remainingTextContainer}>
          <ThemedText style={styles.remainingText}>
            残り：{remaining}円
          </ThemedText>
        </ThemedView>

        {/* 猪 */}
        <ThemedView style={{ marginVertical: 20 }}>
          <BudgetBar remaining={remaining} budget={budget} />
        </ThemedView>
      </View>

      {/* 手动输入和相机按钮图片左右排列 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/(tabs)/manualinput")}
        >
          <Image
            source={require("@/assets/images/pen_icon.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={navigateToCamera}>
          <Image
            source={require("@/assets/images/camera.icon.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>

      {/* 预算设置模态框组件 */}
      <BudgetSettingModal
        visible={modalVisible}
        onClose={closeModal}
        onDataReload={handleDataReload} // 数据重新加载回调
      />
    </ThemedView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
container: {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start", 
  paddingTop: 91, 
  backgroundColor: "#FEFDED",
  minHeight: undefined,
},
mainContent: {
  flex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: isWeb ? 400 : undefined,
  alignSelf: 'center',
  // Web端模糊效果
  ...(isWeb && {
    filter: 'blur(0px)',
  }),
  // 移动端可以使用opacity或其他效果代替模糊
  // opacity: isWeb ? 1 : 0.8,
},
budgetText: {
  display: "flex",
  height: 35,
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
  flexShrink: 0,
  marginVertical: 10,
  borderRadius: 9,
  borderWidth: 1,
  borderColor: "#7A7A7A",
  marginBottom: 46,
  backgroundColor: "rgba(255,255,255,0.44)",
  paddingLeft: 10, 
  paddingRight: 10,
  minWidth: 250, // 手机端确保有足够宽度
  ...(isWeb ? {} : { gap: 0 }), // web端也不使用gap，保持一致
},
budgetIcon: {
  width: 20,
  height: 20,
  marginLeft: 5,
  resizeMode: "contain",
},
budgetLeftText: {
  fontSize: 22,
  color: "#4D2615",
  fontFamily: "azuki",
  marginRight: 100, // 统一使用marginRight创建间距
},
budgetRightText: {
  fontSize: 22,
  color: "#4D2615",
  fontFamily: "azuki",
},
remainingTextContainer: {
  position: "relative",
  height: 60,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 47,
  backgroundColor: "#FEFDED",
  minWidth: undefined,
},
remainingText: {
  color: "#4D2615",
  fontFamily: "azuki_font",
  fontSize: 32,
  fontStyle: "normal",
  fontWeight: "400",
  paddingBottom: 10,
  borderBottomColor: "#4D2615",
  borderBottomWidth: 2,
},
buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginVertical: 20,
  width: '80%',
  alignSelf: 'center',
  marginTop: '10%',
  maxWidth: undefined,
},
iconButton: {
  backgroundColor: "transparent",
  borderRadius: 50,
  padding: 10,
},
buttonImage: {
  width: 60,
  height: 60,
  resizeMode: "contain",
},
cameraButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#4CAF50",
  borderRadius: 50,
  padding: 15,
  paddingHorizontal: 25,
  marginVertical: 20,
  elevation: 4, // 安卓阴影
},
cameraButtonText: {
  marginLeft: 8,
  color: "white",
  fontWeight: "bold",
  fontSize: 14,
},
manualButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#2196F3",
  borderRadius: 50,
  padding: 15,
  paddingHorizontal: 25,
  marginVertical: 10,
  elevation: 4, // 安卓阴影
},
manualButtonText: {
  marginLeft: 8,
  color: "white",
  fontWeight: "bold",
  fontSize: 14,
},
modalTrigger: {
  marginTop: 20,
  fontSize: 20,
  color: "#2196F3",
  padding: 10,
  marginVertical: 15,
},
title: {
  fontSize: 50,
  fontWeight: "bold",
},
separator: {
  marginVertical: 30,
  height: 1,
  width: "80%",
},
});
