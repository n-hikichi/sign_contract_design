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
 * ブロックチェーン電子契約の管理者がアクセスできるページ
 * ユーザーアカウント等の管理が出来る
 * 
 * 設定可能なユーザー権限
 * ・管理者権限　：ユーザーの新規追加・削除等ができる
 * ・ユーザー権限：ブロックチェーン電子契約の基本的な操作が行える
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
                                    ブロックチェーン電子契約運用監視者アプリ
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, marginBottom: '40px', border: '1px solid lightgray' }}>
                                <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px', display: 'flex', flexDirection: 'row' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="アカウント発行"
                                                label="契約書ID"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="アカウント発行"
                                                label="件名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="アカウント発行"
                                                label="契約種別"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value="アカウント発行"
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