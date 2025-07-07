/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import React from 'react';
import { Text as RNText, View as RNView } from 'react-native';
import { useColorScheme } from 'react-native';

const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type ThemedTextProps = ThemeProps & RNText['props'];
export type ThemedViewProps = ThemeProps & RNView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme]?.[colorName] || Colors.light[colorName];
  }
}

export function ThemedText(props: ThemedTextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <RNText style={[{ color }, style]} {...otherProps} />;
}

export function ThemedView(props: ThemedViewProps) {
  const { style, lightColor, darkColor, children, ...restProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const {
    light,
    dark,
    ...safeProps
  } = restProps as any;

  return (
    <RNView 
      style={[{ backgroundColor }, style]} 
      {...safeProps}
    >
      {children}
    </RNView>
  );
}
