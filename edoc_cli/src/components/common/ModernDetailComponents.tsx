/**
 * ModernDetailComponents - MUI Default スタイル詳細ページ用共通コンポーネント群
 */
import React from 'react';
import {
  Box,
  Button,
  Paper,
  Modal,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  HourglassEmpty,
  ArrowBack,
  Visibility,
  Delete,
  Send,
  Refresh,
} from '@mui/icons-material';

/**
 * StatusBanner Props
 */
interface StatusBannerProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'pending';
  message: string;
  showIcon?: boolean;
}

/**
 * StatusBanner - 詳細ページ上部のステータスバナー
 */
export const StatusBanner: React.FC<StatusBannerProps> = ({
  variant,
  message,
  showIcon = true,
}) => {
  const variantStyles: Record<string, { bgcolor: string; icon: React.ReactNode }> = {
    success: {
      bgcolor: 'success.main',
      icon: <CheckCircle sx={{ fontSize: 32, color: 'white' }} />,
    },
    warning: {
      bgcolor: 'warning.main',
      icon: <Warning sx={{ fontSize: 32, color: 'white' }} />,
    },
    error: {
      bgcolor: 'error.main',
      icon: <ErrorIcon sx={{ fontSize: 32, color: 'white' }} />,
    },
    info: {
      bgcolor: 'info.main',
      icon: <Description sx={{ fontSize: 32, color: 'white' }} />,
    },
    pending: {
      bgcolor: 'primary.main',
      icon: <HourglassEmpty sx={{ fontSize: 32, color: 'white' }} />,
    },
  };

  const style = variantStyles[variant];

  return (
    <Paper
      sx={{
        bgcolor: style.bgcolor,
        borderRadius: 2,
        px: 3,
        py: 2.5,
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {showIcon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {style.icon}
          </Box>
        )}
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
          {message}
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * TitleBar Props
 */
interface TitleBarProps {
  title: string;
  status: string;
  statusLabel: string;
  onViewPdf?: () => void;
  pdfLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * TitleBar - 契約書タイトルとステータス表示バー
 */
export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  status,
  statusLabel,
  onViewPdf,
  pdfLoading = false,
  children,
}) => {
  // ステータスに応じたカラー/スタイルを取得
  const getStatusStyle = (status: string) => {
    // REMAND系: アンバー（視認性向上）
    if (status.includes('REMAND')) {
      return {
        useCustomStyle: true,
        sx: {
          bgcolor: '#fef3c7',
          color: '#92400e',
          borderColor: '#f59e0b',
          fontWeight: 600,
        },
      };
    }
    // APPROVED/CONCLUDED系: カスタム緑
    if (status.includes('APPROVED') || status.includes('CONCLUDED')) {
      return {
        useCustomStyle: true,
        sx: {
          bgcolor: '#dcfce7',
          color: '#166534',
          borderColor: '#22c55e',
          fontWeight: 600,
        },
      };
    }
    // APPROVING系: カスタム青（視認性向上）
    if (status.includes('APPROVING')) {
      return {
        useCustomStyle: true,
        sx: {
          bgcolor: '#dbeafe',
          color: '#1e40af',
          borderColor: '#3b82f6',
          fontWeight: 600,
        },
      };
    }
    // デフォルト: MUI primary
    return { useCustomStyle: false, color: 'primary' as const };
  };

  const statusStyle = getStatusStyle(status);

  // 共通のフォントサイズ設定（通常テキストとバランスの取れたサイズ）
  const baseFontStyle = {
    fontSize: 'calc(var(--text-sm) + 1px)',
    height: 'auto',
    '& .MuiChip-label': {
      padding: '4px 10px',
    },
  };

  return (
    <Paper sx={{ p: 2.5, mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        {statusStyle.useCustomStyle ? (
          <Chip label={statusLabel} variant="outlined" sx={{ ...baseFontStyle, ...statusStyle.sx }} />
        ) : (
          <Chip label={statusLabel} color={statusStyle.color} sx={baseFontStyle} />
        )}
        <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }}>
          {title}
        </Typography>
        {onViewPdf && (
          <Button
            variant="contained"
            color="primary"
            startIcon={pdfLoading ? <CircularProgress size={18} color="inherit" /> : <Visibility />}
            onClick={onViewPdf}
            disabled={pdfLoading}
          >
            契約書を閲覧
          </Button>
        )}
        {children}
      </Box>
    </Paper>
  );
};

/**
 * ActionBar Props
 */
interface ActionBarProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

/**
 * ActionBar - アクションボタン配置用バー
 */
export const ActionBar: React.FC<ActionBarProps> = ({
  children,
  align = 'left',
}) => {
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        mb: 2,
        justifyContent: justifyContent[align],
      }}
    >
      {children}
    </Box>
  );
};

/**
 * BackButton Props
 */
interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

/**
 * BackButton - 一覧に戻るボタン
 */
export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = '一覧へ戻る',
}) => (
  <Button variant="outlined" startIcon={<ArrowBack />} onClick={onClick}>
    {label}
  </Button>
);

/**
 * DeleteButton Props
 */
interface DeleteButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

/**
 * DeleteButton - 破棄ボタン
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  label = '破棄する',
  disabled = false,
}) => (
  <Button
    variant="contained"
    color="error"
    startIcon={<Delete />}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </Button>
);

/**
 * SendButton Props
 */
interface SendButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'success' | 'primary';
}

/**
 * SendButton - 送信/実行ボタン
 */
export const SendButton: React.FC<SendButtonProps> = ({
  onClick,
  label = '送信する',
  disabled = false,
  loading = false,
  variant = 'success',
}) => (
  <Button
    variant="contained"
    color={variant === 'success' ? 'success' : 'primary'}
    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
    onClick={onClick}
    disabled={disabled || loading}
  >
    {label}
  </Button>
);

/**
 * RefreshButton Props
 */
interface RefreshButtonProps {
  onClick: () => void;
  label?: string;
  loading?: boolean;
}

/**
 * RefreshButton - 更新ボタン
 */
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  label = '更新',
  loading = false,
}) => (
  <Button
    variant="outlined"
    startIcon={loading ? <CircularProgress size={18} /> : <Refresh />}
    onClick={onClick}
    disabled={loading}
  >
    {label}
  </Button>
);

/**
 * InfoCard Props
 */
interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

/**
 * InfoCard - 情報表示カード
 */
export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  variant = 'default',
}) => {
  const headerColors: Record<string, string> = {
    default: 'grey.100',
    success: 'success.lighter',
    warning: 'warning.lighter',
    error: 'error.lighter',
  };

  return (
    <Paper sx={{ overflow: 'hidden', mb: 2 }}>
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: headerColors[variant],
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
};

/**
 * InfoField Props
 */
interface InfoFieldProps {
  label: string;
  value: string | undefined | null;
  fullWidth?: boolean;
}

/**
 * InfoField - 情報フィールド（ラベル + 値）
 */
export const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  fullWidth = false,
}) => (
  <Box sx={{ mb: 2, width: fullWidth ? '100%' : 'auto' }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {value || '-----'}
    </Typography>
  </Box>
);

/**
 * ModernTabs Props
 */
interface ModernTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: { label: string; icon?: React.ReactElement }[];
  variant?: 'default' | 'success' | 'error';
}

/**
 * ModernTabs - タブコンポーネント
 */
export const ModernTabs: React.FC<ModernTabsProps> = ({
  value,
  onChange,
  tabs,
  variant = 'default',
}) => {
  const indicatorColors: Record<string, string> = {
    default: 'primary.main',
    success: 'success.main',
    error: 'error.main',
  };

  return (
    <Paper sx={{ mb: 2 }}>
      <Tabs
        value={value}
        onChange={onChange}
        variant="fullWidth"
        indicatorColor={variant === 'default' ? 'primary' : undefined}
        sx={{
          '& .MuiTabs-indicator': {
            bgcolor: indicatorColors[variant],
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} />
        ))}
      </Tabs>
    </Paper>
  );
};

/**
 * TabPanel Props
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel - タブパネルコンテナ
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
}) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`detail-tabpanel-${index}`}
    aria-labelledby={`detail-tab-${index}`}
  >
    {value === index && children}
  </Box>
);

/**
 * PdfViewerModal Props
 */
interface PdfViewerModalProps {
  open: boolean;
  onClose: () => void;
  pdfBase64: string;
}

/**
 * PdfViewerModal - PDFプレビューモーダル
 */
export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  open,
  onClose,
  pdfBase64,
}) => (
  <Modal open={open} onClose={onClose} aria-labelledby="pdf-viewer-modal">
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        height: '95%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ bgcolor: 'primary.main', px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
          契約書プレビュー
        </Typography>
      </Box>
      <Box sx={{ flex: 1, bgcolor: 'grey.100', overflow: 'hidden' }}>
        <embed
          type="application/pdf"
          src={`${pdfBase64}#zoom=100`}
          height="100%"
          width="100%"
        />
      </Box>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" onClick={() => window.open(pdfBase64, '_blank')}>
          新しいタブで開く
        </Button>
        <Button variant="contained" onClick={onClose}>
          閉じる
        </Button>
      </Box>
    </Box>
  </Modal>
);

/**
 * ConfirmDialog Props
 */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'warning';
  loading?: boolean;
  children?: React.ReactNode;
}

/**
 * ConfirmDialog - 確認ダイアログ
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '実行する',
  cancelLabel = 'キャンセル',
  variant = 'danger',
  loading = false,
  children,
}) => {
  const variantConfig: Record<string, {
    headerBg: string;
    confirmColor: 'error' | 'success' | 'warning';
    icon: React.ReactNode;
  }> = {
    danger: {
      headerBg: 'error.main',
      confirmColor: 'error',
      icon: <Warning color="error" sx={{ fontSize: 48 }} />,
    },
    success: {
      headerBg: 'success.main',
      confirmColor: 'success',
      icon: <CheckCircle color="success" sx={{ fontSize: 48 }} />,
    },
    warning: {
      headerBg: 'warning.main',
      confirmColor: 'warning',
      icon: <Warning color="warning" sx={{ fontSize: 48 }} />,
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ bgcolor: config.headerBg, px: 3, py: 2.5 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {config.icon}
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500, flex: 1 }}>
              {message}
            </Typography>
          </Box>
          {children && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              {children}
            </Paper>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color={config.confirmColor}
              onClick={onConfirm}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {confirmLabel}
            </Button>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
