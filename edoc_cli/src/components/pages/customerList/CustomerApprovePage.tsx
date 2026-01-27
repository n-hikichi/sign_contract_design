import AppBar from '@mui/material/AppBar';
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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { NotificationInfo, PresentApproverInfo } from '../common/ApproverInfo';
import CustomChip from '../common/CustomChip';
import ErrorDialog from '../common/ErrorDialog';
import PreviewDocument from '../common/PreviewDocument';
import SignatureApproveList from "../common/SignatureApproveList";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getUserData, getUserDataForDebug } from '../../../auth/login';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';
import ApproverInfo from '../common/ApproverInfo';
import PreviewApproveFlow, { ApproveFlowNotifier } from '../common/PreviewApproveFlow';
import apiStatus from "../../../utils/apiStatus";
import WarningIcon from '@mui/icons-material/Warning';
import ApiProcessingDialog from "../common/ApiProcessingDialog";
import { useParams } from 'react-router-dom';

// 共通スタイルの定義
const disabledTextFieldStyle = {
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
        fontWeight: 'bold',
    },
};

// 書類情報一覧の表の列名を示すインタフェース
interface NotifierListColumns {
    // 会社名
    company_name: string,
    // ユーザー名
    user_name: string,
    // メールアドレス
    email: string,
    // 役職
    position: string,
};

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
};

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ width: '100%' }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

// status：CUSTOMER_APPROVING
const status_label = '相手方承認中';

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const CustomerApprovePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    // ユーザー権限
    const [userAuthority, setUserAuthority] = useState(false);
    // ユーザー権限（ログインユーザー）
    const [isLoginUser, setIsLoginUser] = useState(false);
    // ユーザー権限（自社担当者）
    const [isInternalPicUser, setIsInternalPicUser] = useState(false);
    // 社内関係者
    const [internalNotifier, setInternalNotifier] = useState<NotifierListColumns[]>([]);
    // 相手方関係者フロー
    const [customerNotifier, setCustomerNotifier] = useState<NotifierListColumns[]>([]);
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
                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetAgreement(selectedInfo.agreement_id),
                    apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id),
                    apiExecutor.fetchGetAgreementFile(selectedInfo.agreement_id)
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
                const [agreement, approvals, file] = await Promise.all(responses.map((res: Response) => res.json()));

                // 契約書情報設定
                setAgreementData(agreement);

                // 承認フロー設定
                setApproveFlowData(approvals);

                // 現在の承認者を設定
                const presentApproverId = approvals.present_approver;
                const presentApproverInfo = Object.values(approvals).flat().find((approver: any) => approver.approver_id === presentApproverId) as apiDataType.Approver;
                setPresentApprover(presentApproverInfo);

                // 関係者情報を整理する
                let internalNotifierTmp: NotifierListColumns[] = [];
                let customerNotifierTmp: NotifierListColumns[] = [];

                for (let flowData in approvals) {
                    if (!apiStatus.userRole.hasOwnProperty(flowData)) {
                        continue; // 条件を満たさない場合はスキップ
                    };

                    if (!(flowData === 'internal_notifier' || flowData === 'customer_notifier') || !Array.isArray(approvals[flowData])) {
                        continue; // 条件を満たさない場合はスキップ
                    }

                    const approvers = approvals[flowData] as Array<any>;
                    if (approvers.length === 0) {
                        // 配列が空の場合は処理をスキップ
                        continue;
                    }

                    // 配列内の各要素に対して処理を行う
                    approvers.forEach(approver => {
                        let item: NotifierListColumns = {
                            company_name: approver.company_name,
                            user_name: approver.user_name,
                            email: approver.email,
                            position: approver.position,
                        };

                        if (flowData.startsWith('internal')) {
                            internalNotifierTmp.push(item);
                        } else {
                            customerNotifierTmp.push(item);
                        }
                    });
                };

                // 関係者を設定
                setInternalNotifier(internalNotifierTmp);
                setCustomerNotifier(customerNotifierTmp);

                // 契約書（PDF）設定
                setPdf_base64("data:application/pdf;base64," + file.file);

                // ログインユーザーの情報を取得する
                const loginUser = getUserData();
                // const loginUser = getUserDataForDebug(selectedInfo.agreement_id);

                // ログインユーザーが「担当者」かチェックする
                if (approvals.internal_pic.email === loginUser) {
                    setIsLoginUser(true);
                    setIsInternalPicUser(true);
                }
            } catch (error) {
                console.error('Error fetching data:', error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('相手方承認フロー　契約書取得処理');
                setLoadingPageFailedDialogOpen(true);
                // setExecuteFailedApiDialogOpen(true);
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
     * 承認フロー修正要求
     * TODO：2024年12月社内リリース時点では未実装
     * 
     */
    // const [approveFlowModifyDialogOpen, setApproveFlowModifyDialogOpen] = useState(false);
    // const handleApproveFlowModifyDialogOpen = () => setApproveFlowModifyDialogOpen(false);

    // // ダイアログを開く関数
    // const openApproveFlowModifyDialogOpen = () => {
    //     setApproveFlowModifyDialogOpen(true)
    // };

    // // 契約書の削除要求
    // const startApproveFlow = async () => {
    //     // ToDo：必要な情報を渡す事
    //     navigate('/documentManagement/customerDocument/modifyApproveFlow');
    // }

    /***
     * 
     * 署名用URL再発行要求
     * 
     */
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const handleRestoreDialogOpen = () => setRestoreDialogOpen(true);
    const handleRestoreDialogClose = () => setRestoreDialogOpen(false);

    const sendRestoreRequest = async () => {

        setExecuteApiDialogOpen(true);
        try {
            const body = {
                recipient_id: presentApprover?.approver_id, // 必要なrecipient_idを設定
            };

            const res = await api.postApprovalUrl(selectedInfo.agreement_id, body);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('署名用URL再発行処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            }
            const issuedTime = await res.json();

            navigate('/documentManagement/customerDocument/reissueSignedUrlRequestComplete', { state: { selectedInfo, presentApprover, issuedTime } });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('署名用URL再発行処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }

        setRestoreDialogOpen(false);
    };

    // ダイアログを開く関数
    const openRestoreDialog = () => {
        setRestoreDialogOpen(true)
    };

    const closeRestoreDialog = () => {
        setRestoreDialogOpen(false);
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
     * 契約書破棄要求
     * ※「自社担当者」権限を持つ人だけ操作出来る
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

    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newTabValue: number) => {
        setTabValue(newTabValue);
    };

    // 登録情報修正要求
    const restoreDocument = async () => {
        navigate('/documentManagement/internalDocument/modifyDocument', { state: { selectedInfo, internalNotifier, customerNotifier } });
    };

    // ダイアログの開閉状態
    const [remandDialogOpen, setRemandDialogOpen] = useState(false);
    const handleRemandDialogOpen = () => setRemandDialogOpen(true);
    const handleRemandDialogClose = () => setRemandDialogOpen(false);

    const closeRemandDialog = () => {
        setRemandDialogOpen(false);
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
                <Box sx={{ bgcolor: isInternalPicUser ? '#eeeeff' : 'grey.200', height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px' }}>
                    <Header />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <CssBaseline />
                        <SignatureApproveList approveHistory={approveFlowData} flowStatus={selectedInfo.status} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '5%', paddingRight: '5%', width: '100%' }} px={4}>
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                相手方企業が承認中です
                            </Typography>
                            <Button variant="contained" color="primary" sx={{ width: '10em', marginBottom: '5px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(() => navigate('/documentManagement/customerDocument'))}>一覧へ戻る</Button>
                            <Box sx={{ marginBottom: '20px', width: '100%' }}>
                                <Box sx={{ width: '100%', display: 'flex', border: '1px solid lightgray', alignItems: 'center', backgroundColor: 'white', padding: '10px' }}>
                                    <Stack direction="row" spacing={1} sx={{ flexGrow: 0, justifyContent: 'start', marginRight: '30px' }}>
                                        <CustomChip value={selectedInfo.status} label={status_label} />
                                    </Stack>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', marginRight: '30px' }}>{selectedInfo.title}</Typography>
                                    <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={openPdfPreviewDialog} >契約書を閲覧する</Button>
                                </Box>
                            </Box>
                            {/* 自社担当者に対して表示する */}
                            {isInternalPicUser && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', width: '100%' }}>
                                        <Box sx={{ width: '30%', display: 'flex', alignItems: 'end' }}>
                                            <Button variant="contained" color="success" sx={{ width: '16em', marginRight: '10px', '&:hover': { backgroundColor: 'darkgreen' } }} onClick={openRestoreDialog} >署名用URLを発行する</Button>
                                            <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={openDeleteDialog} >破棄する</Button>
                                        </Box>
                                        <Box sx={{ width: '30%', justifyContent: 'flex-end', display: 'flex' }}>
                                            <AppBar position="static">
                                                <Tabs
                                                    value={tabValue}
                                                    onChange={handleChange}
                                                    indicatorColor="secondary"
                                                    textColor="inherit"
                                                    variant="fullWidth"
                                                    aria-label="full width tabs example"
                                                    sx={{
                                                        '& .MuiTab-root': {
                                                            backgroundColor: 'lightblue', // デフォルトの背景色
                                                        },
                                                        '& .Mui-selected': {
                                                            backgroundColor: 'darkblue', // 選択されたタブの背景色
                                                            color: 'white', // 選択されたタブの文字色
                                                        },
                                                    }}
                                                >
                                                    <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>承認者情報</Typography>}
                                                        {...a11yProps(0)}
                                                    />
                                                    <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>登録情報</Typography>}
                                                        {...a11yProps(1)}
                                                    />
                                                    {/* <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>完了通知の送付先</Typography>}
                                                        {...a11yProps(2)}
                                                    /> */}
                                                </Tabs>
                                            </AppBar>
                                        </Box>
                                    </Box>
                                </>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', width: '100%' }}>
                                <Box sx={{ width: '100%' }}>
                                    <TabPanel value={tabValue} index={0} dir={theme.direction}>
                                        <PresentApproverInfo
                                            present_approver={presentApprover}
                                            isPresentApprover={true}
                                        />
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={1} dir={theme.direction}>
                                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                                <Box sx={{ flexGrow: 0, width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                                        契約基本情報
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.type}
                                                        id="title"
                                                        label="契約種別"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.deal_amount}
                                                        id="title"
                                                        label="契約金額"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={`${approveFlowData?.submission_period}日`}
                                                        id="title"
                                                        label="署名用URLの有効期限"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.conclusion_date}
                                                        id="title"
                                                        label="契約開始日"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.expiration_date}
                                                        id="title"
                                                        label="契約終了日"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                            </Box>
                                            {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(restoreDocument)}>更新する</Button>
                                            </Box> */}
                                        </Box>
                                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                                <Box sx={{ flexGrow: 0, width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                                        自社登録情報
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.own_company?.company_name}
                                                        id="title"
                                                        label="企業名"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.own_company?.postal_code}
                                                        id="title"
                                                        label="郵便番号"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={`${selectedInfo?.own_company?.state} ${selectedInfo?.own_company?.city} ${selectedInfo?.own_company?.address_line} ${selectedInfo?.own_company?.building}`}
                                                        id="title"
                                                        label="住所"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.internal_pic?.user_name}
                                                        id="title"
                                                        label="契約窓口"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                                <Box sx={{ flexGrow: 0, width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                                        相手方登録情報
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.customer_company?.company_name}
                                                        id="title"
                                                        label="企業名"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.customer_company?.postal_code}
                                                        id="title"
                                                        label="郵便番号"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={`${selectedInfo?.customer_company?.state} ${selectedInfo?.own_company?.city} ${selectedInfo?.own_company?.address_line} ${selectedInfo?.own_company?.building}`}
                                                        id="title"
                                                        label="住所"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={selectedInfo?.customer_pic?.user_name}
                                                        id="title"
                                                        label="契約窓口"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={2} dir={theme.direction}>
                                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                            <Box sx={{ width: '96%', marginLeft: '2%', marginRight: '2%', marginBottom: '20px' }}>
                                                <ApproveFlowNotifier internalNotifier={internalNotifier} customerNotifier={customerNotifier} />
                                            </Box>
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleRemandDialogOpen}>更新する</Button>
                                            </Box>
                                        </Box>
                                    </TabPanel>
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
                {/* 登録情報修正確認ダイアログ */}
                {/* TODO：2024年12月社内リリース時点では未実装 */}
                {/* < div >
                    <Modal open={approveFlowModifyDialogOpen} >
                        <Box sx={{ ...modifyapproveFlowDialogStyle, display: 'flex', flexDirection: 'column' }} >
                            <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', marginTop: '10px', marginBottom: '10px' }}>
                                承認フローの変更は「承認者」のみ可能です。<br />
                                <p style={{ color: 'red' }}>
                                    ※「担当者」「代表者」を変更する場合は、最初からやり直してください。
                                </p>
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '15px', marginTop: 'auto' }}>
                                <EdocButton text='更新する' variant='contained' color='info' type='submit' disabled={false} handleClick={startApproveFlow} />
                                <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleApproveFlowModifyDialogOpen} />
                            </Box>
                        </Box>
                    </Modal>
                </div > */}
                {/* 署名用URL再発行依頼ダイアログ */}
                < div >
                    <Modal open={restoreDialogOpen}>
                        <Box sx={{ ...resendSighUrlDialogStyle, backgroundColor: '#eeffee' }}>
                            <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                以下の宛先に署名用URLを発行します。よろしいですか？
                            </Typography>
                            <Box sx={{ marginBottom: '10px' }}>
                                <Box bgcolor='white' sx={{ border: '1px solid lightgray', padding: '20px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={presentApprover?.company_name}
                                            label="会社名"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={presentApprover?.user_name}
                                            label="氏名"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            value={presentApprover?.position || '-----'}
                                            label="役職"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <TextField
                                            value={presentApprover?.email}
                                            label="メールアドレス"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color='success' onClick={(sendRestoreRequest)} sx={{ width: '10em', margin: '5px', '&:hover': { backgroundColor: 'darkgreen' } }}>発行する</Button>
                                <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={closeRestoreDialog} />
                            </Box>
                        </Box>
                    </Modal>
                </div >
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
                                {/* <EdocButton text='実行する' variant='contained' color='error' type='submit' disabled={false} handleClick={onDelete} />
                                <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleDeleteDialogClose} /> */}
                                <Button variant="contained" color="error" sx={{ '&:hover': { backgroundColor: 'darkred' }, width: '10em', height: '40px', marginRight: '5px' }} onClick={(onDelete)}>実行する</Button>
                                <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' }, width: '10em', height: '40px' }} onClick={(handleDeleteDialogClose)}>キャンセル</Button>
                            </Box>
                        </Box>
                    </Modal>
                </div>
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
};

export default CustomerApprovePage;