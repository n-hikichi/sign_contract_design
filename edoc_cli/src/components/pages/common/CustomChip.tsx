import { Chip } from "@mui/material";

interface ApproverInfoForUserProps {
    value: string;
    label: string;
}

// 色の定義（カスタムスタイル対応）
// shape: 'oval'=オーバル（デフォルト）, 'rounded'=角丸長方形
interface ChipStyle {
    status: string;
    color?: 'primary' | 'error' | 'success' | 'warning' | 'default';
    shape?: 'oval' | 'rounded';
    customStyle?: {
        bgcolor: string;
        color: string;
        borderColor?: string;
    };
}

const chipStyles: ChipStyle[] = [
    {
        status: 'CUSTOMER_APPROVING',
        customStyle: {
            bgcolor: '#dbeafe',
            color: '#1e40af',
            borderColor: '#3b82f6',
        }
    },
    {
        status: 'CUSTOMER_REMANDING',
        customStyle: {
            bgcolor: '#fef3c7',
            color: '#92400e',
            borderColor: '#f59e0b',
        }
    },
    {
        status: 'INTERNAL_APPROVING',
        customStyle: {
            bgcolor: '#dbeafe',
            color: '#1e40af',
            borderColor: '#3b82f6',
        }
    },
    {
        status: 'INTERNAL_REMANDING',
        customStyle: {
            bgcolor: '#fef3c7',
            color: '#92400e',
            borderColor: '#f59e0b',
        }
    },
    {
        status: 'INTERNAL_APPROVED',
        shape: 'rounded',
        customStyle: {
            bgcolor: '#dcfce7',
            color: '#166534',
            borderColor: '#22c55e',
        }
    },
    {
        status: 'UPLOAD_COMPLETED',
        customStyle: {
            bgcolor: '#dcfce7',
            color: '#166534',
            borderColor: '#22c55e',
        }
    },
    {
        status: 'NOT_UPLOAD',
        customStyle: {
            bgcolor: '#fee2e2',
            color: '#991b1b',
            borderColor: '#ef4444',
        }
    },
]

/**
 *
 * 現在の契約書のステータスを表示する
 *
 */
const CustomChip: React.FC<ApproverInfoForUserProps> = ({ value, label }) => {
    const chipStyle = chipStyles.find(chip => chip.status === value);

    // 形状に応じたborderRadius（rounded=8px, oval=デフォルト）
    const borderRadius = chipStyle?.shape === 'rounded' ? '8px' : undefined;

    // 共通のフォントサイズ設定（通常テキストとバランスの取れたサイズ）
    const baseFontStyle = {
        fontSize: 'calc(var(--text-sm) + 1px)',
        height: 'auto',
        '& .MuiChip-label': {
            padding: '4px 10px',
        },
    };

    // カスタムスタイルがある場合
    if (chipStyle?.customStyle) {
        return (
            <Chip
                label={label}
                variant="outlined"
                sx={{
                    ...baseFontStyle,
                    bgcolor: chipStyle.customStyle.bgcolor,
                    color: chipStyle.customStyle.color,
                    borderColor: chipStyle.customStyle.borderColor,
                    fontWeight: 600,
                    borderRadius,
                }}
            />
        );
    }

    // 標準のMUIカラーを使用
    const color = chipStyle?.color || 'default';
    return (
        <Chip
            label={label}
            color={color as "primary" | "error" | "success" | "warning" | "default"}
            sx={{ ...baseFontStyle, borderRadius }}
        />
    );
};

export default CustomChip;