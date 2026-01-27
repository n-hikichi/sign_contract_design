import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import logo from './logo.png';

/**
 * ヘッダーコンポーネント
 * タイトル、ユーザー名、ログアウトボタンを表示
 * @returns 
 */
const Header: React.FC = () => {
    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ bgcolor: '#002060' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    {/* <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} /> */}
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                        ブロックチェーン電子契約
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )
};

export default Header;