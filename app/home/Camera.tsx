import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View as RNView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import OCRScreen from './OCR'; 
// OCRコンポーネントのインポート

export default function Camera() {
  // ヘルプモーダルの表示状態
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  
  // ヘルプモーダルを開く
  const openHelpModal = () => {
    setHelpModalVisible(true);
  };
  
  // ヘルプモーダルを閉じる
  const closeHelpModal = () => {
    setHelpModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* ヘッダーの設定 */}
      <Stack.Screen
        options={{
          title: 'レシートスキャン',
          headerRight: () => (
            <TouchableOpacity onPress={openHelpModal} style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={24} color="#2196F3" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* OCRコンポーネント */}
      <OCRScreen />
      
      {/* ヘルプモーダル */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={closeHelpModal}
      >
        <RNView style={styles.modalContainer}>
          <RNView style={styles.modalContent}>
            <Text style={styles.modalTitle}>レシート読み取りのヘルプ</Text>
            
            <Text style={styles.modalText}>
              1. 「写真を撮る」ボタンをタップして、レシートを撮影します。{'\n\n'}
              2. または「ギャラリーから選ぶ」ボタンで、既存の画像を選択できます。{'\n\n'}
              3. レシートが明るく、テキストがはっきり見えるようにしてください。{'\n\n'}
              4. 読み取り結果は自動的に処理され、商品と価格が表示されます。
            </Text>
            
            <TouchableOpacity onPress={closeHelpModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </RNView>
        </RNView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ヘルプボタンのスタイル
  helpButton: {
    marginRight: 15,
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
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  // モーダルタイトルのスタイル
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  // モーダルテキストのスタイル
  modalText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    color: '#333',
  },
  // 閉じるボタンのスタイル
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    width: '50%',
  },
  // 閉じるボタンのテキストスタイル
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});