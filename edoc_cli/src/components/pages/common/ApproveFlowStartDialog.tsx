import { Box, Grid, TextField } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { basePageStyle } from '../../../styles/styles';
import EdocButton from "../../elements/EdocButton";
import converter from '../../../utils/converter';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';

/**
 * 
 * 承認フロー開始画面
 * 
 */
const ApproveFlowStartDialog = () => {
    const navigate = useNavigate();

    // 承認フローを開始した契約書の情報を取得する
    const location = useLocation();
    const { selectedInfo, approvalRequestAddress, started_time } = location.state;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <>
            <Box sx={{ ...basePageStyle, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CssBaseline />
                <Header />
                <Box sx={{ paddingLeft: '10%', paddingRight: '10%', paddingBottom: '20px' }} px={4}>
                    <Grid container spacing={3}>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '30px' }}>
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5em' }}>
                                承認フローを開始しました
                            </Typography>
                        </Box>
                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '30px', paddingTop: '60px', paddingBottom: '60px', marginBottom: '20px' }}>
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
                                        value={approvalRequestAddress.company_name}
                                        label="会社名"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={approvalRequestAddress.user_name}
                                        label="承認依頼先"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={approvalRequestAddress.email}
                                        label="メールアドレス"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={converter.dateConverter_fromISO8601(started_time)}
                                        label="依頼日時"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                            </Grid>
                        </Box>
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%' }}>
                            <EdocButton text='閉じる' variant='contained' handleClick={() => navigate('/documentManagement/internalDocument')} />
                        </Box>
                    </Grid>
                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default ApproveFlowStartDialog;