import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Modal, View, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText, ThemedView } from "@/components/Themed";
import BudgetSettingModal from "../home/BudgetSettingModal";
import BudgetBar from "../home/BudgetBar";

export default function TabOneScreen() {
  // 管理模态框显示状态的状态变量
  const [modalVisible, setModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
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

  // 预算设置成功回调
  const handleSuccess = async (msg = "予算が正常に設定されました！") => {
    setModalVisible(false);
    setSuccessMsg(msg);
    setSuccessVisible(true);
    // 重新加载数据
    await loadData();
  };

  // 跳转到相机的函数
  const navigateToCamera = () => {
    router.push("/home/Camera");
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
          <ThemedText style={styles.budgetText}>
            <p>予算</p>
            <p>{budget}円</p>
          </ThemedText>
        </TouchableOpacity>

        {/* 显示剩余预算 */}
        <ThemedView style={styles.remainingTextContainer}>
          <ThemedText style={styles.remainingText}>
            残り：{remaining}円
          </ThemedText>
          <View
            style={{
              position: "absolute",
              left: 0,
              bottom: 8,
              width: "100%",
              height: 2,
              backgroundColor: "#4D2615",
              transform: [{ skewX: "-15deg" }],
            }}
          />
        </ThemedView>

        {/* 猪 */}
        <ThemedView style={{ marginVertical: 20 }}>
          <BudgetBar />
        </ThemedView>
      </View>

      {/* 手动输入和相机按钮图片左右排列 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/home/manualinput")}
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
        onSuccess={handleSuccess} // 新增：设置成功时回调
      />

      {/* 保存成功提示弹窗 */}
      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 30,
              alignItems: "center",
            }}
          >
            <ThemedText
              style={{ fontSize: 18, color: "#4CAF50", marginBottom: 20 }}
            >
              {successMsg}
            </ThemedText>
            <TouchableOpacity
              style={{
                backgroundColor: "#4CAF50",
                borderRadius: 5,
                paddingVertical: 8,
                paddingHorizontal: 30,
              }}
              onPress={() => setSuccessVisible(false)}
            >
              <ThemedText
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                確認
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    width: '80%',
    alignSelf: 'center',
    marginTop: '10%',
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
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", 
    paddingTop: 91, 
    backgroundColor: "#FEFDED", 
  },
  budgetText: {
    display: "flex",
    width: 302,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    gap: 142,
    flexShrink: 0,
    fontSize: 22,
    fontWeight: "bold",
    color: "#4D2615",
    marginVertical: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#7A7A7A",
    fontFamily: "azuki",
    marginBottom: 46,
    backgroundColor: "rgba(255,255,255,0.44)",
  },
  remainingTextContainer: {
    position: "relative",
    width: 220,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 47,
    backgroundColor: "#FEFDED",
  },
  remainingText: {
    color: "#4D2615",
    fontFamily: "azuki_font",
    fontSize: 32,
    fontStyle: "normal",
    fontWeight: "400",
    paddingBottom: 10,
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
  mainContent: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});
