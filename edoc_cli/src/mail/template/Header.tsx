import { AppBar, Box, Button, Link, Toolbar, Typography } from '@mui/material';
import { AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Logout } from "../../auth/logout";
// import awsconfig from '../../aws-exports';

// CognitoのクライアントID
// const clientId = awsconfig.Auth.aws_user_pools_web_client_id;

/**
 * ヘッダーコンポーネント
 * タイトル、ユーザー名、ログアウトボタンを表示
 * @returns 
 */
const Header: React.FC = () => {

    const navigate = useNavigate();

    // const users = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);

    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(Logout() as unknown as AnyAction);
        navigate('/login/authentication');
    };

    const handleClick = () => {
        navigate('/');
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ bgcolor: '#002060' }}>
                <Box sx={{ position: 'absolute', right: 0, left: 0 }}>
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{ flexGrow: 1 }}
                        component="div"
                        align='left'
                        paddingLeft='40px'
                        fontSize='1.5rem'
                    >
                        <Link
                            component="button"
                            variant="h5"
                            onClick={handleClick}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                        </Link>
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )
};

export default Header;