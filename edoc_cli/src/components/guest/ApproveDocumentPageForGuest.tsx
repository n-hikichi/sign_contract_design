import { Box, Button, CircularProgress, DialogTitle, Grid, Modal, SelectChangeEvent, TextField, Tooltip, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/apiAccessor';
import apiExecutor from "../../utils/apiExecutor";
import ApiProcessingDialog from "./common/ApiProcessingDialog";
import ErrorDialog, { ErrorDialogForLogout } from './common/ErrorDialog';
import EdocButton from '../elements/EdocButton';
import NowLoading from '../templates/NowLoading';
import Footer from './common/Footer';
import Header from './common/Header';
import { baseContentsStyle, remandRequestDialogStyle, deleteModalStyle, pdfPreviewDialogStyle, readOnlyTextFieldStyle } from './common/Styles';
import SignatureApproveList from './SignatureApproveListForGuest';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Controller, useForm } from "react-hook-form";
import CustomPulldownMenu, { remandReason } from '../../components/elements/CustomPulldownMenu';
import WarningIcon from '@mui/icons-material/Warning';
import { Document, Page, pdfjs } from "react-pdf";

interface Approver {
    approver_id: string;
    user_name: string;
    company_name: string;
    position: string;
    email: string;
    approved: boolean;
    approved_time: string;
}

const approver = {
    approver_id: "",
    user_name: "",
    company_name: "",
    position: "",
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

const ApproveDocumentPageForGuest = () => {
    const navigate = useNavigate();

    // 社内承認中リスト画面で選択した契約書の情報を取得する
    const location = useLocation();

    let agreementId = 'acde070d-8c4c-4f0d-9d8a-162843c10333';
    if (location.state) {
        agreementId = location.state.agreementId;
    }

    // 契約書idに対する契約書情報
    const [agreementData, setAgreementData] = useState<AgreementData>(initialAgreementData);
    // 契約書idに対する承認フロー
    const [approveFlowData, setApproveFlowData] = useState<AgreementFlow>(initialAgreementFlow);
    // 現在の承認者情報
    const [presentApprover, setPresentApprover] = useState<Approver>(approver);
    // data url形式のbase64にエンコードされたpdfファイル
    const [pdf_base64, setPdf_base64] = useState('');
    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);
    // pdf読み込み中を表すフラグ
    const [pdfIsLoading, setPdfIsLoading] = useState(true);
    // 検証結果を保持
    const [isInValidLogin, setIsInValidLogin] = useState(false);
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

    /***
     * 
     * API実行失敗ダイアログ（認証エラー）
     * 
     */
    const [authErrorCode, setAuthErrorCode] = useState(0);
    const [authErrorProcess, setAuthErrorProcess] = useState('');
    const [executeFailedAuthErrorDialog, setExecuteFailedAuthErrorDialogOpen] = useState(false);
    const handleExecuteFailedAuthErrorDialogClose = () => setExecuteFailedAuthErrorDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteAuthErrorDialogDialog = () => {
        setExecuteFailedAuthErrorDialogOpen(true);
    };

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

    // 初回レンダー時の処理
    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        // アクセストークンがなければエラー扱い
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setErrorCode(401);
            setErrorProcess('認証エラー');
            setExecuteFailedAuthErrorDialogOpen(true);
            setApproveDialogOpen(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const fetchData = async () => {
            try {
                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetAgreementForGuest(agreementId),
                    apiExecutor.fetchGetAgreementApprovalsForGuest(agreementId),
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
                const [agreementData, approveFlow, fileData,] = await Promise.all(responses.map((res: Response) => res.json()));

                // 契約書情報を登録する
                setAgreementData(agreementData);

                // 承認フローを登録する
                setApproveFlowData(approveFlow);

                // 現在の承認者情報を登録する
                const presentApproverId = approveFlow.present_approver;
                const presentApprover = Object.values(approveFlow).flat().find((approver: any) => approver.approver_id === presentApproverId) as Approver;
                setPresentApprover(presentApprover);

                // PDFファイルを登録する
                setPdf_base64("data:application/pdf;base64," + fileData.file);
                setPdfIsLoading(false);

            } catch (error) {
                setIsInValidLogin(true);
                setLoadingPageFailedDialogOpen(true);
            } finally {
                setIsLoading(false);
                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('契約書情報取得処理');
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

    /**
     * PDFファイルプレビュー処理
     * 
     */
    // PDFファイルプレビューダイアログの開閉状態
    const handlePdfPreviewDialogClose = () => {
        if (!isAgreementDetailChecked) {
            setIsPdfViewedEnough(false);
        };
        setPdfPreviewDialogOpen(false);
    };

    /**
     * 承認処理
     * 
     */
    // 承認ダイアログの開閉状態
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const handleApproveDialogClose = () => setApproveDialogOpen(false);

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

    // 承認ダイアログで承認ボタン押下時の処理
    const onApprove: () => void = () => {
        setApproveDialogOpen(true);
    };

    // 承認ダイアログで承認ボタン押下時の処理
    const approvalConfirmed = async () => {

        setExecuteApiDialogOpen(true);
        try {
            const response = await api.postAgreementApprovalsForGuest(agreementData.agreement_id);
            if (response.status !== api.HTTP_OK) {
                setErrorCode(response.status);
                setErrorProcess('契約書承認処理');
                setExecuteFailedApiDialogOpen(true);
                setApproveDialogOpen(false);
                return;
            }
            const started_time = await response.json();
            const approvedTime = started_time.approved_time;
            navigate('/guest/agreement/approveCompletePage', {
                state: {
                    agreementData,
                    presentApprover,
                    approvedTime
                }
            });
            // navigate('/develop/approveCompletePageForGuest', {
            //     state: {
            //         agreementData,
            //         presentApprover,
            //         approvedTime
            //     }
            // });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('契約書承認処理');
            setExecuteFailedApiDialogOpen(true);
            setApproveDialogOpen(false);
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    /**
     * 承認ボタン
     * 
     */
    // チェックボックスの状態を管理する
    const [isChecked, setIsChecked] = useState(false);

    // 承認者情報に関する処理
    // チェックボックスの状態を更新する
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
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

            const res = await api.postAgreementRemandForGuest(agreementData.agreement_id, requestBody);

            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('契約書差戻し処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            };

            const internalPic = approveFlowData.internal_pic;

            // 取得したPDFファイルを画面に設定する
            const remandTime = await res.json();
            navigate('/guest/agreement/remandComplete', { state: { remandTime, data, internalPic } });
            // navigate('/develop/remandCompletePageForGuest', { state: { remandTime, data, internalPic } });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('契約書登録　情報取得処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
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
                    <Box sx={{ bgcolor: 'grey.200', height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px' }}>
                        <Header />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <CssBaseline />
                            <SignatureApproveList approveHistory={approveFlowData} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '5%', paddingRight: '5%', width: '100%' }} px={4}>
                                {agreementData.status === 'CUSTOMER_APPROVING' && (
                                    <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                        契約書の内容を確認し、問題がなければ承認してください
                                    </Typography>
                                )}
                                {agreementData.status === 'CUSTOMER_REMANDING' && (
                                    <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                        この契約書は差戻し要求が送信されました
                                    </Typography>
                                )}
                                <Box sx={{ marginBottom: '40px', width: '100%' }}>
                                    <Box sx={{ width: '100%', display: 'flex', border: '1px solid lightgray', alignItems: 'center', backgroundColor: 'white', padding: '10px' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', marginLeft: '5%', marginRight: '30px' }}>{agreementData.title}</Typography>
                                        {/* <Tooltip title="契約書を閲覧する">
                                            <Button
                                                sx={{ color: 'black', backgroundColor: '#eeeeff', '&:hover': { color: 'white', backgroundColor: 'darkblue' }, border: '1px solid lightgray' }}
                                                onClick={() => setPdfPreviewDialogOpen(true)}
                                            >
                                                <OpenInNewIcon />
                                            </Button>
                                        </Tooltip> */}
                                        <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={() => setPdfPreviewDialogOpen(true)} >契約書を閲覧する</Button>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', direction: 'ltr', paddingTop: '20px', marginLeft: '25px' }}>
                                    <Grid container spacing={3}>
                                        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginBottom: '20px', border: '1px solid lightgray', padding: '20px' }}>
                                            <Grid item md={12}>
                                                <Box sx={{ flexGrow: 0, width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                                                        承認者情報
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={presentApprover.company_name}
                                                        label="会社名"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={presentApprover.user_name}
                                                        id="title"
                                                        label="氏名"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={presentApprover.position}
                                                        id="title"
                                                        label="役職"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                                    <TextField
                                                        value={presentApprover.email}
                                                        id="title"
                                                        label="メールアドレス"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                {agreementData.status === 'CUSTOMER_APPROVING' && (
                                                    <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'start', marginRight: '5%', marginLeft: '5%', marginTop: '10px' }}>
                                                        {isAgreementDetailChecked ? (
                                                            <FormControlLabel
                                                                required
                                                                control={
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onChange={handleCheckboxChange}
                                                                        disabled={!isAgreementDetailChecked}
                                                                    />}
                                                                label={
                                                                    <Typography sx={{ display: 'inline-flex', alignItems: 'center', color: 'darkred', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                                        承認者情報が正しい事を確認しました。
                                                                    </Typography>
                                                                }
                                                            />
                                                        ) : (
                                                            <Typography sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'darkred', fontWeight: 'bold', fontSize: '1.2rem', width: '100%', textAlign: 'center' }}>
                                                                始めに「契約書を閲覧する」をクリックして、契約書の内容を確認してください。
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Grid>
                                        </Box>
                                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', height: 'auto' }}>
                                            {agreementData.status === 'CUSTOMER_APPROVING' && (
                                                <>
                                                    <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={onApprove} disabled={isChecked === false}>承認する</Button>
                                                    <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleRemandDialogOpen}>差戻し</Button>
                                                </>
                                            )}
                                            <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={closeApprovePage}>終了する</Button>
                                        </Box>
                                    </Grid>
                                </Box>
                                {/* 承認確認ダイアログ */}
                                <div>
                                    <Modal
                                        open={approveDialogOpen}
                                        aria-labelledby="modal-modal-title"
                                        aria-describedby="modal-modal-description"
                                    >
                                        <Box sx={{ ...deleteModalStyle, bgcolor: 'grey.200' }} >
                                            <Typography sx={{ backgroundColor: 'darkblue', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                                承認確認
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '4px' }}>
                                                <WarningIcon sx={{ color: 'darkorange', fontSize: '4em', textAlign: 'center' }} />
                                                <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.4rem', width: '100%' }}>
                                                    書類内容に同意して確認を完了します。よろしいですか？
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                                <Button variant="contained" color="error" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={approvalConfirmed} >実行する</Button>
                                                <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleApproveDialogClose} >キャンセル</Button>
                                            </Box>
                                        </Box>
                                    </Modal>
                                </div>
                                {/* ファイルプレビューダイアログ */}
                                <div>
                                    <Modal
                                        open={pdfPreviewDialogOpen}
                                        onClose={handlePdfPreviewDialogClose}
                                    >
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
                                    </Modal>
                                </div>
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
                            </Box>
                        </Box>
                    </Box>
                    <Footer />
                    <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                    <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
                    <ErrorDialogForLogout open={executeFailedAuthErrorDialog} handleClose={handleExecuteFailedAuthErrorDialogClose} errorCode={authErrorCode} errorProcess={authErrorProcess} />
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
    }
}

export default ApproveDocumentPageForGuest;