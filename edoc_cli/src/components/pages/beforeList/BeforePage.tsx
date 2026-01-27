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
import BeforeDocView from './BeforeDocView';
import ErrorDialog from '../common/ErrorDialog';

/**
 * 
 * 承認フロー開始前文書一覧画面
 * 
 */
const BeforePage: React.FC = () => {
    // ローディング状態を管理
    const [loading, setLoading] = useState(true);

    // 契約書リストを管理
    const [documentList, setDocumentList] = useState(true);

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    // 初回レンダー時にドキュメントリストを取得
    useEffect(() => {
        // 契約書を取得する
        async function fetchGetAgreementList() {
            try {
                const res = await apiExecutor.fetchGetAgreementList(apiStatus.agreementStatus.BEFORE_FLOW.toString())
                if (res.status !== api.HTTP_OK) {
                    console.log("API(fetchGetAgreementList()) response failed. HTTP Status: " + res.status);

                    setErrorCode(res.status);
                    setErrorProcess('承認フロー開始前文書取得処理');
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
                setErrorProcess('承認フロー開始前文書取得処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            } finally {
                setLoading(false);
            }
        };

        fetchGetAgreementList();
    }, []);

    if (loading) {
        return <NowLoading/>;
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
                                <CommonStepper activeStep={1} />
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', fontSize: '1.5em' }}>
                                    承認フローを開始する書類を選択してください
                                </Typography>
                                <Box sx={{ minWidth: '800px', marginRight: '5px', marginBottom: '30px' }}>
                                    <BeforeDocView documentList={documentList} />
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

export default BeforePage;