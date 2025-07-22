import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View as RNView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface BudgetSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onDataReload?: () => void; // 添加数据重新加载回调
}

const BudgetSettingModal: React.FC<BudgetSettingModalProps> = ({ 
  visible, 
  onClose, 
  onDataReload
}) => {
  const [inputBudget, setInputBudget] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 保存预算的函数
  const saveBudget = async () => {
    const budgetValue = parseFloat(inputBudget);
    if (!isNaN(budgetValue)) { // 允许负数
      try {
        await AsyncStorage.setItem('app_budget', budgetValue.toString());
        setInputBudget('');
        onClose(); // 关闭输入模态框
        setSuccessMsg(`予算が${budgetValue.toLocaleString()}円に設定されました！`);
        setSuccessVisible(true); // 显示成功弹窗
        if (onDataReload) onDataReload(); // 重新加载数据
      } catch (error) {
        console.log('保存预算失败:', error);
      }
    }
  };

  return (
    <>
      {/* 预算设置模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <ThemedText style={styles.title}>予算</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="予算金額を入力してください"
              value={inputBudget}
              onChangeText={setInputBudget}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={saveBudget} style={styles.saveButton}>
              <ThemedText style={styles.saveButtonText}>登録</ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 保存成功提示弹窗 */}
      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <RNView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <RNView
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
          </RNView>
        </RNView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // 模态框容器样式
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 147, 147, 0.5)',
  },
  // 模态框内容样式
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // 安卓阴影
  },
  // 标题样式
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  // 输入框样式
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  // 保存按钮样式
  saveButton: {
    backgroundColor: '#EBFFEA',
    borderRadius: 5,
    padding: 12,
    width: '30%',
    marginBottom: 10,
    borderColor: 'black',
    borderWidth: 1,
  },
  // 保存按钮文本样式
  saveButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  // 关闭按钮样式
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  // 关闭按钮文本样式
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

export default BudgetSettingModal;