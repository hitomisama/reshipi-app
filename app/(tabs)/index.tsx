import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText, ThemedView } from '@/components/Themed';
import { useBudgetStore } from '@/app/store/budgetStore';
import BudgetSettingModal from '../home/BudgetSettingModal';


export default function TabOneScreen() {
  // 管理模态框显示状态的状态变量
  const [modalVisible, setModalVisible] = useState(false);
  const budget = useBudgetStore((state) => state.budget);

  // 打开模态框的函数
  const openModal = () => {
    setModalVisible(true);
  };

  // 关闭模态框的函数
  const closeModal = () => {
    setModalVisible(false);
  };
  
  // 导航到相机屏幕的函数
  const navigateToCamera = () => {
    router.push('/home/Camera');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText>予算：{budget}円</ThemedText>
      
      {/* 点击文本打开模态框 */}
      <TouchableOpacity onPress={openModal}>
        <ThemedText style={styles.modalTrigger}>予算を設定</ThemedText>
      </TouchableOpacity>
      
      {/* 相机按钮 */}
      <TouchableOpacity 
        style={styles.cameraButton}
        onPress={navigateToCamera}
      >
        <Ionicons name="camera" size={28} color="white" />
        <ThemedText style={styles.cameraButtonText}>レシートをスキャン</ThemedText>
      </TouchableOpacity>
      
      {/* 预算设置模态框组件 */}
      <BudgetSettingModal
        visible={modalVisible}
        onClose={closeModal}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  // 模态框触发器样式
  modalTrigger: {
    fontSize: 16,
    color: '#2196F3',
    padding: 10,
    marginVertical: 15,
  },
  // 相机按钮样式
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 15,
    paddingHorizontal: 25,
    marginVertical: 20,
    elevation: 4, // 安卓阴影
  },
  // 相机按钮文本样式
  cameraButtonText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: 'bold',
  },
});
