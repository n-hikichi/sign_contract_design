/**
 * ModernFooter - MUI Default スタイルゲスト用フッター
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Security } from '@mui/icons-material';

const ModernFooter: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 1.5,
        bgcolor: 'grey.800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'grey.400' }}>
        <Security fontSize="small" />
        <Typography variant="caption" sx={{ letterSpacing: '0.05em' }}>
          Secured by Blockchain Technology
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: 'grey.500', letterSpacing: '0.02em' }}
      >
        Copyright © 2025 MICROS SOFTWARE, Inc. All Rights Reserved.
      </Typography>
    </Box>
  );
};

export default ModernFooter;
