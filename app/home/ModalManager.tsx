import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import HomeContent from './BudgetInputSection';

interface ResultMessage {
  visible: boolean;
  success: boolean;
  message: string;
}

interface ModalManagerProps {
  modalVisible: boolean;
  closeModal: () => void;
  resultMessage: ResultMessage;
  closeResultMessage: () => void;
  handleLoginResult: (success: boolean, message: string) => void;
}

const ModalManager: React.FC<ModalManagerProps> = ({
  modalVisible,
  closeModal,
  resultMessage,
  closeResultMessage,
  handleLoginResult,
}) => {
  return (
    <>
      {/* 通用设置弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <HomeContent onLoginResult={handleLoginResult} />
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 结果消息弹窗 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={resultMessage.visible}
        onRequestClose={closeResultMessage}
      >
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultContent,
              resultMessage.success ? styles.successContent : styles.errorContent,
            ]}
          >
            <Text
              style={[
                styles.resultText,
                resultMessage.success ? styles.successText : styles.errorText,
              ]}
            >
              {resultMessage.message}
            </Text>
            <TouchableOpacity
              onPress={closeResultMessage}
              style={[
                styles.resultButton,
                resultMessage.success ? styles.successButton : styles.errorButton,
              ]}
            >
              <Text style={styles.resultButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  resultContent: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  successContent: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  errorContent: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  resultButton: {
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  resultButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ModalManager; 