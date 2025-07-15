import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText, ThemedView } from '@/components/Themed';
import { useBudgetStore } from '@/app/store/budgetStore';
import BudgetSettingModal from '../home/BudgetSettingModal';
import BudgetBar from '../home/BudgetBar';


export default function TabOneScreen() {
  // 管理模态框显示状态的状态变量
  const [modalVisible, setModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const budget = useBudgetStore((state) => state.budget);

  // 打开模态框的函数
  const openModal = () => {
    setModalVisible(true);
  };

  // 关闭模态框的函数
  const closeModal = () => {
    setModalVisible(false);
  };

  // 预算设置成功回调
  const handleSuccess = (msg = '予算が正常に設定されました！') => {
    setModalVisible(false);
    setSuccessMsg(msg);
    setSuccessVisible(true);
  };

  // 跳转到相机的函数
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
      
      <ThemedView style={{ marginVertical: 20 }}>
        <BudgetBar />
      </ThemedView>

      {/* 相机按钮 */}
      <TouchableOpacity 
        style={styles.cameraButton}
        onPress={navigateToCamera}
      >
        <Ionicons name="camera" size={28} color="white" />
        <ThemedText style={styles.cameraButtonText}>レシートをスキャン</ThemedText>
      </TouchableOpacity>

      {/* 手动输入按钮 */}
      <TouchableOpacity 
        style={styles.manualButton}
        onPress={() => router.push('/home/manualinput')}
      >
        <Ionicons name="create-outline" size={28} color="white" />
        <ThemedText style={styles.manualButtonText}>手動入力</ThemedText>
      </TouchableOpacity>
      
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
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
          <View style={{
            backgroundColor: 'white', borderRadius: 10, padding: 30, alignItems: 'center'
          }}>
            <ThemedText style={{ fontSize: 18, color: '#4CAF50', marginBottom: 20 }}>{successMsg}</ThemedText>
            <TouchableOpacity
              style={{ backgroundColor: '#4CAF50', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 30 }}
              onPress={() => setSuccessVisible(false)}
            >
              <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>確認</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // 手动输入按钮样式
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 50,
    padding: 15,
    paddingHorizontal: 25,
    marginVertical: 10,
    elevation: 4, // 安卓阴影
  },
  // 手动输入按钮文本样式
  manualButtonText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: 'bold',
  },
});
