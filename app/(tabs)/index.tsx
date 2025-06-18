import { StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';

import EditScreenInfo from '@/components/home/homepage';
import { Text, View } from '@/components/Themed';
import { useBudgetStore } from '../store/budgetStore';
import HomeContent from '@/components/home/BudgetInputSection';

export default function TabOneScreen() {
  // モーダルの表示状態を管理するステート
  const [modalVisible, setModalVisible] = useState(false);
  const budget = useBudgetStore((state) => state.budget);

  // モーダルを開く関数
  const openModal = () => {
    setModalVisible(true);
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>      
      {/* テキストをクリックするとモーダルが開く */}
      <TouchableOpacity onPress={openModal}>
        <Text style={styles.modalTrigger}>予算{budget}円</Text>
      </TouchableOpacity>
      
      {/* モーダルコンポーネント */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <HomeContent />
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Text style={styles.title}>Tab One</Text>
      {/* 区切り線 */}
      <EditScreenInfo path="app/(tabs)/index.tsx" />
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
  }
});
