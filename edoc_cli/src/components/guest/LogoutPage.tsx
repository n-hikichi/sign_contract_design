import { Box, DialogTitle, Grid } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import Footer from './common/Footer';
import Header from './common/Header';

/**
 * ゲストユーザー向けのトップページ
 * 
 */
const LogoutPage = () => {

    return (
        <>
            <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                <Header />
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ width: '70%', paddingBottom: '15%', paddingTop: '15%' }}>
                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <DialogTitle className="registerTitle" bgcolor="white" sx={{ padding: '40px', fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', marginBottom: '10px' }}>
                                    ブロックチェーン電子契約から安全にログアウトしました。
                                </DialogTitle>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Footer />
        </>
    );
};

export default LogoutPage;