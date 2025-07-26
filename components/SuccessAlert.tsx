import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View, Text, Image, Platform } from 'react-native';
import { router } from 'expo-router';

interface SuccessAlertProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
  navigateTo?: string;
  onDataReload?: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ 
  visible, 
  onClose, 
  message = "登録しました",
  navigateTo = '/(tabs)/history',
  onDataReload
}) => {
  
  // 处理确认按钮点击
  const handleConfirm = () => {
    onClose(); // 关闭弹窗
    if (onDataReload) onDataReload(); // 重新加载数据
    router.push(navigateTo as any); // 跳转页面
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.successText}>
            {message}
          </Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Image source={require('@/assets/images/check.png')} style={styles.checkIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// 自定义 Hook 用于管理成功提示的逻辑
export function useSuccessAlert(
  message: string = "登録しました", 
  navigateTo: string = '/(tabs)/history'
) {
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const SuccessAlertComponent = ({ onDataReload }: { onDataReload?: () => void }) => (
    <SuccessAlert
      visible={visible}
      onClose={hide}
      message={message}
      navigateTo={navigateTo}
      onDataReload={onDataReload}
    />
  );

  return {
    show,
    hide,
    SuccessAlertComponent
  };
}

const isWeb = Platform.OS === 'web';

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
    backgroundColor: '#EBFFEA',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
    elevation: 8, // 安卓阴影
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  // 成功文本样式
  successText: {
    fontSize: 26,
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'azuki_font',
    marginBottom: 26,
  },
  // 确认按钮样式
  confirmButton: {
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 勾选图标样式
  checkIcon: {
    width: 45,
    height: 45,
  },
});

export default SuccessAlert;
