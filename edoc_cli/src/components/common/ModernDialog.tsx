/**
 * ModernDialog - MUI Default スタイル汎用ダイアログ
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  Help,
} from '@mui/icons-material';

/**
 * ダイアログのバリアント
 */
export type DialogVariant = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'default';

/**
 * ModernDialog Props
 */
interface ModernDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  variant?: DialogVariant;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  hideCloseButton?: boolean;
  icon?: React.ReactNode;
}

/**
 * バリアントに応じたカラー設定
 */
const variantConfig: Record<DialogVariant, {
  icon: React.ReactNode;
  color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary';
  bgColor: string;
}> = {
  success: {
    icon: <CheckCircle sx={{ fontSize: 32, color: 'white' }} />,
    color: 'success',
    bgColor: 'success.main',
  },
  error: {
    icon: <ErrorIcon sx={{ fontSize: 32, color: 'white' }} />,
    color: 'error',
    bgColor: 'error.main',
  },
  warning: {
    icon: <Warning sx={{ fontSize: 32, color: 'white' }} />,
    color: 'warning',
    bgColor: 'warning.main',
  },
  info: {
    icon: <Info sx={{ fontSize: 32, color: 'white' }} />,
    color: 'info',
    bgColor: 'info.main',
  },
  confirm: {
    icon: <Help sx={{ fontSize: 32, color: 'white' }} />,
    color: 'primary',
    bgColor: 'primary.main',
  },
  default: {
    icon: null,
    color: 'primary',
    bgColor: 'grey.100',
  },
};

/**
 * ModernDialog コンポーネント
 */
const ModernDialog: React.FC<ModernDialogProps> = ({
  open,
  onClose,
  title,
  variant = 'default',
  children,
  primaryAction,
  secondaryAction,
  maxWidth = 'sm',
  hideCloseButton = false,
  icon,
}) => {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;
  const isColoredHeader = variant !== 'default';

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      {/* ヘッダー */}
      <DialogTitle
        sx={{
          bgcolor: isColoredHeader ? config.bgColor : 'grey.50',
          p: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: isColoredHeader ? 0 : 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {displayIcon && (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: isColoredHeader ? 'rgba(255,255,255,0.2)' : config.bgColor,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {displayIcon}
              </Box>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: isColoredHeader ? 'white' : 'text.primary',
              }}
            >
              {title}
            </Typography>
          </Box>
          {!hideCloseButton && (
            <IconButton onClick={onClose} size="small">
              <Close sx={{ color: isColoredHeader ? 'rgba(255,255,255,0.8)' : 'text.secondary' }} />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      {/* コンテンツ */}
      <DialogContent sx={{ p: 3 }}>
        <Typography component="div" color="text.secondary">
          {children}
        </Typography>
      </DialogContent>

      {/* アクション */}
      {(primaryAction || secondaryAction) && (
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', gap: 1 }}>
          {secondaryAction && (
            <Button variant="outlined" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="contained"
              color={config.color}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              startIcon={primaryAction.loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {primaryAction.label}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ModernDialog;

/**
 * 成功ダイアログ
 */
interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const ModernSuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  onClose,
  title = '成功しました',
  message,
}) => (
  <ModernDialog
    open={open}
    onClose={onClose}
    title={title}
    variant="success"
    primaryAction={{ label: '閉じる', onClick: onClose }}
  >
    {message && (
      <Typography align="center" sx={{ py: 2 }}>
        {message}
      </Typography>
    )}
    {!message && (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CheckCircle color="success" sx={{ fontSize: 100 }} />
      </Box>
    )}
  </ModernDialog>
);

/**
 * エラーダイアログ
 */
interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  errorCode?: number;
  errorProcess?: string;
  errorMessage?: string;
}

export const ModernErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onClose,
  errorCode,
  errorProcess,
  errorMessage,
}) => (
  <ModernDialog
    open={open}
    onClose={onClose}
    title="エラーが発生しました"
    variant="error"
    primaryAction={{ label: '閉じる', onClick: onClose }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {errorProcess && (
        <Box sx={{ bgcolor: 'error.lighter', borderRadius: 1, p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            実行処理
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {errorProcess}
          </Typography>
        </Box>
      )}
      {errorCode !== undefined && (
        <Box sx={{ bgcolor: 'error.lighter', borderRadius: 1, p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            エラーコード
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {errorCode}
          </Typography>
        </Box>
      )}
      {errorMessage && (
        <Box sx={{ bgcolor: 'error.lighter', borderRadius: 1, p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            エラーメッセージ
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {errorMessage}
          </Typography>
        </Box>
      )}
    </Box>
  </ModernDialog>
);

/**
 * 確認ダイアログ
 */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: 'confirm' | 'warning' | 'error';
}

export const ModernConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  loading = false,
  variant = 'confirm',
}) => (
  <ModernDialog
    open={open}
    onClose={onClose}
    title={title}
    variant={variant}
    primaryAction={{ label: confirmLabel, onClick: onConfirm, loading }}
    secondaryAction={{ label: cancelLabel, onClick: onClose }}
  >
    <Typography align="center" sx={{ py: 2 }}>
      {message}
    </Typography>
  </ModernDialog>
);
