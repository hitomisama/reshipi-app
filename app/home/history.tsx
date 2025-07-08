// history.tsx
import React from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { ThemedView, ThemedText } from '@/components/Themed';
import { useBudgetStore } from '@/app/store/budgetStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const expenses = useBudgetStore((state) => state.expenses);

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      {/* 返回按钮 */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}
        onPress={() => router.push('/')}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        支出履歴
      </ThemedText>
      <ScrollView style={{ marginTop: 16 }}>
        {expenses.length === 0 && (
          <ThemedText style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            履歴がありません
          </ThemedText>
        )}
        {expenses.map((exp) => (
          <ThemedView key={exp.id} style={{
            backgroundColor: '#f9f9f9',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}>
            <ThemedText style={{ fontWeight: 'bold' }}>
              {new Date(exp.date).toLocaleString('ja-JP')}
            </ThemedText>
            {exp.image && (
              <Image source={{ uri: exp.image }} style={{ width: '100%', height: 120, borderRadius: 8, marginVertical: 8 }} />
            )}
            {exp.items.map((item, idx) => (
              <ThemedText key={idx}>
                {item.item}：{item.price}円
              </ThemedText>
            ))}
            <ThemedText style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: 8 }}>
              合計：{exp.total}円
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}
