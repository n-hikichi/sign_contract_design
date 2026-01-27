import { Box, Grid, TextField } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { basePageStyle } from '../../../styles/styles';
import converter from '../../../utils/converter';
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';

/**
 * 契約書の破棄完了画面のコンポーネント
 */
const DeleteCompleteDialog = () => {
    const location = useLocation();
    const { selectedInfo, deleteResponse } = location.state;

    const navigate = useNavigate();

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Box sx={{ ...basePageStyle, backgroundColor: '#ffeeee' }}>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '10%', paddingRight: '10%', width: '100%' }} px={4}>
                        <Grid container spacing={3}>
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '30px', marginBottom: '20px' }}>
                                <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em' }}>
                                    契約書を破棄しました
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, marginBottom: '40px', border: '1px solid lightgray' }}>
                                <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                        <Box sx={{ width: '100%', marginBottom: '40px' }}>
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
                                                    value={`${selectedInfo.internal_pic.company_name}　${selectedInfo.internal_pic.user_name}`}
                                                    label="自社担当者"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                <TextField
                                                    value={`${selectedInfo.customer_pic.company_name}  ${selectedInfo.customer_pic.user_name}`}
                                                    label="相手方担当者"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                                <TextField
                                                    value={converter.dateConverter_fromISO8601(deleteResponse.deleted_time)}
                                                    label="受付時刻"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', marginBottom: '20px' }}>
                                <EdocButton text='契約書登録' variant='contained' handleClick={() => navigate('/documentManagement/register')} disabled={false} />
                                <EdocButton text='終了する' variant='contained' handleClick={() => navigate('/')} disabled={false} />
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default DeleteCompleteDialog;