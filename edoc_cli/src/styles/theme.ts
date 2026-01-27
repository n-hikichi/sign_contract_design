/**
 * MUI テーマ設定
 *
 * デザイントークンを使用してMUIテーマを構成
 */
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { colors, borderRadius, shadows, zIndex } from './designTokens';

/**
 * MUI テーマオプション
 */
const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
      contrastText: colors.error.contrastText,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
      contrastText: colors.warning.contrastText,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
      contrastText: colors.info.contrastText,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
      contrastText: colors.success.contrastText,
    },
    grey: colors.grey,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    // CSS変数を使用してテキストサイズ切り替えに対応
    h1: {
      fontSize: 'var(--text-4xl)',
      fontWeight: 700,
    },
    h2: {
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
    },
    h3: {
      fontSize: 'var(--text-2xl)',
      fontWeight: 600,
    },
    h4: {
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
    },
    h5: {
      fontSize: 'var(--text-lg)',
      fontWeight: 600,
    },
    h6: {
      fontSize: 'var(--text-md)',
      fontWeight: 600,
    },
    body1: {
      fontSize: 'var(--text-md)',
    },
    body2: {
      fontSize: 'var(--text-sm)',
    },
    caption: {
      fontSize: 'var(--text-xs)',
    },
    button: {
      fontSize: 'var(--text-sm)',
    },
    overline: {
      fontSize: 'var(--text-xs)',
    },
    subtitle1: {
      fontSize: 'var(--text-md)',
    },
    subtitle2: {
      fontSize: 'var(--text-sm)',
    },
  },
  shape: {
    borderRadius: parseInt(borderRadius.sm),
  },
  spacing: 8,
  zIndex: {
    drawer: zIndex.drawer,
    modal: zIndex.modal,
    snackbar: zIndex.snackbar,
    tooltip: zIndex.tooltip,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borderRadius.sm,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          boxShadow: shadows.default,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    // テーブル関連スタイル
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          border: '1px solid',
          borderColor: colors.grey[200],
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey[50],
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.grey[600],
            borderBottom: '1px solid',
            borderColor: colors.grey[200],
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: colors.grey[50],
            },
            transition: 'background-color 0.15s ease',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          borderColor: colors.grey[100],
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: 'var(--text-sm)',
          borderBottom: 'none',
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: '1px solid',
          borderColor: colors.grey[200],
          backgroundColor: colors.grey[50],
        },
      },
    },
    // Chip スタイル（ステータスバッジ用）
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.full,
          fontWeight: 500,
          fontSize: 'var(--text-xs)',
        },
        colorSuccess: {
          backgroundColor: colors.success.light,
          color: colors.success.dark,
        },
        colorWarning: {
          backgroundColor: colors.warning.light,
          color: colors.warning.dark,
        },
        colorError: {
          backgroundColor: colors.error.light,
          color: colors.error.dark,
        },
      },
    },
  },
};

/**
 * MUI テーマ
 */
export const theme = createTheme(themeOptions);

export default theme;
