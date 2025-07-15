import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useBudgetStore } from "@/app/store/budgetStore";

export default function BudgetBar() {
  const budget = useBudgetStore((state) => state.budget);
  const expenses = useBudgetStore((state) => state.expenses);

  // 计算总支出
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total, 0);

  // 计算预算余量百分比
  const remainingPercentage = budget > 0
    ? Math.max(((budget - totalExpenses) / budget) * 100, 0)
    : 100; // 如果预算为 0，默认显示 100%

    console.log("Remaining Percentage:", remainingPercentage);
    console.log("Total Expenses:", totalExpenses);
    console.log("Budget:", budget);

  // 根据百分比选择图像
  const getImageSource = () => {
    if (remainingPercentage >= 50) {
      return require("../../assets/images/full_pig.png"); // 满余量图像
    } else if (remainingPercentage >= 20) {
      return require("../../assets/images/normal_pig.png"); // 中余量图像
    } else {
      return require("../../assets/images/Fainting_pig.png"); // 低余量图像
    }
  };

  // 根据百分比设置条形图颜色
  const getBarColor = () => {
    if (remainingPercentage >= 50) {
      return "green"; // 高余量
    } else if (remainingPercentage >= 20) {
      return "orange"; // 中余量
    } else {
      return "red"; // 低余量
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>预算余量</Text>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              height: `${remainingPercentage}%`,
              backgroundColor: getBarColor(),
            },
          ]}
        />
      </View>
      <Image source={getImageSource()} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  barContainer: {
    width: 50,
    height: 200,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});
