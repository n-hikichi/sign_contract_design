import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AppBar from '@mui/material/AppBar';
import { Box, Button, CircularProgress, Chip, Grid, Modal, SelectChangeEvent, Stack, TextField, Tooltip, Typography } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useRef, useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { deleteModalStyle, remandRequestDialogStyle, resendSighUrlDialogStyle, baseContentsStyle, pdfPreviewDialogStyle } from '../../../styles/styles';
import api from "../../../utils/apiAccessor";
import apiDataType from "../../../utils/apiDataType";
import apiExecutor from "../../../utils/apiExecutor";
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import ApproverInfo from '../common/ApproverInfo';
import CustomChip from '../common/CustomChip';
import ErrorDialog from '../common/ErrorDialog';
import RequestResourceNotFoundErrorDialog from '../common/RequestResourceNotFoundErrorDialog';
import PreviewDocument from '../common/PreviewDocument';
import SignatureApproveList from "../common/SignatureApproveList";
import ApiProcessingDialog from "../common/ApiProcessingDialog";
import { getUserData, getUserDataForDebug } from '../../../auth/login';
import SideMenu from "../../templates/SideMenu";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import CustomPulldownMenu, { remandReason } from '../../../components/elements/CustomPulldownMenu';
import SendIcon from '@mui/icons-material/Send';
import WarningIcon from '@mui/icons-material/Warning';
import { useTheme } from '@mui/material/styles';
import PreviewApproveFlow, { ApproveFlowNotifier } from '../common/PreviewApproveFlow';
import apiStatus from "../../../utils/apiStatus";
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";

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

// 承認フローの型を定義
interface Approver {
    company_name: string;
    user_name: string;
    email: string;
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

// status：INTERNAL_APPROVING
const status_label = '社内承認中';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Props = {
    url: string;
    onRead?: () => void;               // 読了コールバック
};

/**
 * 
 * 社内ユーザー向けの承認画面
 * 
 */
const InternalApprovePage = () => {
    const navigate = useNavigate();

    // 社内承認中リスト画面で選択した契約書の情報を取得する
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
    const [isPdfLoading, setIsPdfLoading] = useState(true);
    // pdf読み込み中を表すフラグ
    const [isLoading, setIsLoading] = useState(false);

    // 契約書情報
    const [agreementData, setAgreementData] = useState<apiDataType.AgreementData>(apiDataType.createInitialAgreementData());

    // 相手方承認者フロー１番目の情報
    const [customerFirstApprover, setCustomerFirstApprover] = useState<Approver>();
    // 承認フロー
    const [approveFlowData, setApproveFlowData] = useState<apiDataType.AgreementFlow>(apiDataType.createInitialAgreementFlow());
    // 現在の承認者情報
    const [presentApprover, setPresentApprover] = useState<apiDataType.Approver>();
    // 差戻し要求内容
    const [remand_Info, setRemandInfo] = useState<apiDataType.RemandInfo>(apiDataType.createInitialRemandRequest());
    // ユーザー権限（ログインユーザー）
    // const [isLoginUser, setIsLoginUser] = useState(false);
    // ユーザー権限（自社担当者）
    const [isInternalPicUser, setIsInternalPicUser] = useState(false);
    // ユーザー権限（現在の承認者）
    const [isPresentApprover, setIsPresentApprover] = useState(false);
    // 社内関係者
    const [internalNotifier, setInternalNotifier] = useState<NotifierListColumns[]>([]);
    // 相手方関係者フロー
    const [customerNotifier, setCustomerNotifier] = useState<NotifierListColumns[]>([]);
    // PDFファイルプレビュー
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);

    const [isPdfViewedEnough, setIsPdfViewedEnough] = useState(false);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

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
        navigate('/documentManagement/internalDocument');
        return;
    };

    /***
     * 
     * 実行失敗ダイアログ（API実行）
     * 
     */
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [numPages, setNumPages] = useState(0);
    const [isRead, setIsRead] = useState(false);
    const createObserver = useCallback(() => {
        if (!containerRef.current || !numPages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // 対象のページ番号を取得 (1-origin)
                    const page = Number(
                        (entry.target as HTMLElement).dataset.pageNumber
                    );

                    // 最終ページが 95 % 以上可視になったら読了
                    if (
                        page === numPages &&
                        entry.intersectionRatio >= 0.95 &&
                        entry.isIntersecting
                    ) {
                        observer.disconnect();          // 1 回で十分
                        setIsRead(true);
                        // onRead?.();
                    }
                });
            },
            {
                root: containerRef.current,         // ビューポートを限定
                threshold: [0.25, 0.5, 0.75, 0.95, 1],
            }
        );

        // すべてのページを監視（軽量なので OK）
        pageRefs.current.forEach((node) => node && observer.observe(node));
        return observer;
    }, [numPages]);

    useEffect(() => {

        setIsLoading(true);

        const fetchData = async () => {
            try {
                if (!selectedInfo) {
                    setErrorCode(api.HTTP_NOT_FOUND);
                    setErrorProcess('締結済み契約書　取得処理');
                    setLoadingPageFailedDialogOpen(true);
                    return;
                }

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
                    setErrorProcess('社内承認フロー　契約書取得処理');
                    setLoadingPageFailedDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const [agreement, approvals, file] = await Promise.all(responses.map((res: Response) => res.json()));

                // 契約書情報設定
                setAgreementData(agreement);

                // 承認フロー設定
                setApproveFlowData(approvals);

                // 相手方承認者フロー１番目の情報を設定
                if (approvals.customer_approver.length > 0) {
                    setCustomerFirstApprover(approvals.customer_approver[0]);
                } else {
                    setCustomerFirstApprover(approvals.customer_authorizer);
                }

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

                // ログインユーザーが自社担当者かチェックする
                if (approvals.internal_pic.email === loginUser) {
                    // setIsLoginUser(true);
                    setIsInternalPicUser(true);
                }

                // ログインユーザーが現在の承認者かチェックする
                if (presentApproverInfo.email === loginUser) {
                    setIsPresentApprover(true);
                }

                setIsPdfLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('社内承認フロー　契約書取得処理');
                setLoadingPageFailedDialogOpen(true);
                // setExecuteFailedApiDialogOpen(true);
                // setPdfPreviewDialogOpen(false);
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

    useEffect(() => {
        const observer = createObserver();
        return () => observer?.disconnect();
    }, [createObserver]);

    const handlePdfScroll = () => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        const scrollableHeight = scrollHeight - clientHeight;
        const scrollPercent = scrollTop / scrollableHeight;

        if (scrollPercent >= 0.9 && !isPdfViewedEnough) {
            setIsPdfViewedEnough(true);
        }
    };

    /***
     * 
     * PDFファイルプレビューダイアログ（契約書）
     * 
     */
    // プレビューダイアログの開閉状態
    const handlePdfPreviewDialogOpen = () => {
        setIsPdfViewedEnough(false);
        setPdfPreviewDialogOpen(true);
    };
    const handlePdfPreviewDialogClose = () => {
        if (!isAgreementDetailChecked) {
            setIsPdfViewedEnough(false);
        };
        setPdfPreviewDialogOpen(false);
    };

    // ダイアログを開く関数
    const openPdfPreviewDialog = () => {
        setPdfPreviewDialogOpen(true);
    };

    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newTabValue: number) => {
        setTabValue(newTabValue);
    };

    /***
     * 
     * 署名用URL再発行要求
     * 
     */
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const handleRestoreDialogOpen = () => setRestoreDialogOpen(true);
    const handleRestoreDialogClose = () => setRestoreDialogOpen(false);

    const sendRestoreRequest = async () => {
        // 発行処理を実装する
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

            navigate('/documentManagement/internalDocument/reissueSignedUrlRequestComplete', {
                state: {
                    selectedInfo,
                    presentApprover,
                    issuedTime
                }
            });
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

    /***
     * 
     * 契約書の内容を確認した
     * 
     */
    // チェックボックスの状態を管理する
    const [isAgreementDetailChecked, setIsAgreementDetailChecked] = useState(false);

    // チェックボックスの状態を更新する
    const handleAgreementDetailCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsAgreementDetailChecked(event.target.checked);
    };

    /***
     * 
     * ユーザー情報が正しい事を確認した
     * 
     */
    // チェックボックスの状態を管理する
    const [isChecked, setIsChecked] = useState(false);

    // チェックボックスの状態を更新する
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    // 承認要求
    const onApprove = async () => {

        setExecuteApiDialogOpen(true);
        try {
            const res = await api.postAgreementApprovals(selectedInfo.agreement_id);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('自社フロー　承認処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            }
            const approveDate = await res.json();

            navigate('/documentManagement/internalDocument/approveComplete', {
                state: {
                    selectedInfo,
                    presentApprover,
                    approveDate
                }
            });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('自社フロー　承認処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    /***
     * 
     * 差戻し要求
     * 差戻しダイアログに関する処理
     * 
     */
    // ダイアログの開閉状態
    const [remandDialogOpen, setRemandDialogOpen] = useState(false);
    const handleRemandDialogOpen = () => setRemandDialogOpen(true);
    const handleRemandDialogClose = () => setRemandDialogOpen(false);

    const closeRemandDialog = () => {
        setRemandDialogOpen(false);
    };

    // 差戻しダイアログの入力フォームの値
    type RestoreInput = {
        responderId: string,
        types: string,
        comment: string,
    };
    const { control, handleSubmit, formState: { errors }, setValue } = useForm<RestoreInput>(
        {
            defaultValues: {
                responderId: presentApprover?.approver_id,
                types: remandReason[0].label,
                comment: '',
            }
        }
    );

    // 差戻し種別
    const [selectedValue, setSelectedValue] = useState<string>('');
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        setSelectedValue(event.target.value as string);
        setValue('types', event.target.value);
    };

    // 差戻し理由
    const [textFieldValue, setTextFieldValue] = useState('');

    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTextFieldValue(event.target.value);
    };

    // 差戻し要求
    const onRemand = async (data: RestoreInput) => {

        setExecuteApiDialogOpen(true);
        try {
            const requestBody = {
                responder_id: presentApprover?.approver_id, // responderIdがundefinedの場合はpresentApproverのIDを使用
                types: [data.types], // typesを配列形式に変換
                comment: data.comment || "", // commentが空の場合はデフォルト値を設定
            };

            const res = await api.postAgreementRemand(selectedInfo.agreement_id, requestBody);

            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('自社フロー　差戻し処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            };

            const internalPic = approveFlowData.internal_pic;

            // 取得したPDFファイルを画面に設定する
            const remandTime = await res.json();
            navigate('/documentManagement/internalDocument/remandComplete', { state: { remandTime, data, internalPic } });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('自社フロー　差戻し処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
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
            const flowStatus = selectedInfo.status;
            navigate('/documentManagement/internalDocument/deleteComplete', { state: { selectedInfo, deleteResponse, flowStatus, approveFlowData } });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('契約書破棄処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    // 登録情報修正要求
    const restoreDocument = async (type: string) => {
        navigate('/documentManagement/internalDocument/modifyDocument', { state: { type, selectedInfo, internalNotifier, customerNotifier } });
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box sx={{ bgcolor: isPresentApprover ? '#eeeeff' : 'grey.200', height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px' }}>
                    <Header />
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <SignatureApproveList approveHistory={approveFlowData} flowStatus={selectedInfo?.status} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '5%', paddingRight: '5%', width: '100%' }} px={4}>
                            {isPresentApprover && (
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                    承認依頼が届いています。契約内容を確認し承認してください。
                                </Typography>
                            )}
                            {!isPresentApprover && (
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                    現在の社内承認状況です
                                </Typography>
                            )}
                            <Button variant="contained" color="primary" sx={{ width: '10em', marginBottom: '5px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(() => navigate('/documentManagement/internalDocument'))}>一覧へ戻る</Button>
                            <Box sx={{ marginBottom: '40px', width: '100%' }}>
                                <Box sx={{ width: '100%', display: 'flex', border: '1px solid lightgray', alignItems: 'center', backgroundColor: 'white', padding: '10px' }}>
                                    <Stack direction="row" spacing={1} sx={{ flexGrow: 0, justifyContent: 'start', marginRight: '30px' }}>
                                        <CustomChip value={selectedInfo?.status} label={status_label} />
                                    </Stack>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', marginRight: '30px' }}>{selectedInfo?.title}</Typography>
                                    <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={openPdfPreviewDialog} disabled={isPdfLoading} >契約書を閲覧する</Button>
                                </Box>
                            </Box>
                            {/* 自社担当者に対して表示する */}
                            {isInternalPicUser && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', width: '100%' }}>
                                        <Box sx={{ width: '30%', display: 'flex', alignItems: 'end' }}>
                                            <Button variant="contained" color="success" sx={{ width: '14em', marginRight: '10px', '&:hover': { backgroundColor: 'darkgreen' } }} onClick={openRestoreDialog} >署名用URLを発行する</Button>
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
                                        <ApproverInfo
                                            isChecked={isChecked}
                                            handleCheckboxChange={handleCheckboxChange}
                                            present_approver={presentApprover}
                                            isPresentApprover={isPresentApprover}
                                            isAgreementDetailChecked={isAgreementDetailChecked}
                                        />
                                        {/* 現在の承認者に対して表示する */}
                                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
                                            {isPresentApprover && (
                                                <Box>
                                                    <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={onApprove} disabled={!isAgreementDetailChecked || !isChecked}>承認する</Button>
                                                    {/* 差戻しは「自社担当者」以外の場合に表示する */}
                                                    {/* ※「自社担当者」は差戻し先がないため */}
                                                    {(!isInternalPicUser && isPresentApprover) && (
                                                        <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleRemandDialogOpen}>差戻し</Button>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
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
                                                <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(() => restoreDocument('basicInfo'))}>更新する</Button>
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
                                                <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={() => restoreDocument('notification')}>更新する</Button>
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
                        {isPresentApprover ? (
                            <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', boxShadow: 24, zIndex: 9999 }} >
                                <Box sx={{ width: '100%', height: '95%', display: 'flex', flexDirection: 'column', border: 'solid 2px black' }}>
                                    <Box
                                        ref={pdfContainerRef}
                                        onScroll={handlePdfScroll}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            border: '1px solid #ccc',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <Document
                                            file={pdf_base64}
                                            loading={
                                                <Box sx={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CircularProgress />
                                                </Box>
                                            }
                                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                        >
                                            {Array.from({ length: numPages }, (_, i) => (
                                                <div key={i + 1} style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                                                    <Page
                                                        pageNumber={i + 1}
                                                        width={1200}
                                                        renderAnnotationLayer={false}
                                                        renderTextLayer={false}
                                                        loading={null}
                                                        noData={null}
                                                    />
                                                </div>
                                            ))}
                                        </Document>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '60px',
                                            borderTop: 'solid 0.2px gray',
                                            backgroundColor: !isPdfViewedEnough ? '#ffcccc' : '#b2fab4',
                                        }}
                                    >
                                        <FormControlLabel
                                            required
                                            control={
                                                <Checkbox
                                                    checked={isAgreementDetailChecked}
                                                    onChange={handleAgreementDetailCheckboxChange}
                                                    disabled={!isPdfViewedEnough}
                                                />
                                            }
                                            label={
                                                <Typography
                                                    sx={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        color: !isPdfViewedEnough ? 'darkred' : 'black',
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    契約書の内容を確認しました。
                                                </Typography>
                                            }
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '5%' }}>
                                    <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' }, marginTop: '5px', marginBottom: '5px' }} onClick={(handlePdfPreviewDialogClose)}>プレビュー終了</Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={pdfPreviewDialogStyle} >
                                <Box
                                    sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                                    onClick={() => window.open(pdf_base64, '_blank')}
                                >
                                    {isPdfLoading ? (
                                        <CircularProgress sx={{ width: '40px', height: '40px' }} />
                                    ) : (
                                        <embed type='application/pdf' src={pdf_base64 + "#zoom=100"} height='100%' width='100%' />
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                                    <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={(handlePdfPreviewDialogClose)}>プレビュー終了</Button>
                                </Box>
                            </Box>
                        )}
                    </Modal>
                </div>
                {/* 署名用URL再発行ダイアログ */}
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
                {/* 差戻し依頼ダイアログ */}
                < div >
                    <Modal open={remandDialogOpen} >
                        <Box sx={{ ...remandRequestDialogStyle }}>
                            <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '30px' }}>
                                差戻し内容を入力してから、差戻しを行ってください
                            </Typography>
                            <Box sx={{ height: '82%', overflowY: 'auto', marginBottom: '20px' }}>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', width: '30%', fontSize: '1.2em', border: '1px solid lightgray' }}>
                                        差戻し内容（※必須）
                                    </Typography>
                                    <Box bgcolor='white' sx={{ border: '1px solid lightgray', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '2%', paddingRight: '2%', marginRight: '5px' }}>
                                        <Box sx={{ display: 'flex', width: '50%', marginRight: '10px', marginBottom: '30px' }}>
                                            <CustomPulldownMenu
                                                label="差戻し種別"
                                                value={selectedValue}
                                                onChange={handleSelectChange}
                                                items={remandReason}
                                            />
                                        </Box>
                                        <Box sx={{ marginBottom: '20px' }}>
                                            <Controller
                                                name='comment'
                                                control={control}
                                                render={({ field }) => {
                                                    const { value, ...rest } = field;
                                                    return (
                                                        <Box bgcolor='white' sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                            <TextField
                                                                {...rest}
                                                                id="delete_reason"
                                                                label="差戻し理由"
                                                                multiline
                                                                rows={4}
                                                                value={textFieldValue}
                                                                onChange={(e) => {
                                                                    rest.onChange(e);
                                                                    handleTextFieldChange(e);
                                                                }}
                                                                sx={{ width: '100%', border: '1px solid lightgray' }}
                                                            />
                                                        </Box>
                                                    )
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', width: '30%', fontSize: '1.2em', border: '1px solid lightgray' }}>
                                        差戻し要求送信先
                                    </Typography>
                                    <Box bgcolor='white' sx={{ border: '1px solid lightgray', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '2%', paddingRight: '2%', marginRight: '5px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={approveFlowData.internal_pic.company_name}
                                                id="remand.company_name"
                                                label="会社名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={approveFlowData.internal_pic.user_name}
                                                id="remand.user_name"
                                                label="氏名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                            <TextField
                                                value={approveFlowData.internal_pic.email}
                                                id="remand.email"
                                                label="メールアドレス"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '30px', width: '100%' }}>
                                <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleSubmit(onRemand)} disabled={!textFieldValue.trim()}>差戻し</Button>
                                <Button variant="contained" color="primary" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} onClick={closeRemandDialog} disabled={false}>キャンセル</Button>
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
                                <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={onDelete} >実行する</Button>
                                <Button variant="contained" color="primary" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleDeleteDialogClose} >キャンセル</Button>
                            </Box>
                        </Box>
                    </Modal>
                </div>
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
                <ErrorDialog open={loadingPageFailedDialog} handleClose={handleLoadingPageFailedDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
};

export default InternalApprovePage;