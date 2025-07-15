// history.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedView, ThemedText } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start,
    end,
    label: `${year}年${month + 1}月`,
    range: `${start.getMonth() + 1}月1日〜${end.getMonth() + 1}月${end.getDate()}日`
  };
}

export default function HistoryScreen() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem('ocr_items');
      const arr = json ? JSON.parse(json) : [];
      setItems(arr);
    })();
  }, []);

  useEffect(() => {
    // 过滤当前月
    const { start, end } = getMonthRange(currentYear, currentMonth);
    setFiltered(
      items.filter(item => {
        const d = new Date(item.date || 0);
        return d >= start && d <= end;
      })
    );
  }, [items, currentYear, currentMonth]);

  // 合计金额
  const total = filtered.reduce((sum, item) => {
    if (item.total) return sum + item.total;
    if (item.items) return sum + item.items.reduce((s: number, it: any) => s + (it.price || 0), 0);
    return sum + (item.price || 0);
  }, 0);

  // 按天分组
  const dayMap: { [key: string]: any[] } = {};
  filtered.forEach(item => {
    const d = new Date(item.date || 0);
    const day = d.getDate();
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(item);
  });
  const days = Object.keys(dayMap).sort((a, b) => Number(b) - Number(a));

  const { label, range } = getMonthRange(currentYear, currentMonth);

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#FFFFF5', paddingHorizontal: 0 }}>
      {/* 顶部标题和月份切换 */}
      <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 10 }}>
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>登録履歴</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)} style={{ padding: 10 }}>
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <View>
            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>{label}</ThemedText>
            <ThemedText style={{ fontSize: 13, color: '#333', textAlign: 'center' }}>{range}</ThemedText>
          </View>
          <TouchableOpacity onPress={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)} style={{ padding: 10 }}>
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      {/* 合计金额 */}
      <View style={{ backgroundColor: '#FFE4E1', borderRadius: 8, marginHorizontal: 24, marginBottom: 18, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginRight: 20 }}>合計</ThemedText>
        <ThemedText style={{ fontSize: 22, fontWeight: 'bold', color: '#C2185B', letterSpacing: 1 }}>{total}円</ThemedText>
      </View>
      {/* 列表 */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {days.length === 0 && (
          <ThemedText style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>履歴がありません</ThemedText>
        )}
        {days.map(day => (
          <View key={day} style={{ marginBottom: 18 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#7B6F4B' }}>{day}日</ThemedText>
            {dayMap[day].map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFF',
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  marginBottom: 8,
                  shadowColor: '#E0E0E0',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.12,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    // 查看详细记录逻辑
                    const details = `日付: ${new Date(item.date).toLocaleDateString()}\n商品名: ${item.shop || (item.items && item.items[0]?.item) || item.item || '—'}\n金額: ${item.total ? item.total : (item.items ? item.items.reduce((s: number, it: any) => s + (it.price || 0), 0) : item.price)}円`;
                    alert(details);
                  }}
                >
                  <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#4A4A4A', flex: 1, letterSpacing: 2 }}>
                    {item.shop || (item.items && item.items[0]?.item) || item.item || '—'}
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={{ fontSize: 18, color: '#C2185B', fontWeight: 'bold', minWidth: 70, textAlign: 'right', fontFamily: 'monospace' }}>
                  {item.total ? item.total : (item.items ? item.items.reduce((s: number, it: any) => s + (it.price || 0), 0) : item.price)}円
                </ThemedText>
                <TouchableOpacity
                  onPress={async () => {
                    // 删除记录逻辑
                    const updatedItems = items.filter((_, i) => i !== idx);
                    setItems(updatedItems);
                    await AsyncStorage.setItem('ocr_items', JSON.stringify(updatedItems));
                  }}
                  style={{ marginLeft: 10 }}
                >
                  <Ionicons name="trash" size={22} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
      {/* 返回首页按钮，可选 */}
      {/*
      <TouchableOpacity style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }} onPress={() => router.push('/') }>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
      */}
    </ThemedView>
  );
}
