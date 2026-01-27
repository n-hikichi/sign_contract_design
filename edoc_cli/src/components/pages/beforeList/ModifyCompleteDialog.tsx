import { Box, Grid, TextField } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { basePageStyle } from '../../../styles/styles';
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';

/**
 * 削除した書類の復元画面のコンポーネントこちらの内容で登録しました
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const ModifyCompleteDialog = () => {
    // 社内承認中リスト画面で選択した契約書の情報を取得する
    const location = useLocation();
    const { agreementData } = location.state;

    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);
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
                                    契約書を更新しました
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, marginBottom: '20px', border: '1px solid lightgray' }}>
                                <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '50px' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                        <Box sx={{ width: '100%', marginBottom: '20px' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                <TextField
                                                    value={agreementData.title}
                                                    label="件名"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                <TextField
                                                    value={agreementData.type}
                                                    label="契約種別"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                <TextField
                                                    value={`${agreementData.approval_flow.internal_pic.company_name}  ${agreementData.approval_flow.internal_pic.user_name}`}
                                                    label="自社担当者"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                <TextField
                                                    value={`${agreementData.approval_flow.customer_pic.company_name}  ${agreementData.approval_flow.customer_pic.user_name}`}
                                                    label="相手方担当者"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', marginBottom: '10px', marginTop: '10px' }}>
                                <EdocButton text='一覧画面に戻る' variant='contained' handleClick={() => navigate('/documentManagement/registerList')} />
                            </Box>
                        </Grid>
                    </Box>

                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default ModifyCompleteDialog;