import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, Image, View, StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// 底部标签栏图标渲染组件
function TabBarIcon({ imagePath, focused = false }: { imagePath: any; focused?: boolean }) {
  return (
    <View style={{
      transform: [{ scale: focused ? 1.1 : 1 }], // 激活时放大
      opacity: focused ? 1 : 0.7, // 激活时不透明，未激活时半透明
    }}>
      <Image 
        source={imagePath} 
        style={{ 
          width: 28, 
          height: 28, 
          marginBottom: -3,
          tintColor: focused ? '#ffffff' : '#8B7355', // 根据激活状态改变颜色
        }} 
        resizeMode="contain" 
      />
    </View>
  );
}

// TabLayout 负责底部导航结构和样式
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';
  
  return (
    <View style={{ flex: 1 }}>
      {/* 底部标签栏 */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4D2615', // 激活时的文字颜色
          tabBarInactiveTintColor: '#8B7355', // 未激活时的文字颜色
          headerShown: useClientOnlyValue(false, true),
          tabBarStyle: {
            backgroundColor: '#7EC4A4', // 背景色
            height: 75, // 增加标签栏高度
            borderTopColor: '#7EC4A4', // 设置顶部边框颜色
            borderTopWidth: 0, // 移除顶部边框
            paddingBottom: 8, // 底部内边距
            paddingTop: 8, // 顶部内边距
            elevation: 10, // Android 阴影
            shadowColor: '#000', // iOS 阴影颜色
            shadowOffset: { width: 0, height: -2 }, // iOS 阴影偏移
            shadowOpacity: 0.1, // iOS 阴影透明度
            shadowRadius: 8, // iOS 阴影半径
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            fontFamily: 'azuki_font', // 使用自定义字体
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}>

        
        {/* 隐藏的页面 - 不在底部标签栏显示 */}
        <Tabs.Screen
          name="manualinput"
          options={{
            headerShown: false,
            tabBarButton: () => null, // 隐藏此标签
          }}
        />

                {/* 首页标签 */}
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon 
                imagePath={require('@/assets/images/Home.png')} 
                focused={focused}
              />
            ),
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

        <Tabs.Screen
          name="Camera"
          options={{
            headerShown: false,
            tabBarButton: () => null, // 隐藏此标签
          }}
        />

                {/* 履历标签 */}
        <Tabs.Screen
          name="history"
          options={{
            title: '',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon 
                imagePath={require('@/assets/images/Clock.png')} 
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ocrresult"
          options={{
            headerShown: false,
            tabBarButton: () => null, // 隐藏此标签
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
    bottom: 73, // 调整到新的标签栏高度上方
    width: '100%',
    height: 50,
    resizeMode: 'cover',
    zIndex: 1, // 确保图片在标签栏上方
  },
});
