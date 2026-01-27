/**
 * ModernPageLayout - MUI Default スタイルページレイアウト
 */
import React from 'react';
import {
  Box,
  CssBaseline,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SideMenu from './SideMenu';
import NowLoading from './NowLoading';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface ModernPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  stepper?: React.ReactNode;
  fullWidth?: boolean;
}

const ModernPageLayout: React.FC<ModernPageLayoutProps> = ({
  children,
  title,
  subtitle,
  loading = false,
  breadcrumbs,
  actions,
  stepper,
  fullWidth = false,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <NowLoading />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header />
      <Box sx={{ display: 'flex', flex: 1, pt: '72px' }}>
        <SideMenu />
        <Box
          component="main"
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)' }}
        >
          <Box sx={{ flex: 1, p: fullWidth ? 2 : 3, pb: fullWidth ? 8 : 9 }}>
            {/* パンくずリスト */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/')}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  underline="hover"
                >
                  <Home fontSize="small" />
                  ホーム
                </Link>
                {breadcrumbs.map((item, index) =>
                  item.path ? (
                    <Link
                      key={index}
                      component="button"
                      variant="body2"
                      onClick={() => navigate(item.path!)}
                      underline="hover"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Typography key={index} variant="body2" color="text.primary">
                      {item.label}
                    </Typography>
                  )
                )}
              </Breadcrumbs>
            )}

            {/* ステッパー */}
            {stepper && <Box sx={{ mb: 3 }}>{stepper}</Box>}

            {/* ページヘッダー */}
            {(title || actions) && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 4,
                }}
              >
                <Box>
                  {title && (
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                {actions && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {actions}
                  </Box>
                )}
              </Box>
            )}

            {children}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default ModernPageLayout;

/**
 * ContentCard - ページ内のセクションをラップ
 */
interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  title,
  subtitle,
  actions,
  noPadding = false,
}) => (
  <Paper className="card-3d" elevation={0}>
    {(title || actions) && (
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          {title && <Typography variant="h6">{title}</Typography>}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
    )}
    <Box sx={{ p: noPadding ? 0 : 3 }}>{children}</Box>
  </Paper>
);

/**
 * PageTitleBanner
 */
interface PageTitleBannerProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

export const PageTitleBanner: React.FC<PageTitleBannerProps> = ({
  children,
  variant = 'primary',
}) => {
  const colorMap = {
    primary: 'primary.main',
    success: 'success.main',
    warning: 'warning.main',
    error: 'error.main',
  };

  return (
    <Paper
      sx={{
        bgcolor: colorMap[variant],
        color: 'white',
        px: 3,
        py: 2,
        mb: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {children}
      </Typography>
    </Paper>
  );
};

/**
 * StatusBadge
 */
interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  // カスタムスタイル定義（視認性向上）
  const styleMap: Record<string, { useCustom: boolean; color?: 'default' | 'primary' | 'warning'; sx?: object }> = {
    pending: { useCustom: false, color: 'default' },
    approved: {
      useCustom: true,
      sx: { bgcolor: '#dcfce7', color: '#166534', borderColor: '#22c55e', fontWeight: 600 },
    },
    rejected: {
      useCustom: true,
      sx: { bgcolor: '#fee2e2', color: '#991b1b', borderColor: '#ef4444', fontWeight: 600 },
    },
    in_progress: {
      useCustom: true,
      sx: { bgcolor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b', fontWeight: 600 },
    },
    completed: { useCustom: false, color: 'primary' },
  };

  const style = styleMap[status];
  if (style.useCustom) {
    return <Chip label={label} size="small" variant="outlined" sx={style.sx} />;
  }
  return <Chip label={label} color={style.color} size="small" />;
};
