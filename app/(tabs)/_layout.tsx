import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// 你可以在 https://icons.expo.fyi/ 上查看所有内置图标和图标库
// TabBarIcon 组件用于渲染底部标签栏的图标
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

// TabLayout 组件，定义底部标签栏的结构和样式
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // 设置底部标签栏激活时的颜色
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // 在 Web 端禁用静态渲染头部，防止 React Navigation v6 的 hydration 错误
        headerShown: useClientOnlyValue(false, true),
      }}>
      {/* 第一个标签页，通常为首页 */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'home', // 标签标题
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          // 右上角按钮，点击跳转到 /modal 页面
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      {/* 第二个标签页，改为历史记录 */}
      <Tabs.Screen
        name="../home/history" // 指向历史记录页面
        options={{
          title: '履历', // 标签标题
          tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />, // 使用历史图标
        }}
      />
    </Tabs>
  );
}
