import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import logo from './logo.png';

/**
 * ヘッダーコンポーネント
 * タイトル、ユーザー名、ログアウトボタンを表示
 * @returns 
 */
const TopHeader: React.FC = () => {
    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ bgcolor: '#002060', display: 'flex', justifyContent: 'center' }}>
                <Typography
                    variant="h5"
                    noWrap
                    sx={{ textAlign: 'center' }}
                    component="div"
                    fontSize='1.5rem'
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px', marginTop: '10px' }}>
                        {/* <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} /> */}
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                            ブロックチェーン電子契約
                        </Typography>
                    </Box>
                </Typography>
            </Toolbar>
        </AppBar>
    )
};

export default TopHeader;