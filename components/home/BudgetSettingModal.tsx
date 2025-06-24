import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View as RNView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useBudgetStore } from '@/app/store/budgetStore';
import HomeContent from '@/components/home/BudgetInputSection';

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
  const budget = useBudgetStore((state) => state.budget);
  
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

  return (
    <>
      {/* 预算输入模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <HomeContent />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
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
            <Text style={styles.successText}>预算设置成功！</Text>
            <TouchableOpacity onPress={closeSuccess} style={styles.successButton}>
              <Text style={styles.successButtonText}>确定</Text>
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
  // 关闭按钮样式
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
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