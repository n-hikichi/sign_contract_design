import { Box, Grid, TextField, Typography } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { basePageStyle } from '../../../styles/styles';
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';

/**
 * 
 * ユーザー側自身のアカウント情報に関する設定が出来るページ
 * 
 */
const AccountSettings = () => {
    // 社内承認中リスト画面で選択した契約書の情報を取得する
    const location = useLocation();
    // const { agreementData } = location.state;

    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Box sx={{ ...basePageStyle }}>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '10%', paddingRight: '10%', width: '100%' }} px={4}>
                        <Grid container spacing={3}>
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '30px', marginBottom: '20px' }}>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em' }}>
                                    組織設定（テナントID：xxxxxxxxxxxxx） 株式会社ミクロスソフトウエア
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, marginBottom: '40px', border: '1px solid lightgray' }}>
                                <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px', display: 'flex', flexDirection: 'row' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="ミクロス太郎"
                                                label="ユーザー名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="組織名"
                                                label="多要素認証を要求するON/OFF"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="Authenticatorアプリ／メール認証"
                                                label="認証方式"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="パスワード変更"
                                                label="契約種別"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="ユーザー招待"
                                                label="自社担当者"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={`${agreementData.customer_pic.company_name}  ${agreementData.customer_pic.user_name}`}
                                                label="相手方担当者"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box> */}
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', marginBottom: '20px' }}>
                                <EdocButton text='続けて登録する' variant='contained' handleClick={() => navigate('/documentManagement/register')} disabled={false} />
                                <EdocButton text='終了する' variant='contained' handleClick={() => navigate('/documentManagement/registerList')} disabled={false} />
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default AccountSettings;