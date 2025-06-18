import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useBudgetStore } from '@/app/store/budgetStore';

const HomeCoBudgetInputSection = () => {
  const { budget, setBudget } = useBudgetStore();
  const [inputValue, setInputValue] = useState('');

  const handleSetBudget = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      setBudget(parsed);
      setInputValue('');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="予算を入力してください"
        value={inputValue}
        onChangeText={setInputValue}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />
      <Button title="登録" onPress={handleSetBudget} />
    </View>
  );
};

export default HomeCoBudgetInputSection;