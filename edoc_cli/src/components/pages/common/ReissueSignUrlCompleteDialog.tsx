import { Box, Grid, TextField, Typography } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { basePageStyle } from '../../../styles/styles';
import converter from "../../../utils/converter";
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';

/**
 * 
 * 承認完了ダイアログ
 * 
 */
const ReissueSignUrlCompleteDialog = () => {
    // 社内承認中リスト画面で選択した契約書の情報を取得する
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedInfo, presentApprover, approveDate  } = location.state;

    return (
        <>
            <Box sx={{ ...basePageStyle }}>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingLeft: '10%', paddingRight: '10%' }} px={4}>
                        <Grid container spacing={3}>
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', width: '100%', marginTop: '30px' }}>
                                以下の内容で承認しました
                            </Typography>
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '30px', paddingTop: '60px', paddingBottom: '60px' }}>
                                <Grid item md={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={selectedInfo.title}
                                            label="件名"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={selectedInfo.type}
                                            label="契約種別"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={presentApprover.company_name}
                                            label="会社名"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={presentApprover.user_name}
                                            label="承認者氏名"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={presentApprover.email}
                                            label="メールアドレス"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <TextField
                                            value={converter.dateConverter_fromISO8601(approveDate.approved_time)}
                                            label="承認日時"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                </Grid>
                            </Box>
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', marginBottom: '50px', marginTop: '20px' }}>
                                <EdocButton text='閉じる' variant='contained' handleClick={() => navigate('/documentManagement/internalDocument/')} disabled={false} />
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default ReissueSignUrlCompleteDialog;