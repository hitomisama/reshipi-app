import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, Image, View, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// 底部标签栏图标渲染组件
function TabBarIcon({ imagePath }: { imagePath: any }) {
  return <Image source={imagePath} style={{ width: 28, height: 28, marginBottom: -3 }} resizeMode="contain" />;
}

// TabLayout 负责底部导航结构和样式
export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <View style={{ flex: 1 }}>
      {/* 底部标签栏 */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
          tabBarStyle: {
            backgroundColor: '#7EC4A4', // 背景色
            height: 63, // 设置标签栏高度
            borderTopColor: '#7EC4A4', // 设置顶部边框颜色
          },
        }}
      >
        {/* 首页标签 */}
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: () => <TabBarIcon imagePath={require('@/assets/images/Home.png')} />,
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
        {/* 履历标签 */}
        <Tabs.Screen
          name="history"
          options={{
            title: '履历',
            headerShown: false,
            tabBarIcon: () => <TabBarIcon imagePath={require('@/assets/images/Clock.png')} />,
          }}
        />
      </Tabs>

      {/* 图片贴合底部 Touch Bar 上方 */}
      <Image
        source={require('@/assets/images/ontouchbar.png')} // 替换为你的图片路径
        style={styles.bottomImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomImage: {
    position: 'absolute',
    bottom: 60, // 距离底部 Touch Bar 的高度，可根据实际调整
    width: '100%', // 宽度设为百分比以自适应屏幕
    height: 50, // 图片高度，可根据实际调整
    resizeMode: 'cover', // 确保图片覆盖整个宽度
  },
});
