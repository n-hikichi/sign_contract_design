import { Box, Grid, TextField, Typography } from "@mui/material";
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle, readOnlyMultiTextFieldStyle } from '../../styles/fontStyles';
import { basePageStyle } from '../../styles/styles';
import Footer from './common/Footer';
import Header from './common/Header';
import converter from "../../utils/converter";

/**
 * 
 * 差戻し要求送信完了ダイアログ
 * TODO：2024年12月社内リリース時点では未実装
 * 
 */
const RemandRequestCompleteDialog = (props: any) => {
    // // 社内承認中リスト画面で選択した契約書の情報を取得する

    const navigate = useNavigate();
    const location = useLocation();
    const { remandTime, data, internalPic } = location.state;

    // ゲスト画面をクローズする
    const closeApprovePage = async () => {
        // ログアウト処理を行う
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');

        // ログアウト画面に遷移する
        navigate('/guest/logout');
        // navigate('/develop/mailBoxGuest');
    };

    return (
        <>
            <Box sx={{ ...basePageStyle }}>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '10%', paddingRight: '10%', width: '100%' }} px={4}>
                        <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '20px', fontSize: '1.5rem', width: '100%' }}>
                            差戻し要求を受付ました
                        </Typography>
                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '5%', paddingRight: '5%', marginBottom: '20px', border: '1px solid lightgray' }}>
                            <Box>
                                <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', width: '100%', marginBottom: '20px' }}>
                                    依頼内容
                                </Typography>
                                <Box sx={{ paddingLeft: '20px', paddingRight: '20px' }}>
                                    <Box sx={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <TextField
                                            value={converter.dateConverter_fromISO8601(remandTime.remanded_time)}
                                            label='受付日時'
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <TextField
                                            value={data?.types}
                                            label='差戻し種別'
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <TextField
                                            value={data?.comment}
                                            label='差戻し理由'
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={5}
                                            sx={readOnlyMultiTextFieldStyle}
                                            InputLabelProps={{
                                                sx: { '&.Mui-disabled': { color: 'black', fontSize: '20px', } }
                                            }}
                                            disabled
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', marginBottom: '10px' }}>
                            <Button variant="contained" color="primary" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} onClick={closeApprovePage}>閉じる</Button>
                        </Box>
                    </Box>
                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default RemandRequestCompleteDialog;