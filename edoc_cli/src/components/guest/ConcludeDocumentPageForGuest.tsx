import { Box, Button, CircularProgress, DialogTitle, Grid, Modal, Tooltip, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/apiAccessor';
import apiExecutor from "../../utils/apiExecutor";
import EdocButton from '../elements/EdocButton';
import ErrorDialog from "./common/ErrorDialog";
import NowLoading from '../templates/NowLoading';
import Footer from './common/Footer';
import Header from './common/Header';
import { Font, PDFDownloadLink } from '@react-pdf/renderer';
import converter from "../../utils/converter";
import SignatureHistory from './SignatureHistoryForGuest';
import { baseContentsStyle, basePageStyle, deleteModalStyle, pdfPreviewDialogStyle } from './common/Styles';
import SignatureHistoryPdfForGuest from './SignatureHistoryPdfForGuest';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type Approver = {
    user_name: string;
    company_name: string;
    email: string;
    approved: boolean;
    approved_time: string;
};

const approver = {
    user_name: "",
    company_name: "",
    email: "",
    approved: false,
    approved_time: "",
};

type AgreementData = {
    agreement_id: string,
    title: string,
    company_name: string,
    deal_amount: number,
    conclusion_date: string,
    expiration_date: string,
    internal_pic: {
        user_name: string,
        company_name: string,
        email: string
    },
    customer_pic: {
        user_name: string,
        company_name: string,
        email: string
    },
    status: string
};

const initialAgreementData: AgreementData = {
    agreement_id: "",
    title: "",
    company_name: "",
    deal_amount: 0,
    conclusion_date: "",
    expiration_date: "",
    internal_pic: {
        user_name: "",
        company_name: "",
        email: ""
    },
    customer_pic: {
        user_name: "",
        company_name: "",
        email: ""
    },
    status: ""
};

type AgreementFlow = {
    internal_pic: Approver;
    internal_approver: Approver;
    internal_authorizer: Approver;
    customer_pic: Approver;
    customer_approver: Approver;
    customer_authorizer: Approver;
    present_approver: string;
};

const initialAgreementFlow: AgreementFlow = {
    internal_pic: { ...approver },
    internal_approver: { ...approver },
    internal_authorizer: { ...approver },
    customer_pic: { ...approver },
    customer_approver: { ...approver },
    customer_authorizer: { ...approver },
    present_approver: "",
};

type ApproveResult = {
    user_name: string;
    company_name: string;
    email: string;
    signed_time: string;
    valid: boolean;
};

const initialApproveResult: ApproveResult = {
    user_name: "",
    company_name: "",
    email: "",
    signed_time: "",
    valid: false,
};

interface Signatures {
    user_name: string;
    company_name: string;
    position: string;
    email: string;
    role: string;
    signed_time: string;
    valid: boolean;
};

const ConcludeDocumentPageForGuest: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    let agreementId = 'acde070d-8c4c-4f0d-9d8a-162843c10333';
    if (location.state) {
        agreementId = location.state.agreementId;
    }

    // 契約書idに対する契約書情報
    const [agreementData, setAgreementData] = useState<AgreementData>(initialAgreementData);
    // 契約書idに対する承認フロー
    const [approveFlowData, setApproveFlowData] = useState<AgreementFlow>(initialAgreementFlow);
    // 署名結果を取得する
    const [approveResult, setApproveResult] = useState<ApproveResult>(initialApproveResult);
    // data url形式のbase64にエンコードされたpdfファイル
    const [pdf_base64, setPdf_base64] = useState('');
    // 署名検証結果を表示するメッセージ
    const [valiateMessage, setValiateMessage] = useState('');
    // 署名検証結果の背景色
    const [backgroundColor, setBackgroundColor] = useState('#0D47A1');
    // pdf読み込み中を表すフラグ
    const [pdfIsLoading, setPdfIsLoading] = useState(true);
    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);
    // 検証結果を保持
    const [isInValidLogin, setIsInValidLogin] = useState(false);
    // 署名履歴の署名者リスト
    const [approveUserList, setApproveUserList] = useState<Signatures[]>([]);
    // PDFファイルプレビュー
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);

    /***
     * 
     * API処理中ダイアログ
     * 
     */
    // エラーダイアログの開閉状態
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteApiDialogDialog = () => {
        setExecuteApiDialogOpen(true);
    };

    /***
     * 
     * 実行失敗ダイアログ（エラーコード、処理名）
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteApiErrorDialogDialog = () => {
        setExecuteFailedApiDialogOpen(true);
    };

    /***
     * 
     * 実行失敗ダイアログ（画面遷移）
     * 
     */
    const [loadingPageFailedDialog, setLoadingPageFailedDialogOpen] = useState(false);
    const handleLoadingPageFailedDialogClose = () => {
        setLoadingPageFailedDialogOpen(false);
        // 画面遷移時にエラーが発生した場合は認証情報を破棄する
        closeApprovePage();
        return;
    };

    // ダウンロードリンクを作成
    const downloadPdf = () => {
        const link = document.createElement('a');
        link.href = pdf_base64;
        link.download = agreementData.title + '.pdf';
        link.click();
    };

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        setIsLoading(true);

        const fetchData = async () => {
            try {
                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetAgreementForGuest(agreementId),
                    apiExecutor.fetchGetAgreementApprovalsForGuest(agreementId),
                    apiExecutor.fetchGetAgreementSignaturesForGuest(agreementId),
                    apiExecutor.fetchGetAgreementFileForGuest(agreementId)
                ];

                // APIを並列実行
                const responses = await Promise.all(requests);

                // ステータスコードが200以外の場合の処理
                const errorResponse = responses.find((res: Response) => res.status !== 200);
                if (errorResponse) {
                    setIsInValidLogin(true);
                    setErrorCode(errorResponse.status);
                    setErrorProcess('契約書情報取得処理');
                    setLoadingPageFailedDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const [agreement, approvals, signature, file] = await Promise.all(responses.map((res: Response) => res.json()));

                // 取得した契約書情報を登録する
                setAgreementData(agreement);

                // 取得した承認フローを登録する
                setApproveFlowData(approvals);

                // 取得した署名情報を登録する
                setApproveResult(signature);
                setApproveUserList(signature.signatures.slice(1));

                // 検証結果をチェックする
                if (signature.agreement_valid) {
                    setValiateMessage('全ての署名が有効です');
                    setBackgroundColor('#0D47A1');
                } else {
                    setValiateMessage('全ての署名が有効ではありません');
                    setBackgroundColor('darkred');
                }

                // 取得したファイルを登録する
                setPdf_base64("data:application/pdf;base64," + file.file);
                setPdfIsLoading(false);

            } catch (error) {
                console.error('Error fetching data:', error);
                setIsInValidLogin(true);
                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('契約書情報取得処理');
                setPdfIsLoading(false);
            } finally {
                setIsLoading(false);
                setPdfIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // どちらかのプレビューダイアログが開いているときのみ
        if (!pdfPreviewDialogOpen) return;

        // 履歴を追加
        window.history.pushState(null, '', window.location.href);

        const handlePopState = (e: PopStateEvent) => {
            if (pdfPreviewDialogOpen) handlePdfPreviewDialogClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [pdfPreviewDialogOpen]);

    // PDFファイルプレビューダイアログの開閉状態
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);

    // ダイアログを開く関数
    const openPdfPreviewDialog = () => {
        setPdfPreviewDialogOpen(true);
    };

    /***
     * 
     * 契約書破棄要求
     * 
     */
    // 破棄確認ダイアログの開閉状態
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const handleDeleteDialogClose = () => setDeleteDialogOpen(false);

    // ゲスト画面をクローズする
    const closeConcludePage = () => {
        // ログアウト処理を行う
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');

        // ログアウト画面に遷移する
        navigate('/guest/logout');
    };

    // ゲスト画面をクローズする
    const closeApprovePage = async () => {
        // ログアウト処理を行う
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');

        // ログアウト画面に遷移する
        navigate('/guest/logout');
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        if (!isInValidLogin) {
            return (
                <>
                    <Box sx={{ ...basePageStyle }}>
                        <Header />
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CssBaseline />
                            <SignatureHistory approveFlow_Data={approveFlowData} approveResult={approveResult} agreement_id={agreementId} title={agreementData.title} own_company={approveFlowData.internal_pic.company_name} customer_company={approveFlowData.customer_pic.company_name} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', paddingBottom: '20px', paddingTop: '20px', width: '100%', marginLeft: '5%', marginRight: '5%' }} px={4}>
                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginBottom: '40px', width: '100%' }}>
                                    <Typography sx={{ backgroundColor: backgroundColor, padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '100%', margin: 'auto', fontSize: '1.5em' }}>
                                        {valiateMessage}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'start', width: '100%', marginBottom: '5px' }}>
                                    <Button variant="contained" color="primary" onClick={closeConcludePage} sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>閲覧終了</Button>
                                </Box>
                                <Box sx={{ marginBottom: '40px', width: '100%' }}>
                                    <Box sx={{ width: '100%', display: 'flex', border: '1px solid lightgray', alignItems: 'center', backgroundColor: 'white', padding: '10px' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', marginLeft: '30px', marginRight: '30px' }}>{agreementData.title}</Typography>
                                        {/* <Tooltip title="契約書を閲覧する">
                                            <Button
                                                sx={{ color: 'black', backgroundColor: '#eeeeff', '&:hover': { color: 'white', backgroundColor: 'darkblue' }, border: '1px solid lightgray' }}
                                                onClick={(openPdfPreviewDialog)}
                                            >
                                                <OpenInNewIcon />
                                            </Button>
                                        </Tooltip> */}
                                        <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={openPdfPreviewDialog} >契約書を閲覧する</Button>
                                    </Box>
                                </Box>
                                {/* <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', direction: 'ltr', paddingTop: '40px', paddingLeft: '25px' }}>
                                    <Grid container spacing={3}>
                                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                                            <Grid item md={12}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
                                                    <Box display="flex" justifyContent="flex-end" sx={{ width: '100%' }}>
                                                        <Button variant="contained" color="primary" onClick={() => setPdfPreviewDialogOpen(true)} sx={{ marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} disabled={false}>全画面で表示する</Button>
                                                        {!pdfIsLoading && (
                                                            <>
                                                                <Button variant="contained" color="primary" onClick={downloadPdf} sx={{ marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} >契約書ダウンロード</Button>
                                                                <PDFDownloadLink document={<SignatureHistoryPdfForGuest approveFlow_Data={approveFlowData} approveResult={approveUserList} agreement_id={agreementData.agreement_id} title={agreementData.title} />} fileName={`signature_report_${agreementData.title}_${converter.getCurrentDate()}`}>
                                                                    <Button variant='contained' size='large' onClick={() => handlePdfPreviewDialogClose()} sx={{ '&:hover': { backgroundColor: 'darkblue' } }}>署名履歴ダウンロード</Button>
                                                                </PDFDownloadLink>
                                                            </>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ ...baseContentsStyle, width: '100%', height: '1200px', border: 'solid 2px black' }}>
                                                    {pdfIsLoading ? <CircularProgress sx={{ width: '40px', height: '40px' }} /> :
                                                        <embed type='application/pdf' src={pdf_base64 + "#zoom=100"} height='100%' width='100%' />
                                                    }
                                                </Box>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                </Box> */}
                            </Box>
                        </Box>
                    </Box>
                    <Footer />
                    {/* ファイルプレビューダイアログ */}
                    <div>
                        <Modal open={pdfPreviewDialogOpen}>
                            <Box sx={pdfPreviewDialogStyle}>
                                <Box
                                    sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                                    onClick={() => window.open(pdf_base64, '_blank')}
                                >
                                    {pdfIsLoading ? <CircularProgress sx={{ width: '40px', height: '40px' }} /> :
                                        <embed type='application/pdf' src={pdf_base64 + "#zoom=100&toolbar=0"} height='100%' width='100%' />
                                    }
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button variant="contained" color="primary" onClick={() => downloadPdf()} disabled={false} sx={{ marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' }, height:'35px', marginTop: '5px' }}>契約書ダウンロード</Button>
                                        <PDFDownloadLink document={<SignatureHistoryPdfForGuest approveFlow_Data={approveFlowData} approveResult={approveUserList} agreement_id={agreementData.agreement_id} title={agreementData.title} />} fileName={`signature_report_${agreementData.title}_${converter.getCurrentDate()}`}>
                                            <Button variant='contained' size='large' sx={{ marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' }, height:'35px', marginTop: '5px' }}>署名履歴ダウンロード</Button>
                                        </PDFDownloadLink>
                                        <EdocButton text='プレビュー終了' variant='contained' color='primary' disabled={false} handleClick={handlePdfPreviewDialogClose} />
                                    </Box>
                                </Box>
                            </Box>
                        </Modal>
                    </div>
                    {/* 閲覧終了確認ダイアログ */}
                    <div>
                        <Modal
                            open={deleteDialogOpen}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={deleteModalStyle} >
                                <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1em' }}>
                                    契約書の閲覧を終了します。よろしいですか？
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button variant="contained" color='error' onClick={() => navigate('/guest/top')} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkred' } }}>終了する</Button>
                                    <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleDeleteDialogClose} />
                                </Box>
                            </Box>
                        </Modal>
                    </div>
                    <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
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
        }
    };
}

export default ConcludeDocumentPageForGuest;