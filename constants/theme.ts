/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#171717';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#171717',
    background: '#f6f5f3',
    tint: tintColorLight,
    icon: '#a3a3a3',
    tabIconDefault: '#a3a3a3',
    tabIconSelected: tintColorLight,
    label: '#a3a3a3',
    // Semantic colors
    success: '#10b981',
    successBackground: '#d1fae5',
    danger: '#f43f5e',
    dangerBackground: '#ffe4e6',
    warning: '#f59e0b',
    warningBackground: '#fef3c7',
    info: '#0ea5e9',
    infoBackground: '#e0f2fe',
    // Card colors
    card: '#ffffff',
    cardBorder: '#e5e5e5',
    // Secondary
    secondary: '#525252',
    secondaryBackground: '#f5f5f5',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    label: '#9BA1A6',
    // Semantic colors
    success: '#4ade80',
    successBackground: '#166534',
    danger: '#f87171',
    dangerBackground: '#991b1b',
    warning: '#fbbf24',
    warningBackground: '#92400e',
    info: '#60a5fa',
    infoBackground: '#1e40af',
    // Card colors
    card: '#1e2022',
    cardBorder: '#2d3134',
    // Secondary
    secondary: '#9ca3af',
    secondaryBackground: '#374151',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
