import { Box, Button } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { basePageStyle } from '../../../styles/styles';
import api from "../../../utils/apiAccessor";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import PreviewBasicInfo from '../common/PreviewBasicInfo';

/**
 * 登録した契約書の承認フローを開始する画面
 */
const MicBoxPage = () => {
    const navigate = useNavigate();

    // 一覧画面で選択した契約書の情報を取得する
    const location = useLocation();
    const selectedInfo = location.state;

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        // 契約書の承認フローを取得する
        async function fetchGetAgreementApprovals() {
            try {
                const res = await api.getAgreementApprovals(selectedInfo.agreement_id);
                if (res.status !== api.HTTP_OK) {
                    console.log("API response failed. HTTP Status: " + res.status);
                }
                
            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);
            }
        };
        // 非同期処理を並列に実行する
        Promise.all([fetchGetAgreementApprovals()]);
    }, [selectedInfo, location]);

    return (
        <>
            <Box sx={{ ...basePageStyle, display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
                <CssBaseline />
                <Header />
                <Box sx={{ flexGrow: 1, paddingLeft: '5%', paddingRight: '5%', paddingBottom: '20px' }}>
                    <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '20px', fontSize: '1.5em' }}>
                        電子帳簿保存アプリとの連携データです（MIC BOXとの連携はT.B.D）
                    </Typography>
                    <Box>
                        <PreviewBasicInfo />
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginRight: '5px', marginLeft: '5px', marginTop: '5px', alignItems: 'center' }}>
                            <Button variant="contained" onClick={() => navigate(-1)} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>戻る</Button>
                        </Box>
                    </Box>
                </Box>
                <Footer />
            </Box>
        </>
    );

};

export default MicBoxPage;