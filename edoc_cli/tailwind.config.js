/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  important: '#root',
  theme: {
    extend: {
      colors: {
        // MUIのデフォルトカラーと統一
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
        },
        secondary: {
          main: '#9c27b0',
          light: '#ba68c8',
          dark: '#7b1fa2',
        },
        error: {
          main: '#d32f2f',
          light: '#ef5350',
          dark: '#c62828',
        },
        warning: {
          main: '#ed6c02',
          light: '#ff9800',
          dark: '#e65100',
        },
        info: {
          main: '#0288d1',
          light: '#03a9f4',
          dark: '#01579b',
        },
        success: {
          main: '#2e7d32',
          light: '#4caf50',
          dark: '#1b5e20',
        },
        // プロジェクト固有の色
        brand: {
          navy: '#002060',
        },
        // カラフル3Dデザイン用グラデーションカラー
        gradient: {
          blue: {
            from: '#3b82f6',
            to: '#1d4ed8',
          },
          purple: {
            from: '#8b5cf6',
            to: '#7c3aed',
          },
          pink: {
            from: '#ec4899',
            to: '#db2777',
          },
          orange: {
            from: '#f97316',
            to: '#ea580c',
          },
          green: {
            from: '#22c55e',
            to: '#16a34a',
          },
          rainbow: {
            from: '#667eea',
            via: '#764ba2',
            to: '#f093fb',
          },
        },
      },
      spacing: {
        // MUIのspacingと統一 (1 = 8px)
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
      },
      // カラフル3Dデザイン用アニメーション
      animation: {
        'float-3d': 'float-3d 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'badge-pulse': 'badge-pulse 2s ease-in-out infinite',
        'gradient-rotate': 'gradient-rotate 4s linear infinite',
      },
      keyframes: {
        'float-3d': {
          '0%, 100%': {
            transform: 'translateY(0) rotateX(0deg) rotateY(0deg)',
          },
          '25%': {
            transform: 'translateY(-5px) rotateX(2deg) rotateY(2deg)',
          },
          '50%': {
            transform: 'translateY(-10px) rotateX(0deg) rotateY(0deg)',
          },
          '75%': {
            transform: 'translateY(-5px) rotateX(-2deg) rotateY(-2deg)',
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'badge-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'gradient-rotate': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '300% 50%' },
        },
      },
      // カラフル3Dデザイン用ボーダー半径
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      // カラフル3Dデザイン用シャドウ
      boxShadow: {
        'card-3d': `
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 10px 15px -3px rgba(0, 0, 0, 0.08),
          0 20px 25px -5px rgba(0, 0, 0, 0.05)
        `,
        'card-3d-hover': `
          0 10px 20px -5px rgba(0, 0, 0, 0.1),
          0 25px 35px -10px rgba(0, 0, 0, 0.12),
          0 40px 50px -15px rgba(0, 0, 0, 0.08)
        `,
        'size-selector': '0 2px 8px rgba(139, 92, 246, 0.4)',
      },
      // トランジション
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  corePlugins: {
    // MUIのスタイルとの競合を避けるため、プリフライトを無効化
    preflight: false,
  },
  plugins: [],
}


