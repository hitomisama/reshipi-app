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
    if (remainingPercentage >= 75) {
      return require("../../assets/images/full_pig.png"); // 充足
    } else if (remainingPercentage >= 50) {
      return require("../../assets/images/normal_pig.png"); // 正常
    } else if (remainingPercentage >= 20) {
      return require("../../assets/images/cry_pig.png"); // 较低
    } else {
      return require("../../assets/images/Fainting_pig.png"); // 极低
    }
  };

  // 根据百分比设置条形图颜色
  // const getBarColor = () => {
  //   if (remainingPercentage >= 50) {
  //     return "#7EC4A4"; // 高余量
  //   } else if (remainingPercentage >= 20) {
  //     return "orange"; // 中余量
  //   } else {
  //     return "red"; // 低余量
  //   }
  // };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                height: `${remainingPercentage}%`,
                backgroundColor: "#7EC4A4",
              },
            ]}
          />
        </View>
      </View>
      {/* <Text style={styles.title}>预算余量</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
  imageWrapper: {
    position: "relative",
    width: 120, // 可以适当加大
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "250%",
    height: "250%",
  },
  barContainer: {
    position: "absolute",
    top: 80,
    left: 35, // 根据实际图片内容调整
    width: 40,
    height: 120,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
});
