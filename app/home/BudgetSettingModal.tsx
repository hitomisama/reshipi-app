import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View as RNView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '@/components/Themed';
import { useBudgetStore } from '@/app/store/budgetStore';

interface BudgetSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void; // 添加 onSuccess 属性
}

const BudgetSettingModal: React.FC<BudgetSettingModalProps> = ({ 
  visible, 
  onClose, 
  onSuccess
}) => {
  const [inputBudget, setInputBudget] = useState('');
  const budget = useBudgetStore((state) => state.budget);
  const setBudget = useBudgetStore((state) => state.setBudget);

  // 保存预算的函数
  const saveBudget = () => {
    const budgetValue = parseFloat(inputBudget);
    if (!isNaN(budgetValue)) { // 允许负数
      setBudget(budgetValue);
      setInputBudget('');
      onClose(); // 关闭输入模态框
      if (onSuccess) onSuccess('予算が正常に設定されました！'); // 只调用回调
      // 跳转到支出履历页面
      if (typeof window !== 'undefined') {
        // Web
        window.setTimeout(() => {
          window.location.hash = '#/home/history';
        }, 300);
      } else {
        // 移动端
        setTimeout(() => {
          // @ts-ignore
          if (typeof router !== 'undefined') router.push('/home/history');
        }, 300);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.title}>月間予算を設定</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="予算金額を入力してください"
            value={inputBudget}
            onChangeText={setInputBudget}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={saveBudget} style={styles.saveButton}>
            <ThemedText style={styles.saveButtonText}>予算を保存</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>閉じる</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // 模态框容器样式
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 12,
    width: '100%',
    marginBottom: 10,
  },
  // 保存按钮文本样式
  saveButtonText: {
    color: 'white',
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