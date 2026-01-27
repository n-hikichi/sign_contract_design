/**
 * ModernGuestPageLayout - MUI Default スタイルゲストページ用共通レイアウト
 */
import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import ModernHeader from './ModernHeader';
import ModernFooter from './ModernFooter';

interface ModernGuestPageLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  showSidebar?: boolean;
  sidebar?: React.ReactNode;
}

/**
 * ModernGuestPageLayout - ゲストページ用レイアウト
 */
const ModernGuestPageLayout: React.FC<ModernGuestPageLayoutProps> = ({
  children,
  loading = false,
  showSidebar = false,
  sidebar,
}) => {
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50', pt: '72px' }}>
        <ModernHeader />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={32} sx={{ color: 'white' }} />
            </Box>
            <Typography color="text.secondary">読み込み中...</Typography>
          </Paper>
        </Box>
        <ModernFooter />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50', pt: '72px' }}>
      <ModernHeader />
      <Box sx={{ flex: 1, display: 'flex' }}>
        {showSidebar && sidebar && (
          <Box sx={{ width: 288, flexShrink: 0 }}>{sidebar}</Box>
        )}
        <Box sx={{ flex: 1, p: 3 }}>{children}</Box>
      </Box>
      <ModernFooter />
    </Box>
  );
};

export default ModernGuestPageLayout;

/**
 * GuestStatusCard - ステータス表示カード
 */
interface GuestStatusCardProps {
  variant: 'info' | 'success' | 'error' | 'warning';
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const GuestStatusCard: React.FC<GuestStatusCardProps> = ({
  variant,
  title,
  description,
  children,
}) => {
  const variantStyles: Record<string, string> = {
    info: 'info.main',
    success: 'success.main',
    error: 'error.main',
    warning: 'warning.main',
  };

  return (
    <Paper
      sx={{
        bgcolor: variantStyles[variant],
        borderRadius: 3,
        p: 3,
        color: 'white',
        mb: 3,
      }}
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ opacity: 0.8 }}>{description}</Typography>
      )}
      {children}
    </Paper>
  );
};

/**
 * GuestContentCard - コンテンツカード
 */
interface GuestContentCardProps {
  title?: string;
  children: React.ReactNode;
}

export const GuestContentCard: React.FC<GuestContentCardProps> = ({
  title,
  children,
}) => (
  <Paper>
    {title && (
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
      </Box>
    )}
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

/**
 * GuestInfoField - 情報フィールド
 */
interface GuestInfoFieldProps {
  label: string;
  value?: string;
}

export const GuestInfoField: React.FC<GuestInfoFieldProps> = ({
  label,
  value,
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {value || '-----'}
    </Typography>
  </Box>
);
