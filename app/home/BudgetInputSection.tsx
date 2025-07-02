import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useBudgetStore } from '@/app/store/budgetStore';

// プロップスの型定義
interface HomeContentProps {
  // 確実に型を合わせる
  onLoginResult?: (success: boolean, message: string) => void;
}

const HomeContent: React.FC<HomeContentProps> = ({ onLoginResult }) => {
  const [budgetInput, setBudgetInput] = useState('');
  const { setBudget } = useBudgetStore();

  // ログイン（予算設定）処理
  const handleLogin = () => {
    try {
      // 入力値の検証
      if (!budgetInput.trim()) {
        // 入力が空の場合
        if (onLoginResult) {
          onLoginResult(false, '予算を入力してください');
        }
        return;
      }
      
      const budgetValue = Number(budgetInput);
      
      // 数値でない場合やマイナス値の場合
      if (isNaN(budgetValue) || budgetValue < 0) {
        if (onLoginResult) {
          onLoginResult(false, '有効な金額を入力してください');
        }
        return;
      }

      // 予算を設定
      setBudget(budgetValue);
      
      // 成功メッセージを表示（コールバックがある場合のみ）
      if (typeof onLoginResult === 'function') {
        onLoginResult(true, `予算が${budgetValue.toLocaleString()}円に設定されました`);
      }
      
      // 入力欄をクリア
      setBudgetInput('');
    } catch (error) {
      // エラー処理
      console.error('Budget setting error:', error);
      
      // コールバックがある場合のみ呼び出す
      if (typeof onLoginResult === 'function') {
        onLoginResult(false, 'エラーが発生しました。もう一度お試しください。');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>予算を設定</Text>
      
      <TextInput
        style={styles.input}
        placeholder="予算を入力してください（円）"
        value={budgetInput}
        onChangeText={setBudgetInput}
        keyboardType="numeric"
      />
      
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>設定する</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    width: '100%',
    padding: 12,
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default HomeContent;