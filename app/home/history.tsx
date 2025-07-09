// history.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { ThemedView, ThemedText } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem('ocr_items');
      setItems(json ? JSON.parse(json) : []);
    })();
  }, []);

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
        OCR履歴
      </ThemedText>
      <ScrollView style={{ marginTop: 16 }}>
        {items.length === 0 && (
          <ThemedText style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            履歴がありません
          </ThemedText>
        )}
        {items.map((item, idx) => (
          <ThemedView key={idx} style={{
            backgroundColor: '#f9f9f9',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}>
            {/* 如果有图片字段可以显示图片 */}
            {item.image && (
              <Image source={{ uri: item.image }} style={{ width: '100%', height: 120, borderRadius: 8, marginVertical: 8 }} />
            )}
            {/* 展示明细内容 */}
            {item.items ? item.items.map((it: any, i: number) => (
              <ThemedText key={i}>
                {it.item || it.name}：{it.price}円
              </ThemedText>
            )) : (
              <ThemedText>
                {item.item || item.name}：{item.price}円
              </ThemedText>
            )}
            {/* 如果有合计字段可以显示合计 */}
            {item.total && (
              <ThemedText style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: 8 }}>
                合計：{item.total}円
              </ThemedText>
            )}
            {/* 如果有日期字段可以显示日期 */}
            {item.date && (
              <ThemedText style={{ fontWeight: 'bold' }}>
                {new Date(item.date).toLocaleString('ja-JP')}
              </ThemedText>
            )}
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}
