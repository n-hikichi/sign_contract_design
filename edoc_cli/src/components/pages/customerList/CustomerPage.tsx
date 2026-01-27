import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from "react";
import api from "../../../utils/apiAccessor";
import { apiExecutor } from '../../../utils/apiExecutor';
import apiStatus from "../../../utils/apiStatus";
import CommonStepper from '../../../utils/customStepper';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import SideMenu from '../../templates/SideMenu';
import CustomerDocView from './CustomerDocView';
import ErrorDialog from '../common/ErrorDialog';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

/**
 * 
 * 顧客承認フロー文書一覧画面
 * 
 */
const CustomerPage: React.FC = () => {
    // ローディング状態を管理
    const [loading, setLoading] = useState(true);

    // 契約書リストを管理
    const [documentList, setDocumentList] = useState(true);

    const { agreementId } = useParams();

    const navigate = useNavigate();

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    /***
     * 
     * API実行失敗ダイアログ（契約書ID指定）
     * 
     */
    const [errorCode_, setErrorCode_] = useState(0);
    const [errorProcess_, setErrorProcess_] = useState('');
    const [executeFailedApiDialog_, setExecuteFailedApiDialogOpen_] = useState(false);
    const handleExecuteFailedApiDialogClose_ = () => {
        setExecuteFailedApiDialogOpen_(false);
        navigate('/documentManagement/customerDocument'); // ダイアログを閉じた後に自社一覧画面へ遷移
    };

    // 自社承認フローのステータス
    const validStatuses = [
        apiStatus.agreementStatus.CUSTOMER_APPROVING,
        apiStatus.agreementStatus.CUSTOMER_REMANDING,
    ];

    // 初回レンダー時にドキュメントリストを取得
    useEffect(() => {
        // 契約書を取得する
        async function fetchGetAgreementList() {
            try {
                const res = await apiExecutor.fetchGetAgreementList(apiStatus.agreementStatus.IN_CUSTOMER_FLOW.toString())
                if (res.status !== api.HTTP_OK) {
                    console.log("API(fetchGetAgreementList()) response failed. HTTP Status: " + res.status);

                    setErrorCode(res.status);
                    setErrorProcess('締結済み文書取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // 取得した契約書情報を設定する
                const json = await res.json();
                setDocumentList(json);
            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('締結済み文書取得処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            } finally {
                setLoading(false);
            }
        };

        async function fetchGetAgreement(agreementId: string) {
            try {
                const res = await apiExecutor.fetchGetAgreement(agreementId)
                if (res.status !== api.HTTP_OK) {
                    setErrorCode_(res.status);
                    setErrorProcess_('契約書ファイル取得処理');
                    setExecuteFailedApiDialogOpen_(true);
                    setLoading(false);
                    return;
                };

                // 取得した契約書情報を設定する
                const agreementInfo = await res.json();

                // 契約書情報が取得できていない場合はエラーとする
                if (agreementInfo.length === 0) {
                    setErrorCode_(api.HTTP_NOT_FOUND);
                    setErrorProcess_('契約書ファイル取得処理');
                    setExecuteFailedApiDialogOpen_(true);
                    setLoading(false);
                    return;
                };

                // 自社承認フローではない場合はエラーとする
                if (!validStatuses.includes(agreementInfo.status)) {
                    setErrorCode_(api.HTTP_NOT_FOUND);
                    setErrorProcess_('契約書ファイル取得処理');
                    setExecuteFailedApiDialogOpen_(true);
                    setLoading(false);
                    return;
                };

                // ステータスに応じて遷移先を変更する
                if (agreementInfo.status === 'CUSTOMER_APPROVING') {
                    navigate(`/documentManagement/customerDocument/checkFileDetails/${agreementId}`, { state: { agreementInfo } });
                } else if (agreementInfo.status === 'CUSTOMER_REMANDING') {
                    navigate(`/documentManagement/customerDocument/remandDetails/${agreementId}`, { state: { agreementInfo } });
                };

            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);

                setErrorCode_(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess_('自社承認フロー文書取得処理');
                setExecuteFailedApiDialogOpen_(true);
                setLoading(false);
                return;
            } finally {
                console.log("An unexpected error has occurred.");
            }
        };

        // 契約書IDが指定されているかどうかで処理を分岐する
        if (agreementId !== undefined) {
            fetchGetAgreement(agreementId); // メールからの遷移の場合
        } else {
            fetchGetAgreementList();// 画面UIから遷移の場合
        }

        fetchGetAgreementList();
    }, []);

    if (loading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                    <Header />
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <SideMenu />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ marginLeft: '5%', marginRight: '5%' }} px={4}>
                                <CommonStepper activeStep={3} />
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', fontSize: '1.5em' }}>
                                    承認状況を確認したい書類を選択してください
                                </Typography>
                                <Box sx={{ minWidth: '800px', marginRight: '5px', marginBottom: '30px' }}>
                                    <CustomerDocView documentList={documentList} />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}

export default CustomerPage;