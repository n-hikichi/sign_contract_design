/**
 * テキストサイズContext
 *
 * グローバルなテキストサイズ管理を提供
 * localStorage に保存し、ページリロード後も設定を維持
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { TextSizeOption } from '../styles/designTokens';

/** テキストサイズのラベル */
const TEXT_SIZE_LABELS: Record<TextSizeOption, string> = {
  s: 'S（小さめ）',
  m: 'M（標準）',
  l: 'L（大きめ）',
  xl: 'XL（特大）',
};

/** localStorage キー */
const STORAGE_KEY = 'textSize';

/** デフォルトサイズ */
const DEFAULT_SIZE: TextSizeOption = 'm';

/** Context の型定義 */
interface TextSizeContextType {
  /** 現在のテキストサイズ */
  textSize: TextSizeOption;
  /** テキストサイズを設定 */
  setTextSize: (size: TextSizeOption) => void;
  /** 現在のサイズのラベル */
  textSizeLabel: string;
}

/** Context */
const TextSizeContext = createContext<TextSizeContextType | undefined>(
  undefined
);

/** Provider Props */
interface TextSizeProviderProps {
  children: React.ReactNode;
}

/**
 * テキストサイズProvider
 *
 * アプリケーション全体でテキストサイズを管理
 */
export const TextSizeProvider: React.FC<TextSizeProviderProps> = ({
  children,
}) => {
  const [textSize, setTextSizeState] = useState<TextSizeOption>(() => {
    // localStorageから初期値を取得
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['s', 'm', 'l', 'xl'].includes(saved)) {
      return saved as TextSizeOption;
    }
    return DEFAULT_SIZE;
  });

  /**
   * bodyの data-text-size 属性を更新
   */
  useEffect(() => {
    document.body.setAttribute('data-text-size', textSize);
  }, [textSize]);

  /**
   * テキストサイズを設定
   */
  const setTextSize = useCallback((size: TextSizeOption) => {
    setTextSizeState(size);
    localStorage.setItem(STORAGE_KEY, size);
  }, []);

  /**
   * 現在のサイズラベル
   */
  const textSizeLabel = useMemo(
    () => TEXT_SIZE_LABELS[textSize],
    [textSize]
  );

  const value = useMemo(
    () => ({
      textSize,
      setTextSize,
      textSizeLabel,
    }),
    [textSize, setTextSize, textSizeLabel]
  );

  return (
    <TextSizeContext.Provider value={value}>
      {children}
    </TextSizeContext.Provider>
  );
};

/**
 * テキストサイズを使用するためのカスタムフック
 *
 * @throws Context外で使用された場合にエラー
 */
export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};

export default TextSizeContext;
