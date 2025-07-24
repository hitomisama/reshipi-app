// history.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start,
    end,
    label: `${year}年${month + 1}月`,
    range: `${start.getMonth() + 1}月1日〜${
      end.getMonth() + 1
    }月${end.getDate()}日`,
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
      const json = await AsyncStorage.getItem("ocr_items");
      const arr = json ? JSON.parse(json) : [];
      setItems(arr);
    })();
  }, []);

  useEffect(() => {
    // 过滤当前月
    const { start, end } = getMonthRange(currentYear, currentMonth);
    setFiltered(
      items.filter((item) => {
        const d = new Date(item.date || 0);
        return d >= start && d <= end;
      })
    );
  }, [items, currentYear, currentMonth]);

  // 合计金额
  const total = filtered.reduce((sum, item) => {
    if (item.total) return sum + item.total;
    if (item.items)
      return (
        sum + item.items.reduce((s: number, it: any) => s + (it.price || 0), 0)
      );
    return sum + (item.price || 0);
  }, 0);
  console.log("total", total);

  // 按日期排序记录
  const sortedRecords = filtered.sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  const { label, range } = getMonthRange(currentYear, currentMonth);

  return (
    <View style={styles.container}>
      {/* 顶部标题和月份切换 */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>登録履歴</Text>
        <View style={styles.monthSwitchContainer}>
          <TouchableOpacity
            onPress={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))}
            style={{ padding: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.monthLabel}>{label}</Text>
            <Text style={styles.monthRange}>{range}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))}
            style={{ padding: 10 }}
          >
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      {/* 合计金额 */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>合計</Text>
        <Text style={styles.totalValue}>{total}円</Text>
      </View>
      {/* 列表 */}
      <ScrollView style={styles.scrollView}>
        {sortedRecords.length === 0 && (
          <Text style={styles.emptyMessage}>履歴がありません</Text>
        )}
        {sortedRecords.map((item, idx) => (
          <View key={idx} style={styles.recordContainer}>
            <View style={styles.recordLeft}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {new Date(item.date || 0).getDate()}
                </Text>
                <Text style={styles.dateText}>日</Text>
              </View>
              <TouchableOpacity
                style={styles.recordContent}
                onPress={() => {
                  // 查看详细记录逻辑
                  const details = `日付: ${new Date(
                    item.date
                  ).toLocaleDateString()}
商品名: ${item.shop || (item.items && item.items[0]?.item) || item.item || "—"}
金額: ${
                    item.total
                      ? item.total
                      : item.items
                      ? item.items.reduce(
                          (s: number, it: any) => s + (it.price || 0),
                          0
                        )
                      : item.price
                  }円`;
                  alert(details);
                }}
              >
                <Text style={styles.recordText}>
                  {item.shop ||
                    (item.items && item.items[0]?.item) ||
                    item.item ||
                    "—"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.recordValue}>
              {item.total
                ? item.total
                : item.items
                ? item.items.reduce(
                    (s: number, it: any) => s + (it.price || 0),
                    0
                  )
                : item.price}
              円
            </Text>
            <TouchableOpacity
              onPress={async () => {
                // 删除记录逻辑
                const updatedItems = items.filter((_, i) => i !== idx);
                setItems(updatedItems);
                await AsyncStorage.setItem(
                  "ocr_items",
                  JSON.stringify(updatedItems)
                );
              }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={22} color="red" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF5",
    paddingHorizontal: 0,
    maxWidth: isWeb ? 900 : undefined,
    alignSelf: isWeb ? 'center' : 'stretch',
  },
  titleContainer: {
    alignItems: "center",
    marginTop: isWeb ? 40 : 30,
    marginBottom: isWeb ? 15 : 10,
  },
  titleText: {
    fontSize: isWeb ? 30 : 26,
    marginBottom: isWeb ? 30 : 24.5,
    marginTop: isWeb ? 60 : 74,
    fontFamily: "azuki_font",
  },
  monthSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthLabel: {
    fontSize: isWeb ? 30 : 26,
    textAlign: "center",
    marginBottom: isWeb ? 10 : 7.5,
    fontFamily: "azuki_font",
  },
  monthRange: {
    fontSize: isWeb ? 26 : 23,
    color: "#000000",
    textAlign: "center",
    marginBottom: isWeb ? 30 : 24.5,
    fontFamily: "azuki_font",
  },
  totalContainer: {
    backgroundColor: "#FFD8D0",
    marginHorizontal: isWeb ? 32 : 24,
    marginBottom: isWeb ? 24 : 18,
    padding: isWeb ? 20 : 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: isWeb ? 12 : 8,
  },
  totalLabel: {
    fontSize: isWeb ? 36 : 32,
    color: "#000000",
    marginRight: isWeb ? 25 : 20,
    fontFamily: "azuki_font",
  },
  totalValue: {
    fontSize: isWeb ? 26 : 22,
    fontWeight: "bold",
    color: "#C2185B",
    letterSpacing: 1,
    fontFamily: "azuki_font",
  },
  dayContainer: {
    marginBottom: isWeb ? 24 : 18,
  },
  dateText: {
    fontSize: isWeb ? 30 : 26,
    color: "black",
    marginRight: isWeb ? 16 : 12,
    minWidth: isWeb ? 40 : 30,
    fontFamily: "azuki_font",
  },
  recordLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordContent: {
    flex: 1,
  },
  dayRow: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: isWeb ? 6 : 4,
  },
  dayLabel: {
    fontSize: isWeb ? 18 : 16,
    color: "#7B6F4B",
  },
  recordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: isWeb ? 12 : 10,
    paddingVertical: isWeb ? 14 : 10,
    paddingHorizontal: isWeb ? 20 : 16,
    marginBottom: isWeb ? 12 : 8,
    shadowColor: "#E0E0E0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
    backgroundColor: "#FFF",
  },
  recordText: {
    fontSize: isWeb ? 30 : 26,
    color: "#000",
    flex: 1,
    letterSpacing: 2,
    fontFamily: "azuki_font",
    paddingLeft: isWeb ? 15 : 10,
  },
  recordValue: {
    fontSize: isWeb ? 30 : 26,
    color: "#000",
    minWidth: isWeb ? 90 : 70,
    textAlign: "right",
    fontFamily: "azuki_font",
  },
  deleteButton: {
    marginLeft: isWeb ? 15 : 10,
    padding: isWeb ? 8 : 4,
  },
  emptyMessage: {
    color: "#888",
    textAlign: "center",
    marginTop: isWeb ? 60 : 40,
    fontFamily: "azuki_font",
    fontSize: isWeb ? 18 : 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: isWeb ? 32 : 16,
  },
  dateContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: isWeb ? 6 : 4,
    gap: isWeb ? 12 : 8,
  },
});
