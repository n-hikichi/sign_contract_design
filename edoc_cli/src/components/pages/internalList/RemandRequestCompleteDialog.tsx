import { Box, TextField, Typography } from "@mui/material";
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyMultiTextFieldStyle, readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import converter from "../../../utils/converter";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';

/**
 * 
 * 差戻し要求送信完了画面
 * 
 */
const RemandRequestCompleteDialog = (props: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { remandTime, data, internalPic } = location.state;

    return (
        <>
            <Box sx={{ backgroundColor: '#ffeeee', height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px' }}>
                <Header />
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '10%', paddingRight: '10%', width: '100%' }} px={4}>
                        <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                            差戻し要求を受付ました
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'start', alignContent: 'end', width: '100%', marginBottom: '5px' }}>
                            <Button variant="contained" color="primary" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} onClick={() => navigate('/documentManagement/internalDocument')}>一覧に戻る</Button>
                        </Box>
                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '5%', paddingRight: '5%', marginBottom: '20px', border: '1px solid lightgray' }}>
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
                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default RemandRequestCompleteDialog;