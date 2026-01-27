import { Box, Typography } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { basePageStyle } from '../../../styles/styles';
import converter from "../../../utils/converter";
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';

/**
 * 
 * 署名用URL発行完了画面
 * 
 */
const ReissueSignedUrlRequestComplete = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedInfo, presentApprover, issuedTime } = location.state;

    // pdf読み込み中を表すフラグ
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box sx={{ ...basePageStyle, bgcolor: '#eeffee' }}>
                    <Header />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CssBaseline />
                        <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '20%', paddingRight: '20%', width: '100%' }} px={4}>
                            <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                署名用URLを発行しました。
                            </Typography>
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '30px', marginBottom: '20px', border: '1px solid lightgray' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={presentApprover.company_name}
                                        id="title"
                                        label="会社名"
                                        variant="standard"
                                        sx={{
                                            width: '100%',
                                            '& .Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px'
                                            },
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px',
                                                paddingLeft: '20px',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={presentApprover.user_name}
                                        id="title"
                                        label="氏名"
                                        variant="standard"
                                        sx={{
                                            width: '100%',
                                            '& .Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px'
                                            },
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px',
                                                paddingLeft: '20px',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={presentApprover.position || '-----'}
                                        id="title"
                                        label="役職"
                                        variant="standard"
                                        sx={{
                                            width: '100%',
                                            '& .Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px'
                                            },
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px',
                                                paddingLeft: '20px',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={presentApprover.email}
                                        id="title"
                                        label="メールアドレス"
                                        variant="standard"
                                        sx={{
                                            width: '100%',
                                            '& .Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px'
                                            },
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px',
                                                paddingLeft: '20px',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                    <TextField
                                        value={converter.dateConverter_fromISO8601(issuedTime.issued_time)}
                                        id="issuedTime"
                                        label="発行日時"
                                        variant="standard"
                                        sx={{
                                            width: '100%',
                                            '& .Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px'
                                            },
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                color: 'black',
                                                opacity: 1,
                                                '-webkit-text-fill-color': 'black',
                                                fontSize: '20px',
                                                paddingLeft: '20px',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                        disabled={true}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', marginBottom: '40px', marginTop: '10px' }}>
                                <EdocButton text='閉じる' variant='contained' handleClick={() => navigate('/documentManagement/internalDocument')} disabled={false} />
                            </Box>
                        </Box>
                    </Box>
                </Box >
                <Footer />
            </>
        );
    };
};

export default ReissueSignedUrlRequestComplete;