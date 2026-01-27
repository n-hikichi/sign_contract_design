/**
 * ModernHeader - MUI Default スタイルヘッダー
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AnyAction } from '@reduxjs/toolkit';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Box,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Link,
} from '@mui/material';
import {
  Description,
  ArrowDropDown,
  Person,
  Settings,
  AdminPanelSettings,
  Info,
  Logout as LogoutIcon,
  Notifications,
} from '@mui/icons-material';
import { Logout } from '../../auth/logout';
import awsconfig from '../../aws-exports';
import TextSizeSelector from '../common/TextSizeSelector';
import { APP_VERSION, SUB_VERSION_ID } from '../../config/version';

const clientId = awsconfig.Auth.aws_user_pools_web_client_id;

const ModernHeader: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [aboutDialogOpen, setAboutDialogOpen] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('');
  const [userInitial, setUserInitial] = useState<string>('');

  useEffect(() => {
    // 認証スキップモードの場合は.envのテストユーザー情報を使用
    if (process.env.REACT_APP_SKIP_AUTH === 'true') {
      const testUserName = process.env.REACT_APP_TEST_USER_NAME || '開発ユーザー';
      const testTenantId = process.env.REACT_APP_TEST_TENANT_ID || 'DEV-TENANT';
      setUserName(testUserName);
      setTenantId(testTenantId);
      setUserInitial(testUserName.charAt(0) || 'U');
      return;
    }

    let idToken: string | null = '';
    if (typeof window !== 'undefined') {
      const users = localStorage.getItem(
        `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`
      );
      idToken = localStorage.getItem(
        `CognitoIdentityServiceProvider.${clientId}.${users}.idToken`
      );
    }

    const parts = idToken?.split('.');
    if (parts?.length !== 3) {
      console.warn('IDトークンが無効な形式です');
      window.location.href = '/';
      return;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );
      const payloadBytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
      const jsonStr = new TextDecoder('utf-8').decode(payloadBytes);
      const payload = JSON.parse(jsonStr);

      const name = payload['name'] || '';
      setUserName(name);
      setTenantId(payload['custom:tenantid'] || '');
      setUserInitial(name.charAt(0) || 'U');
    } catch (error) {
      console.error('トークンのデコード中にエラーが発生しました:', error);
    }
  }, []);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(Logout() as unknown as AnyAction);
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    setAnchorEl(null);
    navigate(path);
  };

  const handleOpenAboutDialog = () => {
    setAnchorEl(null);
    setAboutDialogOpen(true);
  };

  const handleCloseAboutDialog = () => {
    setAboutDialogOpen(false);
  };

  const menuItems = [
    { icon: <AdminPanelSettings />, label: '管理者メニュー', path: '/advancedSettings/administratorSettings' },
    { icon: <Person />, label: 'ユーザー設定', path: '/advancedSettings/userSettings' },
    { icon: <Settings />, label: 'アカウント設定', path: '/advancedSettings/accountSettings' },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Toolbar sx={{ height: 72 }}>
          {/* ロゴ・タイトル */}
          <Box
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          >
            <Avatar className="gradient-card-rainbow bounce-button" sx={{ boxShadow: 2 }}>
              <Description />
            </Avatar>
            <Typography
              variant="h6"
              className="gradient-text"
              sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}
            >
              ブロックチェーン電子契約
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* 右側メニュー */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextSizeSelector />

            <IconButton color="default">
              <Notifications />
            </IconButton>

            {/* ユーザーメニュー */}
            <Box
              onClick={handleUserMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pl: 2,
                borderLeft: 1,
                borderColor: 'divider',
                cursor: 'pointer',
              }}
            >
              <Avatar className="gradient-card-pink bounce-button" sx={{ width: 40, height: 40, boxShadow: 2 }}>
                {userInitial}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {userName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ID: {tenantId}
                </Typography>
              </Box>
              <ArrowDropDown sx={{ color: 'text.secondary' }} />
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: { elevation: 3, sx: { mt: 1.5, minWidth: 240 } },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{userName}</Typography>
                <Typography variant="caption" color="text.secondary">テナントID: {tenantId}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  株式会社ミクロスソフトウエア
                </Typography>
              </Box>

              {menuItems.map((item, index) => (
                <MenuItem key={index} onClick={() => handleNavigate(item.path)} sx={{ gap: 1.5 }}>
                  {item.icon}
                  <Typography variant="body2">{item.label}</Typography>
                </MenuItem>
              ))}

              <MenuItem onClick={handleOpenAboutDialog} sx={{ gap: 1.5 }}>
                <Info />
                <Typography variant="body2">このアプリについて</Typography>
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: 'error.main' }}>
                <LogoutIcon />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>ログアウト</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* このアプリについてダイアログ */}
      <Dialog
        open={aboutDialogOpen}
        onClose={handleCloseAboutDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#0D47A1',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          このアプリについて
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              className="gradient-card-rainbow"
              sx={{ width: 64, height: 64, mx: 'auto', mb: 2, boxShadow: 3 }}
            >
              <Description sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              ブロックチェーン電子契約
            </Typography>
            <Typography variant="body2" color="text.secondary">
              バージョン {APP_VERSION}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {SUB_VERSION_ID}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ px: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>開発元:</strong> MICROS SOFTWARE, Inc.
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>お問い合わせ:</strong>
            </Typography>
            <Link
              href="https://www.micros.co.jp/cgi-bin/ssl/micros/contact/index.cgi"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ wordBreak: 'break-all' }}
            >
              https://www.micros.co.jp/cgi-bin/ssl/micros/contact/index.cgi
            </Link>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center' }}
          >
            Copyright 2025-2026, MICROS SOFTWARE, Inc. All Rights Reserved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCloseAboutDialog}
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModernHeader;
