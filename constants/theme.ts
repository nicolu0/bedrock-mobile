/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Semantic colors
    success: '#22c55e',
    successBackground: '#dcfce7',
    danger: '#ef4444',
    dangerBackground: '#fee2e2',
    warning: '#f59e0b',
    warningBackground: '#fef3c7',
    info: '#3b82f6',
    infoBackground: '#dbeafe',
    // Card colors
    card: '#f8f9fa',
    cardBorder: '#e5e7eb',
    // Secondary
    secondary: '#6b7280',
    secondaryBackground: '#f3f4f6',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
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
