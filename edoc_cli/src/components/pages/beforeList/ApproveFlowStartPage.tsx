import { Box, Button, CircularProgress, Modal, Tabs, Tab, TextField } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { approveStartDialogStyle, basePageStyle, deleteModalStyle, restoreDialogStyle, processingDialogStyle } from '../../../styles/styles';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import api from "../../../utils/apiAccessor";
import { apiExecutor } from "../../../utils/apiExecutor";
import apiStatus from "../../../utils/apiStatus";
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import ErrorDialog from '../common/ErrorDialog';
import PreviewApproveFlowW, { PreviewApproveFlowWithTab, PreviewBeforeStartApproveFlowNotifierWithTab } from '../common/PreviewApproveFlow';
import PreviewApproveFlowBasicInfo from './PreviewApproveFlowBasicInfo';
import { getUserData, getUserDataForDebug } from '../../../auth/login';
import WarningIcon from '@mui/icons-material/Warning';

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

// 書類情報一覧の表の列名を示すインタフェース
interface ApproveFlowListColumns {
    // 役割
    role: string,
    // 会社名
    company_name: string,
    // ユーザー名
    user_name: string,
    // メールアドレス
    email: string,
    // 役職
    position: string,
};

/**
 * 
 * 登録した契約書の承認フローを開始する画面
 * 
 */
const ApproveFlowStartPage = () => {
    const navigate = useNavigate();

    // 一覧画面で選択した契約書の情報を取得する
    const location = useLocation();
    const selectedInfo = location.state;

    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);

    // 社内承認フロー
    const [internalApproveFlow, setInternalApproveFlow] = useState<ApproveFlowListColumns[]>([]);
    // 相手方承認フロー
    const [customerApproveFlow, setCustomerApproveFlow] = useState<ApproveFlowListColumns[]>([]);

    // 社内関係者
    const [internalNotifier, setInternalNotifier] = useState<NotifierListColumns[]>([]);
    // 相手方関係者フロー
    const [customerNotifier, setCustomerNotifier] = useState<NotifierListColumns[]>([]);

    // 署名用URL有効期限
    const [submissionPeriod, setSubmissionPeriod] = useState(0);

    // 操作権限があるユーザーかチェックする
    // TODO：結合テスト開始時点では制御しない
    const [isAuthority, setIsAuthority] = useState(false);
    // ユーザー権限（自社担当者）
    const [isInternalPicUser, setIsInternalPicUser] = useState(false);

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
     * API実行エラー時の処理
     * 
     */
    // エラーダイアログの開閉状態
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteApiErrorDialogDialog = () => {
        setExecuteFailedApiDialogOpen(true);
    };

    useEffect(() => {

        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        // ローディングフラグをオンにする
        setIsLoading(true);

        const fetchData = async () => {
            try {
                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id),
                ];

                // APIを並列実行
                const responses = await Promise.all(requests);

                // ステータスコードが200以外の場合の処理
                const errorResponse = responses.find((res: Response) => res.status !== 200);
                if (errorResponse) {
                    setErrorCode(errorResponse.status);
                    setErrorProcess('承認フロー開始前　契約書取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const [approvals] = await Promise.all(responses.map((res: Response) => res.json()));

                // 署名用URL有効期限を設定する
                setSubmissionPeriod(approvals.submission_period);

                // 承認フロー情報を整理する（承認者）
                let internalApproveFlowTmp: ApproveFlowListColumns[] = [];
                let customerApproveFlowTmp: ApproveFlowListColumns[] = [];

                // 関係者情報を整理する
                let internalNotifierTmp: NotifierListColumns[] = [];
                let customerNotifierTmp: NotifierListColumns[] = [];

                // 優先順を定義（internal_pic、internal_approver、internal_authorizer の順）
                const internalPriorityOrder = ['internal_approver', 'internal_authorizer'];
                const customerPriorityOrder = ['customer_approver', 'customer_authorizer'];

                for (let flowData in approvals) {
                    if (apiStatus.userRole.hasOwnProperty(flowData)) {
                        let role = apiStatus.userRole[flowData as keyof typeof apiStatus.userRole];

                        if (flowData === 'internal_pic' || flowData === 'customer_pic') {
                            continue;
                        };

                        if ((flowData === 'internal_notifier' || flowData === 'customer_notifier') && Array.isArray(approvals[flowData])) {
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
                            continue;
                        };

                        if ((flowData === 'internal_approver' || flowData === 'customer_approver') && Array.isArray(approvals[flowData])) {
                            // internal_approverまたはcustomer_approverが配列の場合
                            const approvers = approvals[flowData] as Array<any>;
                            if (approvers.length === 0) {
                                // 配列が空の場合は処理をスキップ
                                continue;
                            }

                            // 配列内の各要素に対して処理を行う
                            approvers.forEach(approver => {
                                let item: ApproveFlowListColumns = {
                                    role: role,
                                    company_name: approver.company_name,
                                    user_name: approver.user_name,
                                    email: approver.email,
                                    position: approver.position,
                                };
                                if (flowData.startsWith('internal')) {
                                    internalApproveFlowTmp.push(item);
                                } else {
                                    customerApproveFlowTmp.push(item);
                                }
                            });
                        } else {
                            // internal_approver、customer_approver以外の場合
                            let item: ApproveFlowListColumns = {
                                role: role,
                                company_name: approvals[flowData].company_name,
                                user_name: approvals[flowData].user_name,
                                email: approvals[flowData].email,
                                position: approvals[flowData].position,
                            };

                            if (flowData.startsWith('internal')) {
                                internalApproveFlowTmp.push(item);
                            } else {
                                customerApproveFlowTmp.push(item);
                            }
                        }
                    }
                }

                // internalApproveFlowTmp を優先順で並び替え
                internalApproveFlowTmp = internalPriorityOrder.flatMap(key => {
                    return internalApproveFlowTmp.filter(item => apiStatus.userRole[key as keyof typeof apiStatus.userRole] === item.role);
                });

                // customerApproveFlowTmp を優先順で並び替え
                customerApproveFlowTmp = customerPriorityOrder.flatMap(key => {
                    return customerApproveFlowTmp.filter(item => apiStatus.userRole[key as keyof typeof apiStatus.userRole] === item.role);
                });

                // 承認フローを設定
                setInternalApproveFlow(internalApproveFlowTmp);
                setCustomerApproveFlow(customerApproveFlowTmp);

                // 関係者を設定
                setInternalNotifier(internalNotifierTmp);
                setCustomerNotifier(customerNotifierTmp);

                // ログインユーザーの情報を取得する
                const loginUser = getUserData();
                // const loginUser = getUserDataForDebug(selectedInfo.agreement_id);

                // 操作権限を確認する
                if (approvals.internal_pic.email === loginUser) {
                    setIsInternalPicUser(true);
                }
            } catch (error) {
                console.error('Error fetching data:', error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('承認フロー開始前　契約書取得処理');
                setExecuteFailedApiDialogOpen(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    /***
     * 
     * 承認フロー開始要求
     * 
     */
    // ダイアログの開閉状態
    const [approveFlowStartDialogOpen, setApproveFlowStartDialogOpen] = useState(false);
    const handleApproveFlowStartDialogClose = () => setApproveFlowStartDialogOpen(false);

    // ダイアログを開く関数
    const approveFlowStartDialog = () => {
        setApproveFlowStartDialogOpen(true);
    };

    // 承認フロー開始処理
    const onStartApproveFlow = async () => {
        openExecuteApiDialogDialog();

        // 承認依頼先として、承認フローの最初のユーザーを設定する
        const approvalRequestAddress = internalApproveFlow[0];

        const onSuccess = (json: any) => {
            const started_time = json.started_time;

            navigate('/documentManagement/registerList/approveFlowStart', {
                state: {
                    selectedInfo,
                    approvalRequestAddress,
                    started_time
                }
            });
        };

        const onError = (errorCode: any) => {
            setApproveFlowStartDialogOpen(false);
            setErrorCode(errorCode);
            setErrorProcess('自社承認フロー開始');
            openExecuteApiErrorDialogDialog();
        };

        await apiExecutor.executeApiRequest(
            () => api.postStartApprovalFlow(selectedInfo.agreement_id),
            onSuccess,
            onError
        );

        setExecuteApiDialogOpen(false);
    };

    /***
     * 
     * 登録情報修正要求
     * 
     */
    // 登録情報修正確認ダイアログの開閉状態
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const handleUpdateDialogClose = () => setUpdateDialogOpen(false);

    // ダイアログを開く関数
    const openUpdateDialog = () => {
        setUpdateDialogOpen(true);
    };

    // 登録情報修正処理
    const restoreDocument = async () => {
        navigate('/documentManagement/modifyDocument', { state: { selectedInfo, internalApproveFlow, customerApproveFlow, submissionPeriod, internalNotifier, customerNotifier } });
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

    // 契約書の削除処理
    const onDelete = async () => {
        openExecuteApiDialogDialog();

        const onSuccess = (deleteResponse: any) => {
            navigate('/documentManagement/registerList/deleteComplete', { state: { selectedInfo, deleteResponse } });
        };

        const onError = (errorCode: any) => {
            setDeleteDialogOpen(false);
            setErrorCode(errorCode);
            setErrorProcess('契約書の削除');
            openExecuteApiErrorDialogDialog();
        };

        await apiExecutor.executeApiRequest(
            () => api.deleteAgreement(selectedInfo.agreement_id),
            onSuccess,
            onError
        );

        setExecuteApiDialogOpen(false);
    };

    // タブ切り替え用のstateを追加
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box sx={{ bgcolor: isInternalPicUser ? '#eeeeff' : 'grey.200', height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px', display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
                    <CssBaseline />
                    <Header />
                    <Box sx={{ flexGrow: 1, paddingLeft: '10%', paddingRight: '10%', paddingBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            承認フローを開始する場合は「承認フロー開始」、設定情報の更新は「登録情報修正」を選択してください
                        </Typography>
                        <Box>
                            <PreviewApproveFlowBasicInfo agreementData={selectedInfo} submissionPeriod={submissionPeriod} />
                            <Box sx={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '5px', marginLeft: '5px', marginBottom: '10px', alignItems: 'center', padding: '20px' }}>
                                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>本契約の関係者</Typography>
                                </Box>
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'end', marginBottom: '5px' }}>
                                    <Tabs value={tabValue} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
                                        <Tab label="承認フロー" sx={{ fontWeight: 'bold', fontSize: '20px' }} />
                                        <Tab label="完了通知の送付先" sx={{ fontWeight: 'bold', fontSize: '20px' }} />
                                    </Tabs>
                                </Box>
                                {tabValue === 0 && (
                                    <PreviewApproveFlowWithTab internalApproveFlow={internalApproveFlow} customerApproveFlow={customerApproveFlow} />
                                )}
                                {tabValue === 1 && (
                                    <PreviewBeforeStartApproveFlowNotifierWithTab internalNotifier={internalNotifier} customerNotifier={customerNotifier} />
                                )}
                            </Box>
                            {/* 「担当者」に設定されていないユーザーの場合はボタンをグレーアウトにする */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginRight: '5px', marginLeft: '5px', marginTop: '5px', alignItems: 'center' }}>
                                {isInternalPicUser && (
                                    <>
                                        <Button variant="contained" onClick={approveFlowStartDialog} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>承認フロー開始</Button>
                                        <Button variant="contained" onClick={openUpdateDialog} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>登録情報修正</Button>
                                        <Button variant="contained" onClick={openDeleteDialog} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>破棄</Button>
                                    </>
                                )}
                                <Button variant="contained" onClick={() => navigate('/documentManagement/registerList')} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
                {/* 承認フロー開始確認ダイアログ */}
                <div>
                    <Modal
                        open={approveFlowStartDialogOpen}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={approveStartDialogStyle} >
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                承認フローを開始します。よろしいですか？
                            </Typography>
                            <Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', width: '30%', border: '1px solid lightgray', fontSize: '20px' }}>
                                        承認依頼送信先
                                    </Typography>
                                    <Box bgcolor='white' sx={{ border: '1px solid lightgray', padding: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={internalApproveFlow[0]?.company_name}
                                                label="会社名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={internalApproveFlow[0]?.user_name}
                                                label="ユーザー名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                            <TextField
                                                value={internalApproveFlow[0]?.email}
                                                label="メールアドレス"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color='error' onClick={(onStartApproveFlow)} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkred' } }}>開始する</Button>
                                <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleApproveFlowStartDialogClose} />
                            </Box>
                        </Box>
                    </Modal>
                </div>
                {/* 登録情報修正確認ダイアログ */}
                <div>
                    <Modal open={updateDialogOpen} >
                        <Box sx={{ ...restoreDialogStyle, display: 'flex', flexDirection: 'column', bgcolor: 'grey.200', border: '2px solid #000', boxShadow: 24, fontWeight: 'bold' }}>
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                以下の注意事項を確認し、問題がなければ「修正する」を選択してください
                            </Typography>
                            <Box sx={{ color: 'darkred', bgcolor: 'white', fontSize: '1.2em', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '2%', paddingRight: '2%x', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                <WarningIcon sx={{ color: 'darkorange', fontSize: '4em', textAlign: 'center', marginRight: '20px' }} />
                                <Box>
                                    本機能から契約書の差替えは出来ません。<br />
                                    契約書を差替える場合は、「破棄」してから再度アップロードし直してください。<br />
                                </Box>
                            </Box>
                            {/* <Box sx={{ fontSize: '1.2em', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', marginBottom: '10px' }}>
                                上記の内容に同意し、契約書情報の修正を行います。よろしいですか？<br />
                            </Box> */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
                                <Button variant="contained" color='error' onClick={(restoreDocument)} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkred' } }}>修正する</Button>
                                <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleUpdateDialogClose} />
                            </Box>
                        </Box>
                    </Modal>
                </div>
                {/* 破棄確認ダイアログ */}
                <div>
                    <Modal open={deleteDialogOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                        <Box sx={{ ...deleteModalStyle, display: 'flex', flexDirection: 'column', bgcolor: 'grey.200', border: '2px solid #000', boxShadow: 24, fontWeight: 'bold' }}>
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                以下の注意事項を確認し、問題がなければ「破棄する」を選択してください
                            </Typography>
                            <Box sx={{ bgcolor: 'white', fontSize: '1.2em', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', marginBottom: '10px', display: 'flex' }}>
                                <WarningIcon sx={{ color: 'darkorange', fontSize: '4em', textAlign: 'center', marginRight: '20px' }} />
                                <Box>
                                    破棄したファイルは復元する事が出来ません。<br />
                                    同じファイルをアップロードする場合は、改めて「契約書登録」からアップロードしてください。<br />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color='error' onClick={(onDelete)} sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkred' } }}>破棄する</Button>
                                <EdocButton text='キャンセル' variant='contained' color='primary' handleClick={handleDeleteDialogClose} />
                            </Box>
                        </Box>
                    </Modal>
                </div>
                {/* API処理実行中ダイアログ */}
                <div>
                    <Modal open={executeApiDialog} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                        <Box sx={processingDialogStyle} >
                            <Typography sx={{ backgroundColor: 'darkblue', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                リクエストの処理中
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                        処理が終わるまでしばらくお待ちください。
                                    </Typography>
                                    <CircularProgress />
                                </Box>
                            </Box>
                            {/* <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1em' }}>
                                処理が終わるまでしばらくお待ちください。
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box> */}
                        </Box>
                    </Modal>
                </div>
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
};

export default ApproveFlowStartPage;