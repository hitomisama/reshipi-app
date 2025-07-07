import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View as RNView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '@/components/Themed';
import { useBudgetStore } from '@/app/store/budgetStore';

interface BudgetSettingModalProps {
  visible: boolean;
  onClose: () => void;
}

const BudgetSettingModal: React.FC<BudgetSettingModalProps> = ({ 
  visible, 
  onClose 
}) => {
  // 管理成功提示模态框的状态
  const [successVisible, setSuccessVisible] = useState(false);
  const [inputBudget, setInputBudget] = useState('');
  const budget = useBudgetStore((state) => state.budget);
  const setBudget = useBudgetStore((state) => state.setBudget);
  
  // 使用useRef存储前一次的预算值，用于比较是否发生变化
  const prevBudgetRef = useRef(budget);
  
  // 监听预算变化，显示成功提示
  useEffect(() => {
    // 如果预算值有变化，并且模态框已打开过（排除首次加载）
    if (prevBudgetRef.current !== budget && prevBudgetRef.current !== 0 && visible) {
      // 关闭输入模态框
      onClose();
      // 显示成功提示
      setSuccessVisible(true);
      
      // 3秒后自动关闭成功提示
      const timer = setTimeout(() => {
        setSuccessVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer); // 清理定时器
    }
    // 更新前一次的预算值引用
    prevBudgetRef.current = budget;
  }, [budget, visible, onClose]);
  
  // 关闭成功提示的函数
  const closeSuccess = () => {
    setSuccessVisible(false);
  };

  // 保存预算的函数
  const saveBudget = () => {
    const budgetValue = parseFloat(inputBudget);
    if (!isNaN(budgetValue) && budgetValue > 0) {
      setBudget(budgetValue);
      setInputBudget('');
    }
  };

  return (
    <>
      {/* 预算输入模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            {/* 临时替换 HomeContent 组件 */}
            <ThemedText style={styles.title}>设置月度预算</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入预算金额"
              value={inputBudget}
              onChangeText={setInputBudget}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={saveBudget} style={styles.saveButton}>
              <ThemedText style={styles.saveButtonText}>保存预算</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>关闭</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
      
      {/* 保存成功提示模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successVisible}
        onRequestClose={closeSuccess}
      >
        <RNView style={styles.successContainer}>
          <RNView style={styles.successContent}>
            <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
            <ThemedText style={styles.successText}>预算设置成功！</ThemedText>
            <TouchableOpacity onPress={closeSuccess} style={styles.successButton}>
              <ThemedText style={styles.successButtonText}>确定</ThemedText>
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
  // 成功提示容器样式
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  // 成功提示内容样式
  successContent: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
  },
  // 成功提示文本样式
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
    marginBottom: 20,
  },
  // 成功提示按钮样式
  successButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  // 成功提示按钮文本样式
  successButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default BudgetSettingModal;