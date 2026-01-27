/**
 * デザイントークン定義
 *
 * MUI と Tailwind CSS で共通使用するデザイントークンを定義
 * 色、スペーシング、タイポグラフィなどの統一された値を提供
 */

/**
 * カラーパレット
 * MUIのデフォルトパレットとTailwind設定で同じ値を使用
 */
export const colors = {
  // プライマリカラー
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  // セカンダリカラー
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  // エラーカラー
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  // 警告カラー
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  // 情報カラー
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  // 成功カラー
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  // グレースケール
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // ブランドカラー（プロジェクト固有）
  brand: {
    navy: '#002060',
    navyLight: '#1a3a7a',
    navyDark: '#001040',
  },
  // 背景色
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    grey: '#eeeeee',
  },
  // テキスト色
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
} as const;

/**
 * スペーシング
 * MUIのspacing関数と同等（1単位 = 8px）
 */
export const spacing = {
  0: '0px',
  0.5: '4px',
  1: '8px',
  1.5: '12px',
  2: '16px',
  2.5: '20px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
  7: '56px',
  8: '64px',
  9: '72px',
  10: '80px',
} as const;

/**
 * スペーシングユーティリティ関数
 *
 * @param multiplier - 倍数（1単位 = 8px）
 * @returns px値
 */
export const getSpacing = (multiplier: number): string => {
  return `${multiplier * 8}px`;
};

/**
 * ボーダー半径
 */
export const borderRadius = {
  none: '0px',
  sm: '4px',
  default: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

/**
 * シャドウ
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

/**
 * フォントサイズ
 */
export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
} as const;

/**
 * z-index
 */
export const zIndex = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

/**
 * トランジション
 */
export const transitions = {
  fast: '150ms ease-in-out',
  default: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  bounce: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  card3d: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

/**
 * グラデーション定義（カラフル3Dデザイン）
 */
export const gradients = {
  // カードグラデーション
  cardBlue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  cardPurple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  cardPink: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  cardOrange: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  cardGreen: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  cardRainbow: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  // テキストグラデーション
  text: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
  // テキストサイズセレクターボタン
  sizeSelector: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  // レインボーボーダー
  rainbow: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f97316, #22c55e, #3b82f6)',
  // メッシュ背景用
  meshPurple: 'radial-gradient(ellipse at 20% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
  meshBlue: 'radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
  meshPink: 'radial-gradient(ellipse at 40% 80%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)',
  meshGreen: 'radial-gradient(ellipse at 90% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)',
  meshOrange: 'radial-gradient(ellipse at 10% 90%, rgba(251, 146, 60, 0.1) 0%, transparent 50%)',
} as const;

/**
 * グラデーションカラー（Tailwind/MUI用）
 */
export const gradientColors = {
  blue: { from: '#3b82f6', to: '#1d4ed8' },
  purple: { from: '#8b5cf6', to: '#7c3aed' },
  pink: { from: '#ec4899', to: '#db2777' },
  orange: { from: '#f97316', to: '#ea580c' },
  green: { from: '#22c55e', to: '#16a34a' },
  rainbow: { from: '#667eea', via: '#764ba2', to: '#f093fb' },
} as const;

/**
 * アニメーション設定（カラフル3Dデザイン）
 */
export const animations = {
  // 浮遊アニメーション（統計カード用）
  float3d: {
    name: 'float-3d',
    duration: '4s',
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
  // シマー効果（AIアシスタント用）
  shimmer: {
    name: 'shimmer',
    duration: '3s',
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
  // バッジパルス（サイドメニューバッジ用）
  badgePulse: {
    name: 'badge-pulse',
    duration: '2s',
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
  // グラデーション回転（レインボーボーダー用）
  gradientRotate: {
    name: 'gradient-rotate',
    duration: '4s',
    timing: 'linear',
    iteration: 'infinite',
  },
} as const;

/**
 * テキストサイズ（CSS変数ベース）
 */
export const textSizes = {
  xs: 'var(--text-xs)',
  sm: 'var(--text-sm)',
  md: 'var(--text-md)',
  lg: 'var(--text-lg)',
  xl: 'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
  '3xl': 'var(--text-3xl)',
  '4xl': 'var(--text-4xl)',
  '5xl': 'var(--text-5xl)',
} as const;

/**
 * アイコンサイズ（CSS変数ベース）
 */
export const iconSizes = {
  sm: 'var(--icon-sm)',
  md: 'var(--icon-md)',
  lg: 'var(--icon-lg)',
  xl: 'var(--icon-xl)',
} as const;

/**
 * テキストサイズオプション
 */
export type TextSizeOption = 's' | 'm' | 'l' | 'xl';
export const textSizeOptions: Record<TextSizeOption, { label: string; description: string }> = {
  s: { label: 'S', description: '小さめ' },
  m: { label: 'M', description: '標準' },
  l: { label: 'L', description: '大きめ' },
  xl: { label: 'XL', description: '特大' },
} as const;

/**
 * 3Dカードシャドウ
 */
export const card3dShadows = {
  default: `
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 20px 25px -5px rgba(0, 0, 0, 0.05)
  `,
  hover: `
    0 10px 20px -5px rgba(0, 0, 0, 0.1),
    0 25px 35px -10px rgba(0, 0, 0, 0.12),
    0 40px 50px -15px rgba(0, 0, 0, 0.08)
  `,
} as const;

/**
 * デザイントークンのエクスポート
 */
const designTokens = {
  colors,
  spacing,
  getSpacing,
  borderRadius,
  shadows,
  fontSize,
  zIndex,
  transitions,
  gradients,
  gradientColors,
  animations,
  textSizes,
  iconSizes,
  textSizeOptions,
  card3dShadows,
} as const;

export default designTokens;
