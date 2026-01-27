import { Box, Button, DialogTitle, Typography } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAccessUserCredencial } from './auth/GuestLogin';
import Footer from './common/Footer';
import Header from './common/Header';
import NowLoading from "./common/NowLoading";
import api from '../../utils/apiAccessor';
import apiExecutor from '../../utils/apiExecutor';
import { useParams } from 'react-router-dom';

interface AgreementData {
    agreement_id: string,
    title: string,
    own_company: {
        company_id: string,
        company_name: string,
        postal_code: string,
        state: string,
        city: string,
        address_line: string,
        building: string,
    },
    customer_company: {
        company_id: string,
        company_name: string,
        postal_code: string,
        state: string,
        city: string,
        address_line: string,
        building: string,
    },
    type: string,
    deal_amount: number,
    conclusion_date: string,
    expiration_date: string,
    internal_pic: {
        approver_id: string,
        user_name: string,
        company_name: string,
        position: string,
        email: string,
    },
    customer_pic: {
        approver_id: string,
        user_name: string,
        company_name: string,
        position: string,
        email: string,
    },
    status: string
}

interface TermsOfUseForGuestProps {
    uuid: string; // 渡される値の型を定義
}

/**
 * 
 * 利用規約表示画面
 * 
 * 相手方ユーザーに対して、利用規約の同意を求める画面を表示する。
 * 
 */
const TermsOfUseForGuest = () => {
    // const TermsOfUseForGuest: React.FC<TermsOfUseForGuestProps> = ({ uuid }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const agreementId = location.state?.documentId;
    // const agreementId = uuid;

    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);

    const [agreementData, setAgreementData] = useState<AgreementData>();

    // 検証結果を保持
    const [isInValidLogin, setIsInValidLogin] = useState(false);

    // 初回レンダー時の処理
    useEffect(() => {
        // 非同期処理を開始する前にローディング状態をtrueに設定
        setIsLoading(true);

        // ログインユーザー情報をチェックする
        async function fetchAgreementData() {
            checkAccessUserCredencial();
            try {
                const agreementData = await apiExecutor.fetchGetAgreementForGuest(agreementId);
                if (agreementData.status !== api.HTTP_OK) {
                    console.log("fetchAgreementData(): API response failed. HTTP Status: " + agreementData.status);
                    setIsInValidLogin(true);
                    return;
                }

                const agreementDataJson = await agreementData.json();
                setAgreementData(agreementDataJson);
            } catch (error) {
                console.log("fetchAgreementData(): An unexpected error has occurred.");
                console.log(error);
                setIsInValidLogin(true);
                return;
            }
        };

        // 非同期処理を並列に実行する
        Promise.all([fetchAgreementData()]).finally(() => {
            setIsLoading(false);
        });
    }, []);

    // 承認フロー開始要求
    const openApproveDocument = () => {
        navigate('/guest/agreement/approvePage', { state: { agreementId, agreementData } });
        // navigate('/develop/approveDocument', { state: { agreementId, agreementData } });
    };

    // 締結済みドキュメント取得要求
    const openConcludeDocument = () => {
        navigate('/guest/agreement/concludePage', { state: { agreementId, agreementData } });
        // navigate('/develop/concludeDocument', { state: { agreementId, agreementData } });
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        if (!isInValidLogin) {
            return (
                <>
                    {(agreementData?.status === 'IN_CUSTOMER_FLOW' || agreementData?.status === 'CUSTOMER_APPROVING' || agreementData?.status === 'CUSTOMER_REMANDING') && (
                        <Box bgcolor='grey.200' sx={{ display: 'flex', flexDirection: 'column', paddingTop: '13%', width: '100%', minHeight: '100vh' }}>
                            <CssBaseline />
                            <Header />
                            <Box sx={{ flexGrow: 1, paddingLeft: '20%', paddingRight: '20%' }}>
                                <Box bgcolor="white" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px', paddingTop: '80px', marginBottom: '20px', border: '5px solid #002060' }}>
                                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.5em', paddingBottom: '20px' }}>
                                        {agreementData?.own_company.company_name}様から承認依頼が届きました。
                                    </Typography>
                                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '30px', color: '#0D47A1' }}>
                                        {agreementData?.title}
                                    </Typography>
                                    <DialogTitle className="registerTitle" sx={{ paddingLeft: 0, fontWeight: 'bold', fontSize: '1.5em', borderTop: '3px solid lightgrey' }}>
                                        書類の詳細は「利用規約に同意して書類を開く」から確認してください。
                                    </DialogTitle>
                                </Box>
                                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%' }}>
                                    <Button variant='contained' size='large' color="error" onClick={openApproveDocument} style={{ margin: '10px', width: '300px', height: '60px' }} sx={{ '&:hover': { backgroundColor: 'darkred' } }}>利用規約に同意して書類を開く</Button>
                                    <Button variant='contained' size='large' onClick={() => { window.open('https://www.micros.co.jp/privacy.html', '_blank') }} style={{ margin: '10px', width: '300px', height: '60px' }} sx={{ '&:hover': { backgroundColor: 'darkblue' } }}>個人情報の取り扱いについて</Button>
                                    <Button variant='contained' size='large' onClick={() => { window.open('https://www.micros.co.jp/service.html', '_blank') }} style={{ margin: '10px', width: '300px', height: '60px' }} sx={{ '&:hover': { backgroundColor: 'darkblue' } }}>サービス利用規約について</Button>
                                </Box>
                            </Box>
                            <Footer />
                        </Box>
                    )}
                    {agreementData?.status === 'CONCLUDED' && (
                        <Box bgcolor='grey.200' sx={{ display: 'flex', flexDirection: 'column', paddingTop: '13%', width: '100%', minHeight: '100vh' }}>
                            <CssBaseline />
                            <Header />
                            <Box sx={{ flexGrow: 1, paddingLeft: '20%', paddingRight: '20%' }}>
                                <Box bgcolor="white" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '40px', paddingTop: '80px', marginBottom: '20px', border: '5px solid #002060' }}>
                                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.5em', paddingBottom: '20px' }}>
                                        以下の契約書が合意締結されました。
                                    </Typography>
                                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '50px', color: '#0D47A1' }}>
                                        {agreementData?.title}
                                    </Typography>
                                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.5em', paddingBottom: '20px' }}>
                                        書類の詳細は「利用規約に同意して書類を開く」から確認してください。
                                    </Typography>
                                    <Typography className="registerTitle" sx={{ paddingLeft: 0, fontWeight: 'bold', fontSize: '1.5em', borderTop: '3px solid lightgrey', paddingTop: '20px' }}>
                                        利用規約に同意の上、本システムをご利用ください。
                                    </Typography>
                                </Box>
                                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%' }}>
                                    <Button variant='contained' size='large' color="error" onClick={openConcludeDocument} style={{ margin: '10px', width: '300px', height: '60px' }} sx={{ '&:hover': { backgroundColor: 'darkred' } }}>利用規約に同意して書類を開く</Button>
                                    <Button variant='contained' size='large' onClick={() => { window.open('https://www.micros.co.jp/privacy.html', '_blank') }} style={{ margin: '10px', width: '300px', height: '60px' }} sx={{ '&:hover': { backgroundColor: 'darkblue' } }}>個人情報の取り扱いについて</Button>
                                    <Button variant='contained' size='large' onClick={() => { window.open('https://www.micros.co.jp/service.html', '_blank') }} style={{ margin: '10px', width: '300px', height: '60px' }} sx={{ '&:hover': { backgroundColor: 'darkblue' } }}>サービス利用規約について</Button>
                                </Box>
                            </Box>
                            <Footer />
                        </Box>
                    )}
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
                                            契約書取得処理中にエラーが発生しました。<br /><br />
                                            契約書へのアクセス権限を確認してから再度アクセスしてください。
                                        </DialogTitle>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Footer />
                </>
            );
        };
    };
};

export default TermsOfUseForGuest;