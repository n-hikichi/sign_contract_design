import { Box, CircularProgress, CssBaseline, DialogTitle, Grid, Modal, Select, SelectChangeEvent, Switch, TextField, Tooltip, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { PDFDownloadLink } from '@react-pdf/renderer';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { baseContentsStyle, basePageStyle, deleteModalStyle, pdfPreviewDialogStyle, remandRequestDialogStyle } from '../../../styles/styles';
import apiExecutor from "../../../utils/apiExecutor";
import converter from "../../../utils/converter";
import EdocButton from '../../elements/EdocButton';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import ErrorDialog from '../common/ErrorDialog';
import SignatureHistory from './SignatureHistory';
import SignatureHistoryPdf from './SignatureHistoryPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Controller, useForm } from "react-hook-form";
import api from "../../../utils/apiAccessor";
import CustomPulldownMenu, { remandReason, remindTime, deleteReason } from '../../../components/elements/CustomPulldownMenu';
import WarningIcon from '@mui/icons-material/Warning';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import RegisterNewAgreementUseExistDataDialog from './RegisterNewAgreementUseExistDataDialog';

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

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

type Approver = {
    user_name: string;
    company_name: string;
    position: string;
    email: string;
    approved: boolean;
    approved_time: string;
};

const createApprover = (): Approver => ({
    user_name: "",
    company_name: "",
    position: "",
    email: "",
    approved: false,
    approved_time: "",
});

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
    internal_pic: createApprover(),
    internal_approver: createApprover(),
    internal_authorizer: createApprover(),
    customer_pic: createApprover(),
    customer_approver: createApprover(),
    customer_authorizer: createApprover(),
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

/**
 * 
 * 締結済み契約書を表示する
 * 
 */
const ConcludeDocumentPage = () => {
    const navigate = useNavigate();

    // 締結済みリスト画面で選択した契約書の情報を取得する
    const location = useLocation();

    let selectedInfo: any;
    const { agreementId } = useParams();

    if (agreementId) {
        selectedInfo = location.state?.agreementInfo;
    } else {
        selectedInfo = location.state?.record;
    };

    // data url形式のbase64にエンコードされたpdfファイル
    const [pdfBase64, setPdfBase64] = useState('');
    // pdf読み込み中を表すフラグ
    const [pdfIsLoading, setPdfIsLoading] = useState(false);
    // 契約書idに対する承認フロー
    const [approveFlowData, setApproveFlowData] = useState<AgreementFlow>(initialAgreementFlow);
    // 署名結果を取得する
    const [approveResult, setApproveResult] = useState<ApproveResult>(initialApproveResult);
    // 署名検証結果を表示するメッセージ
    const [valiateMessage, setValiateMessage] = useState('');
    // 署名検証結果の背景色
    const [backgroundColor, setBackgroundColor] = useState('#0D47A1');
    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);
    // 署名履歴の署名者リスト
    const [approveUserList, setApproveUserList] = useState<Signatures[]>([]);

    // PDFファイルプレビューダイアログの開閉状態
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);

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

    /***
     * 
     * 実行失敗ダイアログ（画面遷移）
     * 
     */
    const [loadingPageFailedDialog, setLoadingPageFailedDialogOpen] = useState(false);
    const handleLoadingPageFailedDialogClose = () => {
        setLoadingPageFailedDialogOpen(false);
        // 画面遷移時にエラーが発生した場合は一覧画面に戻る
        navigate('/documentManagement/conclusionDocument');
        return;
    };

    // ダウンロードリンクを作成
    const downloadPdf = () => {
        const link = document.createElement('a');
        link.href = pdfBase64;
        link.download = selectedInfo.title;
        link.click();
    };

    useEffect(() => {

        if (!selectedInfo) {
            setErrorCode(api.HTTP_NOT_FOUND);
            setErrorProcess('締結済み契約書　取得処理');
            setLoadingPageFailedDialogOpen(true);
            return;
        }

        // 非同期処理を開始する前にローディング状態をtrueに設定
        setIsLoading(true);

        const fetchData = async () => {
            try {
                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetAgreementSignatures(selectedInfo.agreement_id),
                    apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id),
                    apiExecutor.fetchGetAgreementFile(selectedInfo.agreement_id)
                ];

                // APIを並列実行
                const responses = await Promise.all(requests);

                // ステータスコードが200以外の場合の処理
                const errorResponse = responses.find((res: Response) => res.status !== 200);
                if (errorResponse) {
                    setErrorCode(errorResponse.status);
                    setErrorProcess('締結済み契約書　取得処理');
                    setLoadingPageFailedDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const [signature, approvals, file] = await Promise.all(responses.map((res: Response) => res.json()));

                // 取得結果を設定する
                setApproveResult(signature);
                setApproveUserList(signature.signatures.slice(1));
                setApproveFlowData(approvals);

                setPdfBase64("data:application/pdf;base64," + file.file);

                // 検証結果をチェックする
                if (signature.agreement_valid) {
                    setValiateMessage('全ての署名が有効です');
                    setBackgroundColor('#0D47A1');
                } else {
                    setValiateMessage('全ての署名が有効ではありません');
                    setBackgroundColor('darkred');
                }
            } catch (error) {
                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('締結済み契約書　取得処理');
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

    const theme = useTheme();
    const [value, setValue_] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue_(newValue);
    };

    // ダイアログを開く関数
    const openPdfPreviewDialog = () => {
        setPdfPreviewDialogOpen(true);
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
                // responderId: presentApprover?.approver_id,
                // types: remandReason[0].label,
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
        try {
            const res = await api.postAgreementRemand(selectedInfo.agreement_id, data);

            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);
            };

            const internalPic = approveFlowData.internal_pic;

            // 取得したPDFファイルを画面に設定する
            const remandTime = await res.json();
            navigate('/documentManagement/internalDocument/remandComplete', { state: { remandTime, data, internalPic } });
        } catch (error) {
            console.log("An unexpected error has occurred.");
        }
    };

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
        try {
            const res = await api.deleteAgreement(selectedInfo.agreement_id);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);
            }

            // 取得したPDFファイルを画面に設定する
            const agreementData = await res.json();
            navigate('/documentManagement/registerList/deleteComplete', { state: { agreementData } });
        } catch (error) {
            console.log("An unexpected error has occurred.");
        }
    };

    // 追加：流用ダイアログの開閉状態
    const [registerNewAgreementUseExistDataDialogOpen, setRegisterNewAgreementUseExistDataDialogOpen] = useState(false);

    // 追加：流用ボタン押下時のハンドラ
    const handleOpenRegisterNewAgreementUseExistDataDialog = () => {
        setRegisterNewAgreementUseExistDataDialogOpen(true);
    };
    const handleCloseRegisterNewAgreementUseExistDataDialog = () => {
        setRegisterNewAgreementUseExistDataDialogOpen(false);
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box sx={{ ...basePageStyle }}>
                    <Header />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CssBaseline />
                        <SignatureHistory approveFlowData={approveFlowData} approveResult={approveResult} agreement_id={selectedInfo.agreement_id} title={selectedInfo.title} own_company={selectedInfo.own_company.company_name} customer_company={selectedInfo.customer_company.company_name} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                            <Box sx={{ display: 'flex', flexDirection: 'column', paddingBottom: '10px', paddingTop: '10px', width: '90%', marginLeft: '5%', marginRight: '5%' }} px={4}>
                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginBottom: '40px', width: '100%' }}>
                                    <Typography sx={{ backgroundColor: backgroundColor, padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '100%', margin: 'auto', fontSize: '1.5em' }}>
                                        {valiateMessage}
                                    </Typography>
                                </Box>
                                <Box sx={{ bgcolor: 'grey.200', width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '5px' }}>
                                    <Button variant="contained" color="primary" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(() => navigate('/documentManagement/conclusionDocument'))}>一覧へ戻る</Button>
                                    {/* <Button variant="contained" color="success" onClick={(() => navigate('/documentManagement/conclusionDocument'))} sx={{ marginLeft: '10px', width: '250px', '&:hover': { backgroundColor: 'darkgreen' } }}>契約書の差分を比較する</Button> */}
                                </Box>
                                {/* <Button variant="contained" color="success" onClick={() => fetchGetAgreementList(selectedValueUrlExpirationDate)} sx={{ marginLeft: '10px', width: '250px', height: '50px', '&:hover': { backgroundColor: 'darkgreen' } }}>契約書の差分を比較する</Button> */}
                                <Box sx={{ marginBottom: '40px', width: '100%' }}>
                                    <Box sx={{ width: '100%', display: 'flex', border: '1px solid lightgray', alignItems: 'center', backgroundColor: 'white', padding: '10px' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', marginLeft: '30px', marginRight: '30px' }}>{selectedInfo.title}</Typography>
                                        <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={openPdfPreviewDialog} >契約書を閲覧する</Button>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box sx={{ bgcolor: 'grey.200', width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
                                        <Box sx={{ width: '20%', justifyContent: 'flex-end', display: 'flex' }}>
                                            <AppBar position="static">
                                                <Tabs
                                                    value={value}
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
                                                    <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>締結情報</Typography>}
                                                        {...a11yProps(0)}
                                                    />
                                                    {/* <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>高度な管理</Typography>}
                                                        // {...a11yProps(3)}
                                                        {...a11yProps(1)}
                                                    /> */}
                                                    {/* <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>契約書管理</Typography>}
                                                        {...a11yProps(1)}
                                                    /> */}
                                                </Tabs>
                                            </AppBar>
                                        </Box>
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                        <TabPanel value={value} index={0} dir={theme.direction}>
                                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                                <Box sx={{ width: '90%', marginRight: '5%', marginLeft: '5%' }}>
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
                                                        value={selectedInfo?.deal_amount.toLocaleString() + '円'}
                                                        id="title"
                                                        label="契約金額"
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={approveFlowData?.internal_authorizer?.user_name}
                                                            id="title"
                                                            label="契約代表者"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                        <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }}>更新する</Button>
                                                    </Box> */}
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
                                                            value={`${selectedInfo?.customer_company?.state} ${selectedInfo?.customer_company?.city} ${selectedInfo?.customer_company?.address_line} ${selectedInfo?.customer_company?.building}`}
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={approveFlowData?.customer_authorizer?.user_name}
                                                            id="title"
                                                            label="契約代表者"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                        <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }}>更新する</Button>
                                                    </Box> */}
                                                </Box>
                                            </Box>
                                        </TabPanel>
                                        <TabPanel value={value} index={1} dir={theme.direction}>
                                            {/* ※ 本情報は契約書の「管理者」権限を保持しているユーザーに対して表示する。（追加でデータを取得する必要がある為、データ取得の契機を考える） */}
                                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value='契約書情報を流用して新しい承認フローを開始する'
                                                        id="title"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                        <Button variant="contained" onClick={handleOpenRegisterNewAgreementUseExistDataDialog} color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }}>流用する</Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </TabPanel>
                                        {/* <TabPanel value={value} index={1} dir={theme.direction}>
                                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                                <Box sx={{ width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                                        自動更新設定
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value='契約書の更新タイミングを自動通知する'
                                                        id="title"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                    <Switch />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '85%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '10%' }}>
                                                    <TextField
                                                        value='更新通知タイミング設定'
                                                        id="title"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '30%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '65%', marginBottom: '20px' }}>
                                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                                        <InputLabel id='pulldown'></InputLabel>
                                                        <Select
                                                            id='pulldown'
                                                            value={selectedValue}
                                                            onChange={handleSelectChange}
                                                            sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                        >
                                                            {remindTime.map((item) => (
                                                                <MenuItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '85%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '10%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value='更新情報を自動で作成する'
                                                        id="title"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                    <Switch />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '85%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '10%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value='更新通知の送付先'
                                                        id="title"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={`担当者氏名　　：${selectedInfo?.internal_pic?.user_name}`}
                                                        id="title"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={`メールアドレス：${selectedInfo?.internal_pic?.email}`}
                                                        id="title"
                                                        variant="standard"
                                                        sx={disabledTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                                    <Box sx={{ width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                                        <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                                            契約関係者
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value='自社担当者'
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`氏名　　　　　：${selectedInfo?.internal_pic?.user_name}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`役職　　　　　：${selectedInfo?.internal_pic?.position}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`メールアドレス：${selectedInfo?.internal_pic?.email}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value='自社代表者'
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`氏名　　　　　：${approveFlowData?.internal_authorizer?.user_name}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`役職　　　　　：${approveFlowData?.internal_authorizer?.position}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`メールアドレス：${approveFlowData?.internal_authorizer?.email}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value='相手方担当者'
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`氏名　　　　　：${approveFlowData?.customer_pic?.user_name}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`役職　　　　　：${approveFlowData?.customer_pic?.position}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`メールアドレス：${approveFlowData?.customer_pic?.email}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value='相手方代表者'
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`氏名　　　　　：${approveFlowData?.customer_authorizer?.user_name}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`役職　　　　　：${approveFlowData?.customer_authorizer?.position}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '45%', marginBottom: '20px' }}>
                                                        <TextField
                                                            value={`メールアドレス：${approveFlowData?.customer_authorizer?.email}`}
                                                            id="title"
                                                            variant="standard"
                                                            sx={disabledTextFieldStyle}
                                                            disabled={true}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                    <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }}>更新する</Button>
                                                    <Button variant="contained" onClick={handleRemandDialogOpen} color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }}>破棄する</Button>
                                                </Box>
                                            </Box>
                                        </TabPanel> */}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
                {/* ファイルプレビューダイアログ */}
                <div>
                    <Modal
                        open={pdfPreviewDialogOpen}
                        onClose={handlePdfPreviewDialogClose}
                    >
                        <Box sx={pdfPreviewDialogStyle}>
                            <Box
                                sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                                onClick={() => window.open(pdfBase64, '_blank')}
                            >
                                {pdfIsLoading ? <CircularProgress sx={{ width: '40px', height: '40px' }} /> :
                                    <embed type='application/pdf' src={pdfBase64 + "#zoom=100"} height='100%' width='100%' />
                                }
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                <Button variant="contained" color="primary" onClick={() => downloadPdf()} disabled={false} sx={{ marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' }, height: '35px' }}>契約書ダウンロード</Button>
                                <PDFDownloadLink document={<SignatureHistoryPdf approveFlowData={approveFlowData} approveResult={approveUserList} agreement_id={selectedInfo.agreement_id} title={selectedInfo.title} />} fileName={`signature_report_${selectedInfo.title}_${converter.getCurrentDate()}`}>
                                    <Button variant='contained' size='large' sx={{ marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' }, height: '35px' }}>署名履歴ダウンロード</Button>
                                </PDFDownloadLink>
                                <Button variant="contained" color="primary" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' }, height: '35px' }} onClick={handlePdfPreviewDialogClose}>プレビュー終了</Button>
                            </Box>
                        </Box>
                    </Modal>
                </div>
                {/* 差戻し依頼ダイアログ */}
                < div >
                    <Modal open={remandDialogOpen} >
                        <Box sx={{ ...remandRequestDialogStyle }}>
                            <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '30px' }}>
                                本契約書を破棄します。必要項目を入力の上、処理を行ってください。
                            </Typography>
                            <Box sx={{ height: '82%', overflowY: 'auto', marginBottom: '20px' }}>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', width: '30%', fontSize: '1.2em', border: '1px solid lightgray' }}>
                                        破棄方法（※必須）
                                    </Typography>
                                    <Box bgcolor='white' sx={{ border: '1px solid lightgray', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '2%', paddingRight: '2%', marginRight: '5px' }}>
                                        <Box sx={{ display: 'flex', width: '50%', marginRight: '10px', marginBottom: '30px' }}>
                                            <CustomPulldownMenu
                                                label="破棄方法"
                                                value={selectedValue}
                                                onChange={handleSelectChange}
                                                items={deleteReason}
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
                                                                label="破棄理由"
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
                                        破棄要求送信先
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
                                <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleSubmit(onRemand)} disabled={!textFieldValue.trim()}>破棄する</Button>
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
                        <Box sx={{ ...deleteModalStyle }} >
                            <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '40px' }}>
                                契約書破棄の確認
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                                <WarningIcon sx={{ color: 'darkorange', fontSize: '4em', textAlign: 'center' }} />
                                <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                    文面１：契約書を破棄するには双方の合意が必要です。実行してよろしいですか？
                                </Typography>
                                <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                    文面２：契約書を破棄します。実行してよろしいですか？（契約違反などに伴う解除など）
                                </Typography>
                                <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                    削除コメントを記載する欄を設ける（※削除理由は必須）
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <EdocButton text='実行する' variant='contained' color='error' type='submit' disabled={false} handleClick={onDelete} />
                                <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleDeleteDialogClose} />
                            </Box>
                        </Box>
                    </Modal>
                </div>
                {/* 締結済み契約書情報を利用して新しい契約書を作成するダイアログ */}
                < div >
                    <Modal
                        open={registerNewAgreementUseExistDataDialogOpen}
                        onClose={handleCloseRegisterNewAgreementUseExistDataDialog}
                    >
                        <Box sx={{ width: '80vw', maxWidth: 900, margin: '5vh auto', bgcolor: 'white', borderRadius: 2, boxShadow: 24, p: 2 }}>
                            <RegisterNewAgreementUseExistDataDialog
                                open={registerNewAgreementUseExistDataDialogOpen}
                                handleClose={handleCloseRegisterNewAgreementUseExistDataDialog}
                                selectedInfo={selectedInfo}
                                internalAuthorizer={approveFlowData.internal_authorizer}
                                customerAuthorizer={approveFlowData.customer_authorizer}
                                approveFlowData={approveFlowData}
                            // 必要に応じて他のpropsも渡す
                            />
                        </Box>
                    </Modal>
                </div>
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}

export default ConcludeDocumentPage;