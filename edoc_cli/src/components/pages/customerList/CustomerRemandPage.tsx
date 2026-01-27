import { Box, Button, Grid, Modal, Stack, Tooltip, Typography } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { deleteModalStyle, modifyapproveFlowDialogStyle, resendSighUrlDialogStyle, baseContentsStyle, pdfPreviewDialogStyle } from '../../../styles/styles';
import api from "../../../utils/apiAccessor";
import apiDataType from "../../../utils/apiDataType";
import apiExecutor from "../../../utils/apiExecutor";
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import CustomChip from '../common/CustomChip';
import ErrorDialog from '../common/ErrorDialog';
import PreviewDocument from '../common/PreviewDocument';
import SignatureApproveList from "../common/SignatureApproveList";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getUserData, getUserDataForDebug } from '../../../auth/login';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import WarningIcon from '@mui/icons-material/Warning';
import ApiProcessingDialog from "../common/ApiProcessingDialog";
import { useParams } from 'react-router-dom';
// status：CUSTOMER_REMANDING
const status_label = '相手方差戻し中';

/**
 * 
 * 自社ユーザー向け差戻し画面（相手方ユーザー差戻し）
 * 
 */
const CustomerRemandPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const selectedInfo = location.state?.record;
    let selectedInfo: any;
    const { agreementId } = useParams();

    if (agreementId) {
        selectedInfo = location.state?.agreementInfo;
    } else {
        selectedInfo = location.state?.record;
    };


    // data url形式のbase64にエンコードされたpdfファイル
    const [pdf_base64, setPdf_base64] = useState('');
    // pdf読み込み中を表すフラグ
    const [isLoading, setIsLoading] = useState(false);

    // 契約書情報
    const [agreementData, setAgreementData] = useState<apiDataType.AgreementData>(apiDataType.createInitialAgreementData());
    // 承認フロー
    const [approveFlowData, setApproveFlowData] = useState<apiDataType.AgreementFlow>(apiDataType.createInitialAgreementFlow());
    // 現在の承認者情報
    const [presentApprover, setPresentApprover] = useState<apiDataType.Approver>(apiDataType.createInitialApprover());
    // 差戻し要求内容
    const [remandInfo, setRemandInfo] = useState<apiDataType.RemandInfo>(apiDataType.createInitialRemandRequest());
    // ユーザー権限（自社担当者）
    const [isInternalPicUser, setIsInternalPicUser] = useState(false);
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
     * 実行失敗ダイアログ（画面遷移）
     * 
     */
    const [loadingPageFailedDialog, setLoadingPageFailedDialogOpen] = useState(false);
    const handleLoadingPageFailedDialogClose = () => {
        setLoadingPageFailedDialogOpen(false);
        // 画面遷移時にエラーが発生した場合は一覧画面に戻る
        navigate('/documentManagement/customerDocument');
        return;
    };

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    useEffect(() => {
        setIsLoading(true);

        const fetchData = async () => {
            try {

                if (!selectedInfo) {
                    setErrorCode(api.HTTP_NOT_FOUND);
                    setErrorProcess('締結済み契約書　取得処理');
                    setLoadingPageFailedDialogOpen(true);
                    return;
                };

                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetAgreement(selectedInfo.agreement_id),
                    apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id),
                    apiExecutor.fetchGetAgreementFile(selectedInfo.agreement_id),
                    apiExecutor.fetchGetRemandRequest(selectedInfo.agreement_id)
                ];

                // APIを並列実行
                const responses = await Promise.all(requests);

                // ステータスコードが200以外の場合の処理
                const errorResponse = responses.find((res: Response) => res.status !== 200);
                if (errorResponse) {
                    setErrorCode(errorResponse.status);
                    setErrorProcess('相手方承認フロー　契約書取得処理');
                    setLoadingPageFailedDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const [agreement, approvals, file, remandResponse] = await Promise.all(responses.map((res: Response) => res.json()));

                // 契約書情報設定
                setAgreementData(agreement);

                // 承認フロー設定
                setApproveFlowData(approvals);

                // 現在の承認者を設定
                const presentApproverId = approvals.present_approver;
                const presentApproverInfo = Object.values(approvals).flat().find((approver: any) => approver.approver_id === presentApproverId) as apiDataType.Approver;
                setPresentApprover(presentApproverInfo);

                // 契約書（PDF）設定
                setPdf_base64("data:application/pdf;base64," + file.file);

                // 差戻し情報を設定
                setRemandInfo(remandResponse[0]);

                // ログインユーザーの情報を取得する
                const loginUser = getUserData();
                // const loginUser = getUserDataForDebug(selectedInfo.agreement_id);

                // ログインユーザーが「担当者」かチェックする
                if (approvals.internal_pic.email === loginUser) {
                    setIsInternalPicUser(true);
                }

            } catch (error) {
                console.error('Error fetching data:', error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('相手方承認フロー　契約書取得処理');
                setLoadingPageFailedDialogOpen(true);
            } finally {
                setIsLoading(false);
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

    /***
     * 
     * 契約書破棄要求
     * 
     */
    // 破棄確認ダイアログの開閉状態
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const handleDeleteDialogClose = () => setDeleteDialogOpen(false);

    // ダイアログを開く関数
    const openDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    // 契約書の削除要求
    const onDelete = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const res = await api.deleteAgreement(selectedInfo.agreement_id);
            if (res.status !== api.HTTP_OK) {   
                setErrorCode(res.status);
                setErrorProcess('契約書破棄処理');
                setExecuteFailedApiDialogOpen(true);
            };

            // 取得したPDFファイルを画面に設定する
            const deleteResponse = await res.json();
            navigate('/documentManagement/customerDocument/deleteComplete', { state: { deleteResponse, selectedInfo, approveFlowData } });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('契約書破棄処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    // PDFファイルプレビュー
    // プレビューダイアログの開閉状態
    const handlePdfPreviewDialogOpen = () => setPdfPreviewDialogOpen(true);
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);

    // ダイアログを開く関数
    const openPdfPreviewDialog = () => {
        setPdfPreviewDialogOpen(true);
    };

    /***
     * 
     * 相手方承認状況表示画面
     * 
     */
    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box sx={{ bgcolor: isInternalPicUser ? '#ffeeee' : 'grey.200', height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px' }}>
                    <Header />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <CssBaseline />
                        <SignatureApproveList approveHistory={approveFlowData} flowStatus={selectedInfo?.status} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '5%', paddingRight: '5%', width: '100%' }} px={4}>
                            {isInternalPicUser && (
                                <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                    差戻し依頼が届いています。依頼者からのメッセージを確認して対応してください。
                                </Typography>
                            )}
                            {!isInternalPicUser && (
                                <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                    差戻し依頼が発行されました。現在自社担当者による対応が行われています。
                                </Typography>
                            )}
                            <Button variant="contained" color="primary" sx={{ width: '10em', marginBottom: '5px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(() => navigate('/documentManagement/customerDocument'))}>一覧へ戻る</Button>
                            <Box sx={{ marginBottom: '40px', width: '100%' }}>
                                <Box sx={{ width: '100%', display: 'flex', border: '1px solid lightgray', alignItems: 'center', backgroundColor: 'white', padding: '10px' }}>
                                    <Stack direction="row" spacing={1} sx={{ flexGrow: 0, justifyContent: 'start', marginRight: '30px' }}>
                                        <CustomChip value={selectedInfo?.status} label={status_label} />
                                    </Stack>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', marginRight: '30px' }}>{selectedInfo?.title}</Typography>
                                    <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={openPdfPreviewDialog} >契約書を閲覧する</Button>
                                </Box>
                            </Box>
                            {/* 自社担当者に対して表示する */}
                            {isInternalPicUser && (
                                <>
                                    <Box sx={{ width: '30%', display: 'flex', marginBottom: '5px' }}>
                                        <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={openDeleteDialog} >破棄する</Button>
                                    </Box>
                                </>
                            )}
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                                <Box sx={{ marginTop: '20px', display: 'flex', minHeight: '20px', flexDirection: 'column', justifyContent: 'space-between', direction: 'ltr', width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                    <Typography sx={{ backgroundColor: '#cc0000', color: 'white', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem' }}>
                                        依頼内容
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={presentApprover.company_name}
                                            label="会社名"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={`${presentApprover.user_name}（${presentApprover.email}）`}
                                            label="依頼者情報"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={remandInfo.types}
                                            label="差戻し区分"
                                            variant="standard"
                                            InputLabelProps={{ shrink: true }}
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' } }}>
                                        <TextField
                                            value={remandInfo.comment}
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={5}
                                            sx={{
                                                marginBottom: '16px',
                                                '& .MuiInputBase-input.Mui-disabled': {
                                                    color: 'black',
                                                    opacity: 1,
                                                    fontWeight: 'bold',
                                                    fontSize: '20px',
                                                    '-webkit-text-fill-color': 'black',
                                                },
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    '&.Mui-disabled': {
                                                        color: 'black',
                                                    },
                                                },
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
                {/* ファイルプレビューダイアログ */}
                <div>
                    <Modal
                        open={pdfPreviewDialogOpen}
                        onClose={handlePdfPreviewDialogClose}
                    >
                        <Box sx={pdfPreviewDialogStyle} >
                            <Box
                                sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                                onClick={() => window.open(pdf_base64, '_blank')}
                            >
                                <embed type='application/pdf' src={pdf_base64 + "#zoom=100"} height='100%' width='100%' />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                                <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={(handlePdfPreviewDialogClose)}>プレビュー終了</Button>
                            </Box>
                        </Box>
                    </Modal>
                </div>
                {/* 破棄確認ダイアログ */}
                <div>
                    <Modal
                        open={deleteDialogOpen}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={{ ...deleteModalStyle, backgroundColor: '#ffeeee' }} >
                            <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                契約書破棄の確認
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px' }}>
                                <WarningIcon sx={{ color: 'darkorange', fontSize: '4em', textAlign: 'center' }} />
                                <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                    契約書を破棄すると再登録が必要になります。実行してよろしいですか？
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color="error" sx={{ '&:hover': { backgroundColor: 'darkred' }, width: '10em', height: '40px', marginRight: '5px' }} onClick={(onDelete)}>実行する</Button>
                                <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' }, width: '10em', height: '40px' }} onClick={(handleDeleteDialogClose)}>キャンセル</Button>
                                {/* <EdocButton text='実行する' variant='contained' color='error' type='submit' disabled={false} handleClick={onDelete} /> */}
                                {/* <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleDeleteDialogClose} /> */}
                            </Box>
                        </Box>
                    </Modal>
                </div >
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
                <ErrorDialog open={loadingPageFailedDialog} handleClose={handleLoadingPageFailedDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
};

export default CustomerRemandPage;