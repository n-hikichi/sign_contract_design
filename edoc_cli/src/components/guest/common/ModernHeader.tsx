/**
 * ModernHeader - MUI Default スタイルゲスト用ヘッダー
 */
import React from 'react';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { Description } from '@mui/icons-material';
import TextSizeSelector from '../../common/TextSizeSelector';

const ModernHeader: React.FC = () => {
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main',
        height: '72px',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, height: '100%' }}>
        {/* ロゴ */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Description sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: 'white', fontWeight: 'bold', letterSpacing: '0.05em' }}
            >
              Blockchain e-Contract
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
            >
              Secure Digital Agreement Platform
            </Typography>
          </Box>
        </Box>

        {/* テキストサイズ選択 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextSizeSelector compact />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ModernHeader;
