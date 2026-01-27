import { AppBar, Box, Button, Link, Toolbar, Typography, Menu, MenuItem } from '@mui/material';
import { AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Logout } from "../../auth/logout";
import awsconfig from '../../aws-exports';
import React, { useEffect, useState } from 'react';
import logo from './logo.png';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ModernHeader from './ModernHeader';

// CognitoのクライアントID
const clientId = awsconfig.Auth.aws_user_pools_web_client_id;

/**
 * 
 * ヘッダーコンポーネント
 * ログイン中のヘッダーとして表示する
 *  
 */
const Header: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // メニュー制御用state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    let idToken: string | null = '';
    if (typeof window !== "undefined") {
        const users = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);
        idToken = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${users}.idToken`);
    };

    const parts = idToken?.split(".");

    useEffect(() => {
        if (parts?.length !== 3) {
            console.warn("IDトークンが無効な形式です");
            window.location.href = "/";
        };
    }, [parts]);

    if (parts?.length !== 3) {
        return null;
    }

    // const parts = idToken?.split(".");
    // if (parts?.length !== 3) {
    //     console.warn("IDトークンが無効な形式です");
    //     return null;
    // }

    let userName: string = '';
    let tenantId: string = '';
    try {

        // JWT payload (Base64URL) → Base64 正規化
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

        // Base64 → バイト配列
        const payloadBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));

        // UTF-8デコード
        const jsonStr = new TextDecoder("utf-8").decode(payloadBytes);
        const payload = JSON.parse(jsonStr);

        userName = payload['name'] || '';
        tenantId = payload['custom:tenantid'] || '';

    } catch (error) {
        // ToDo：トークンの取得エラーが発生した場合、認証情報の不正として
        //       ダイアログ表示 → ログアウト処理を行う
        console.error("トークンのデコード中にエラーが発生しました:");
    };

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        console.log("handleUserMenuOpen");
    };

    const handleUserMenuClose = () => {
        console.log("handleUserSetting");
        setAnchorEl(null);
    };

    const handleUserSetting = () => {
        console.log("handleUserSetting");
        setAnchorEl(null);
        // navigate('/user/settings');
    };

    const handleLogout = () => {
        dispatch(Logout() as unknown as AnyAction);
        navigate('/login');
    };

    const handleClick = () => {
        navigate('/');
    };

    const handleOpenAccountSettings = () => {
        setAnchorEl(null);
        navigate('/advancedSettings/userSettings');
    };

    const handleOpenAdministratorSettings = () => {
        setAnchorEl(null);
        navigate('/advancedSettings/accountSettings');
    };

    const handleOpenApplicationSettings = () => {
        setAnchorEl(null);
        navigate('/advancedSettings/administratorSettings');
    };

    const handleOpenLisenceAndCopyright = () => {
        setAnchorEl(null);
        navigate('/advancedSettings/lisenceAndCopyright');
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ bgcolor: '#002060' }}>
                <Box sx={{ position: 'absolute', right: 0, left: 0, height: '100%' }}>
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{ flexGrow: 1 }}
                        component="div"
                        align='center'
                        // paddingLeft='40px'
                        fontSize='1.5rem'
                    >
                        <Link
                            component="button"
                            variant="h5"
                            onClick={handleClick}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                                {/* <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} /> */}
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', marginTop: '5px' }}>
                                    ブロックチェーン電子契約
                                </Typography>
                            </Box>
                        </Link>
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    position: 'absolute',
                    right: 0,
                    width: '20%',
                    height: '100%',
                    paddingRight: '20px',
                    zIndex: 1
                }}>
                    <Typography
                        variant='h6'
                        component="div"
                        align='center'
                        paddingRight={'20px'}
                        sx={{ cursor: 'pointer', userSelect: 'none', alignItems: 'center', display: 'flex', }}
                        onClick={handleUserMenuOpen}
                    >
                        {userName}
                        <ArrowDropDownIcon />
                    </Typography>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        slotProps={{
                            paper: {
                                sx: {
                                    marginTop: '17px',
                                    width: 500,
                                    backgroundColor: '#002060',
                                    color: 'white',
                                },
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', padding: '10px', borderBottom: '1px solid white' }}>
                            <Typography sx={{ fontsize: '1em', color: 'white', fontWeight: 'bold', marginTop: '5px' }}>
                                テナントID：{tenantId}
                            </Typography>
                            <Typography sx={{ fontsize: '1em', color: 'white', fontWeight: 'bold', marginTop: '5px' }}>
                                株式会社ミクロスソフトウエア
                            </Typography>
                        </Box>
                        <MenuItem
                            onClick={handleOpenApplicationSettings}
                            sx={{
                                my: 1,
                                '&:hover': {
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                },
                            }}>
                            管理者メニュー
                        </MenuItem>
                        <MenuItem
                            onClick={handleOpenAccountSettings}
                            sx={{
                                my: 1,
                                '&:hover': {
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                },
                            }}>
                            ユーザー設定
                        </MenuItem>
                        <MenuItem
                            onClick={handleOpenAdministratorSettings}
                            sx={{
                                my: 1,
                                '&:hover': {
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                },
                            }}>
                            アカウント設定
                        </MenuItem>
                        <MenuItem
                            onClick={handleOpenLisenceAndCopyright}
                            sx={{
                                my: 1,
                                '&:hover': {
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                },
                            }}>
                            このアプリについて
                        </MenuItem>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px', paddingBottom: '5px', borderTop: '1px solid white' }}>
                            <Button
                                variant='contained'
                                color='inherit'
                                onClick={handleLogout}
                                sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '1rem' }}
                            >
                                ログアウト
                            </Button>
                        </Box>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    )
};

// モダナイズ版ヘッダーを使用
// 旧版に戻す場合は下記を `export default Header;` に変更
export default ModernHeader;
// export default Header;