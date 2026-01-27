/**
 * ModernFooter - MUI Default スタイルフッター
 */
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const ModernFooter: React.FC = () => {
  const handleManualClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open('/documentManagement/howToPage', '_blank', 'noopener');
  };

  const links = [
    { label: '利用マニュアル', onClick: handleManualClick, href: '#' },
    { label: '個人情報の取り扱い', href: 'https://www.micros.co.jp/privacy.html', external: true },
    { label: 'サービス利用規約', href: 'https://www.micros.co.jp/service.html', external: true },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 2,
        px: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        position: 'fixed',
        bottom: 0,
        left: '64px',
        right: 0,
        zIndex: 1100,
        overflow: 'visible',
      }}
    >
      {/* Copyright - 幅が足りない場合は省略可能 */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          flexShrink: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        Copyright © 2025, MICROS SOFTWARE, Inc. All Rights Reserved.
      </Typography>

      {/* リンク - 絶対に切れないようにする */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            onClick={link.onClick}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            variant="body2"
            color="text.secondary"
            underline="hover"
            sx={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {link.label}
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default ModernFooter;
