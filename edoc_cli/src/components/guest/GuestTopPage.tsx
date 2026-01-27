import { Box, Button, DialogTitle, Grid } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../../utils/apiAccessor";
import apiExecutor from '../../utils/apiExecutor';
import Footer from './common/Footer';
import Header from './common/Header';

/**
 * ゲストユーザー向けのトップページ
 * 
 */
const GuestTopPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(false);

    // 契約書リストを管理
    const [agreementData, setAgreementData] = useState();

    // 検証結果を保持
    const [isInValidLogin, setIsInValidLogin] = useState(false);

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    useEffect(() => {
        // URLのクエリパラメータを取得
        const queryParams = new URLSearchParams(location.search);

        // 認証情報を取得
        const authInfo = queryParams.get('documentId');

        const documentId = queryParams.get('documentId');
        const token = queryParams.get('token');
        const userId = queryParams.get('user_id');

        if (!authInfo) {
            console.error('Auth Info is missing');
            setErrorCode(api.HTTP_BAD_REQUEST);
            setErrorProcess('認証情報の取得');
            setExecuteFailedApiDialogOpen(true);
            setIsInValidLogin(true);
            return;
        }

        // 契約書を取得する
        async function fetchGetAgreement() {
            try {
                if (!authInfo) {
                    return;
                }

                const res = await apiExecutor.fetchGetAgreementForGuest(authInfo)
                if (res.status !== api.HTTP_OK) {
                    console.log("API(fetchGetAgreementList()) response failed. HTTP Status: " + res.status);

                    setErrorCode(res.status);
                    setErrorProcess('承認フロー開始前文書取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    setIsLoading(true);
                    setIsInValidLogin(true);
                    return;
                }

                // 取得した契約書情報を設定する
                const json = await res.json();
                setAgreementData(json);

            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('承認フロー開始前文書取得処理');
                setExecuteFailedApiDialogOpen(true);
                setIsInValidLogin(true);
                return;
            } finally {
                setIsLoading(true);
            }
        };

        fetchGetAgreement();
    }, [location.search]);

    const onSubmit = async () => {
        navigate('/guest/termsofuse', { state: { agreementData } });
    };

    if (!isLoading) {
        return (
            <>
                <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                    <Header />
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx={{ width: '70%', paddingBottom: '15%', paddingTop: '15%' }}>
                                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <DialogTitle className="registerTitle" bgcolor="white" sx={{ padding: '40px', fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', marginBottom: '10px' }}>
                                        資格情報を確認しています。<br />
                                        確認が終了するまで、今しばらくお待ちください。
                                    </DialogTitle>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
            </>
        );
    } else {
        if (!isInValidLogin) {
            return (
                <>
                    <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                        <Header />
                        <Box sx={{ display: 'flex' }}>
                            <CssBaseline />
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box sx={{ width: '70%', paddingBottom: '15%', paddingTop: '15%' }}>
                                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <DialogTitle className="registerTitle" bgcolor="white" sx={{ padding: '40px', fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', marginBottom: '10px' }}>
                                            資格情報の確認が完了しました。
                                        </DialogTitle>
                                        <Button variant='contained' size='large' onClick={() => onSubmit()} sx={{ margin: '10px', '&:hover': { backgroundColor: 'darkblue' } }}>契約書情報へアクセスする</Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Footer />
                </>
            );
        } else {
            return (
                <>
                    <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                        <Header />
                        <Box sx={{ display: 'flex' }}>
                            <CssBaseline />
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box sx={{ width: '70%', paddingBottom: '15%', paddingTop: '15%' }}>
                                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <DialogTitle className="registerTitle" bgcolor="white" sx={{ padding: '40px', fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', marginBottom: '10px' }}>
                                            認証処理中に予期せぬエラーが発生しました。<br />
                                            エラーコード: {errorCode}<br />
                                            処理: {errorProcess}
                                        </DialogTitle>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Footer />
                </>
            );
        }
    };
};

export default GuestTopPage;