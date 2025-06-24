import { StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState, useCallback } from 'react';

import EditScreenInfo from '@/components/home/homepage';
import { Text, View } from '@/components/Themed';
import { useBudgetStore } from '../store/budgetStore';
import HomeContent from '@/components/home/BudgetInputSection';
import ModalManager from '@/components/home/ModalManager';
import OCRScreen from '@/components/home/OCR';

export default function TabOneScreen() {
  // モーダルの表示状態を管理するステート
  const [modalVisible, setModalVisible] = useState(false);
  // 結果メッセージの状態
  const [resultMessage, setResultMessage] = useState({
    visible: false,
    success: false,
    message: ''
  });
  
  const budget = useBudgetStore((state) => state.budget);

  // モーダルを開く関数
  const openModal = () => {
    setModalVisible(true);
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    setModalVisible(false);
  };
  
  // 結果メッセージを閉じる関数
  const closeResultMessage = () => {
    setResultMessage({...resultMessage, visible: false});
  };
  
  // ログイン処理の結果を処理する関数
  const handleLoginResult = useCallback((success: boolean, message: string) => {
    // モーダルを閉じる
    closeModal();
    
    // 結果メッセージを設定して表示
    setResultMessage({
      visible: true,
      success: success,
      message: message
    });
    
    // 3秒後にメッセージを自動的に非表示にする
    setTimeout(() => {
      closeResultMessage();
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Text>予算{budget}円</Text>
      
      {/* テキストをクリックするとモーダルが開く */}
      <TouchableOpacity onPress={openModal}>
        <Text style={styles.modalTrigger}>予算を設定する</Text>
      </TouchableOpacity>
      
      {/* 弹窗和结果消息弹窗由ModalManager统一管理 */}
      <ModalManager
        modalVisible={modalVisible}
        closeModal={closeModal}
        resultMessage={resultMessage}
        closeResultMessage={closeResultMessage}
        handleLoginResult={handleLoginResult}
      />

      {/* OCR功能区块 */}
      <OCRScreen />
      
    </View>
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
  // モーダルトリガーのスタイル
  modalTrigger: {
    fontSize: 16,
    color: '#2196F3',
    padding: 10,
    marginVertical: 15,
  },
  // モーダルコンテナのスタイル
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // モーダルコンテンツのスタイル
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  // 閉じるボタンのスタイル
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    elevation: 2
  },
  // 閉じるボタンのテキストスタイル
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  // 結果メッセージコンテナのスタイル
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  // 結果メッセージコンテンツの共通スタイル
  resultContent: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5
  },
  // 成功メッセージコンテンツのスタイル
  successContent: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  // エラーメッセージコンテンツのスタイル
  errorContent: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  // 結果メッセージテキストの共通スタイル
  resultText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center'
  },
  // 成功メッセージテキストのスタイル
  successText: {
    color: '#4CAF50',
  },
  // エラーメッセージテキストのスタイル
  errorText: {
    color: '#F44336',
  },
  // 結果メッセージボタンの共通スタイル
  resultButton: {
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10
  },
  // 成功メッセージボタンのスタイル
  successButton: {
    backgroundColor: '#4CAF50',
  },
  // エラーメッセージボタンのスタイル
  errorButton: {
    backgroundColor: '#F44336',
  },
  // 結果メッセージボタンテキストのスタイル
  resultButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
