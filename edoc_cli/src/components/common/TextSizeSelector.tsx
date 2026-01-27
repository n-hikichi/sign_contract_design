/**
 * テキストサイズセレクターコンポーネント
 *
 * S/M/L/XL の4段階でテキストサイズを選択
 * 70歳以上のユーザーにも対応した大きめサイズ（L/XL）を提供
 */
import { Box, Tooltip } from '@mui/material';
import React from 'react';
import { useTextSize } from '../../contexts/TextSizeContext';
import type { TextSizeOption } from '../../styles/designTokens';

/** サイズボタンの設定 */
const SIZE_BUTTONS: Array<{
  size: TextSizeOption;
  label: string;
  fontSize: string;
  title: string;
}> = [
  { size: 's', label: 'A', fontSize: '11px', title: '小さめ' },
  { size: 'm', label: 'A', fontSize: '14px', title: '標準' },
  { size: 'l', label: 'A', fontSize: '17px', title: '大きめ' },
  { size: 'xl', label: 'A', fontSize: '20px', title: '特大' },
];

/** Props */
interface TextSizeSelectorProps {
  /** コンパクト表示（アイコンなし） */
  compact?: boolean;
}

/**
 * テキストサイズセレクター
 *
 * ヘッダーに配置してテキストサイズを切り替え
 */
const TextSizeSelector: React.FC<TextSizeSelectorProps> = ({
  compact = false,
}) => {
  const { textSize, setTextSize } = useTextSize();

  return (
    <Box
      className="text-size-selector"
      role="group"
      aria-label="文字サイズ選択"
    >
      {!compact && (
        <span
          style={{
            color: '#8b5cf6',
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '0 4px',
          }}
        >
          tT
        </span>
      )}
      {SIZE_BUTTONS.map(({ size, label, fontSize, title }) => (
        <Tooltip key={size} title={title} arrow>
          <button
            type="button"
            className={`text-size-btn ${textSize === size ? 'active' : ''}`}
            data-size={size}
            onClick={() => setTextSize(size)}
            aria-pressed={textSize === size}
            aria-label={`文字サイズ: ${title}`}
          >
            <span style={{ fontSize }}>{label}</span>
          </button>
        </Tooltip>
      ))}
    </Box>
  );
};

export default TextSizeSelector;
