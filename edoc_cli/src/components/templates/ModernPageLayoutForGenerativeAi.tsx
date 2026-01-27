/**
 * ModernPageLayoutForGenerativeAi - 生成AI機能用モダンページレイアウト
 */
import React from 'react';
import { Box } from '@mui/material';
import ModernHeader from './ModernHeader';
import ModernFooter from './ModernFooter';
import ModernSideMenuForGenerativeAi from './ModernSideMenuForGenerativeAi';

interface ModernPageLayoutForGenerativeAiProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
}

const ModernPageLayoutForGenerativeAi: React.FC<ModernPageLayoutForGenerativeAiProps> = ({
  children,
  breadcrumbs,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* メッシュ背景 */}
      <div className="mesh-bg" />

      {/* ヘッダー */}
      <ModernHeader />

      {/* メインコンテンツエリア */}
      <Box sx={{ display: 'flex', flex: 1, mt: '64px' }}>
        {/* サイドメニュー */}
        <ModernSideMenuForGenerativeAi />

        {/* コンテンツ */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            minHeight: 'calc(100vh - 64px - 60px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* フッター */}
      <ModernFooter />
    </Box>
  );
};

export default ModernPageLayoutForGenerativeAi;
