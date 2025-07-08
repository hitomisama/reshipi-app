import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText, ThemedView } from '@/components/Themed';

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>设置</ThemedText>
      {/* 其他内容... */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
