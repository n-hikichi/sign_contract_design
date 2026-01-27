import { Box, Grid, TextField, Typography } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useLocation, useNavigate } from 'react-router-dom';
import converter from "../../utils/converter";
import EdocButton from "../elements/EdocButton";
import Footer from './common/Footer';
import Header from './common/Header';
import { basePageStyle } from './common/Styles';
import { signOut } from 'aws-amplify/auth';

/**
 * 
 * 承認完了画面のコンポーネント（ゲストユーザー向け）
 * 
 * agreementData: 契約書情報
 * presentApprover: 承認者情報
 * approvedTime: 承認日時
 */
const ApproveCompleteDialogForGuest = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { agreementData, presentApprover, approvedTime } = location.state;

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
            <Box sx={{ ...basePageStyle, display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
                <CssBaseline />
                <Header />
                <Box sx={{ flexGrow: 1, paddingLeft: '10%', paddingRight: '10%' }}>
                    <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', width: '100%', marginTop: '20px' }}>
                        以下の内容で承認しました
                    </Typography>
                    <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '30px', paddingTop: '40px', paddingBottom: '40px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                            <TextField
                                value={agreementData.agreement_id}
                                label="契約書ID"
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
                                value={agreementData.title}
                                label="件名"
                                variant="standard"
                                sx={{
                                    width: '100%',
                                    '& .Mui-disabled': {
                                        color: 'black',
                                        opacity: 1,
                                        '-webkit-text-fill-color': 'black',
                                        fontSize: '20px',
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
                                value={presentApprover.company_name}
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
                                label="承認者氏名"
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                            <TextField
                                value={converter.dateConverter_fromISO8601(approvedTime)}
                                label="承認日時"
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
                    <Typography sx={{ padding: '8px', borderRadius: '4px', color: 'red', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', marginTop: '20px' }}>
                        契約書は登録されている全てのユーザーの承認が完了したらダウンロード可能になります。<br />
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', marginBottom: '20px', marginTop: '20px' }}>
                        <EdocButton text='閉じる' variant='contained' handleClick={closeApprovePage} disabled={false} />
                    </Box>
                </Box>
            </Box >
            <Footer />
        </ >
    );
};

export default ApproveCompleteDialogForGuest;