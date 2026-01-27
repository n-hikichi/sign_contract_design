/**
 * ModernApproveFlowStartPage - 承認フロー開始画面（Modern UI版）
 *
 * 登録した契約書の承認フローを開始する画面
 */
import { Box, Button, CircularProgress, Modal, Tabs, Tab, TextField } from "@mui/material";
import Typography from '@mui/material/Typography';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import {
    approveStartDialogStyle,
    deleteModalStyle,
    restoreDialogStyle,
    processingDialogStyle
} from '../../../styles/styles';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import api from "../../../utils/apiAccessor";
import { apiExecutor } from "../../../utils/apiExecutor";
import apiStatus from "../../../utils/apiStatus";
import EdocButton from "../../elements/EdocButton";
import ModernPageLayout, { ContentCard, PageTitleBanner } from '../../templates/ModernPageLayout';
import ErrorDialog from '../common/ErrorDialog';
import {
    PreviewApproveFlowWithTab,
    PreviewBeforeStartApproveFlowNotifierWithTab
} from '../common/PreviewApproveFlow';
import PreviewApproveFlowBasicInfo from './PreviewApproveFlowBasicInfo';
import { getUserData } from '../../../auth/login';
import WarningIcon from '@mui/icons-material/Warning';

interface NotifierListColumns {
    company_name: string;
    user_name: string;
    email: string;
    position: string;
}

interface ApproveFlowListColumns {
    role: string;
    company_name: string;
    user_name: string;
    email: string;
    position: string;
}

const ModernApproveFlowStartPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedInfo = location.state;

    const [isLoading, setIsLoading] = useState(true);
    const [internalApproveFlow, setInternalApproveFlow] = useState<ApproveFlowListColumns[]>([]);
    const [customerApproveFlow, setCustomerApproveFlow] = useState<ApproveFlowListColumns[]>([]);
    const [internalNotifier, setInternalNotifier] = useState<NotifierListColumns[]>([]);
    const [customerNotifier, setCustomerNotifier] = useState<NotifierListColumns[]>([]);
    const [submissionPeriod, setSubmissionPeriod] = useState(0);
    const [isInternalPicUser, setIsInternalPicUser] = useState(false);

    // API処理中ダイアログ
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);
    const openExecuteApiDialogDialog = () => setExecuteApiDialogOpen(true);

    // API実行エラー時の処理
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);
    const openExecuteApiErrorDialogDialog = () => setExecuteFailedApiDialogOpen(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsLoading(true);

        const fetchData = async () => {
            try {
                const requests = [
                    apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id),
                ];
                const responses = await Promise.all(requests);

                const errorResponse = responses.find((res: Response) => res.status !== 200);
                if (errorResponse) {
                    setErrorCode(errorResponse.status);
                    setErrorProcess('承認フロー開始前　契約書取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                const [approvals] = await Promise.all(responses.map((res: Response) => res.json()));
                setSubmissionPeriod(approvals.submission_period);

                let internalApproveFlowTmp: ApproveFlowListColumns[] = [];
                let customerApproveFlowTmp: ApproveFlowListColumns[] = [];
                let internalNotifierTmp: NotifierListColumns[] = [];
                let customerNotifierTmp: NotifierListColumns[] = [];

                const internalPriorityOrder = ['internal_approver', 'internal_authorizer'];
                const customerPriorityOrder = ['customer_approver', 'customer_authorizer'];

                for (let flowData in approvals) {
                    if (apiStatus.userRole.hasOwnProperty(flowData)) {
                        let role = apiStatus.userRole[flowData as keyof typeof apiStatus.userRole];

                        if (flowData === 'internal_pic' || flowData === 'customer_pic') {
                            continue;
                        }

                        if ((flowData === 'internal_notifier' || flowData === 'customer_notifier') &&
                            Array.isArray(approvals[flowData])) {
                            const approvers = approvals[flowData] as Array<any>;
                            if (approvers.length === 0) continue;

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
                        }

                        if ((flowData === 'internal_approver' || flowData === 'customer_approver') &&
                            Array.isArray(approvals[flowData])) {
                            const approvers = approvals[flowData] as Array<any>;
                            if (approvers.length === 0) continue;

                            // eslint-disable-next-line no-loop-func
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

                internalApproveFlowTmp = internalPriorityOrder.flatMap(key => {
                    return internalApproveFlowTmp.filter(
                        item => apiStatus.userRole[key as keyof typeof apiStatus.userRole] === item.role
                    );
                });

                customerApproveFlowTmp = customerPriorityOrder.flatMap(key => {
                    return customerApproveFlowTmp.filter(
                        item => apiStatus.userRole[key as keyof typeof apiStatus.userRole] === item.role
                    );
                });

                setInternalApproveFlow(internalApproveFlowTmp);
                setCustomerApproveFlow(customerApproveFlowTmp);
                setInternalNotifier(internalNotifierTmp);
                setCustomerNotifier(customerNotifierTmp);

                const loginUser = getUserData();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 承認フロー開始要求
    const [approveFlowStartDialogOpen, setApproveFlowStartDialogOpen] = useState(false);
    const handleApproveFlowStartDialogClose = () => setApproveFlowStartDialogOpen(false);
    const approveFlowStartDialog = () => setApproveFlowStartDialogOpen(true);

    const onStartApproveFlow = async () => {
        openExecuteApiDialogDialog();
        const approvalRequestAddress = internalApproveFlow[0];

        const onSuccess = (json: any) => {
            const started_time = json.started_time;
            navigate('/documentManagement/registerList/approveFlowStart', {
                state: { selectedInfo, approvalRequestAddress, started_time }
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

    // 登録情報修正要求
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const handleUpdateDialogClose = () => setUpdateDialogOpen(false);
    const openUpdateDialog = () => setUpdateDialogOpen(true);

    const restoreDocument = async () => {
        navigate('/documentManagement/modifyDocument', {
            state: {
                selectedInfo,
                internalApproveFlow,
                customerApproveFlow,
                submissionPeriod,
                internalNotifier,
                customerNotifier
            }
        });
    };

    // 契約書破棄要求
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const handleDeleteDialogClose = () => setDeleteDialogOpen(false);
    const openDeleteDialog = () => setDeleteDialogOpen(true);

    const onDelete = async () => {
        openExecuteApiDialogDialog();

        const onSuccess = (deleteResponse: any) => {
            navigate('/documentManagement/registerList/deleteComplete', {
                state: { selectedInfo, deleteResponse }
            });
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

    // タブ切り替え
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <ModernPageLayout
            title="承認フロー開始"
            loading={isLoading}
            breadcrumbs={[
                { label: '承認フロー開始前', path: '/documentManagement/registerList' },
                { label: '詳細' }
            ]}
        >
            <PageTitleBanner>
                承認フローを開始する場合は「承認フロー開始」、設定情報の更新は「登録情報修正」を選択してください
            </PageTitleBanner>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 基本情報 */}
                <PreviewApproveFlowBasicInfo
                    agreementData={selectedInfo}
                    submissionPeriod={submissionPeriod}
                />

                {/* 関係者情報 */}
                <ContentCard title="本契約の関係者">
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mb: 2
                        }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                sx={{
                                    '& .MuiTab-root': {
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }
                                }}
                            >
                                <Tab label="承認フロー" />
                                <Tab label="完了通知の送付先" />
                            </Tabs>
                        </Box>
                        {tabValue === 0 && (
                            <PreviewApproveFlowWithTab
                                internalApproveFlow={internalApproveFlow}
                                customerApproveFlow={customerApproveFlow}
                            />
                        )}
                        {tabValue === 1 && (
                            <PreviewBeforeStartApproveFlowNotifierWithTab
                                internalNotifier={internalNotifier}
                                customerNotifier={customerNotifier}
                            />
                        )}
                    </Box>
                </ContentCard>

                {/* アクションボタン */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    {isInternalPicUser && (
                        <>
                            <Button
                                variant="contained"
                                onClick={approveFlowStartDialog}
                                sx={{ minWidth: '10em' }}
                            >
                                承認フロー開始
                            </Button>
                            <Button
                                variant="contained"
                                onClick={openUpdateDialog}
                                sx={{ minWidth: '10em' }}
                            >
                                登録情報修正
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={openDeleteDialog}
                                sx={{ minWidth: '10em' }}
                            >
                                破棄
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/documentManagement/registerList')}
                        sx={{ minWidth: '10em' }}
                    >
                        キャンセル
                    </Button>
                </Box>
            </Box>

            {/* 承認フロー開始確認ダイアログ */}
            <Modal
                open={approveFlowStartDialogOpen}
                aria-labelledby="approve-flow-start-modal"
            >
                <Box sx={approveStartDialogStyle}>
                    <Typography sx={{
                        backgroundColor: '#0D47A1',
                        padding: '8px',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '1.5em',
                        marginBottom: '20px'
                    }}>
                        承認フローを開始します。よろしいですか？
                    </Typography>
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{
                            backgroundColor: 'lightblue',
                            padding: '8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            width: '30%',
                            border: '1px solid lightgray',
                            fontSize: '20px'
                        }}>
                            承認依頼送信先
                        </Typography>
                        <Box bgcolor='white' sx={{ border: '1px solid lightgray', padding: '20px' }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                '& .Mui-disabled': { color: 'black' },
                                marginBottom: '20px'
                            }}>
                                <TextField
                                    value={internalApproveFlow[0]?.company_name}
                                    label="会社名"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                '& .Mui-disabled': { color: 'black' },
                                marginBottom: '20px'
                            }}>
                                <TextField
                                    value={internalApproveFlow[0]?.user_name}
                                    label="ユーザー名"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                '& .Mui-disabled': { color: 'black' }
                            }}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color='error'
                            onClick={onStartApproveFlow}
                            sx={{ margin: '5px', width: '10em' }}
                        >
                            開始する
                        </Button>
                        <EdocButton
                            text='キャンセル'
                            variant='contained'
                            color='primary'
                            handleClick={handleApproveFlowStartDialogClose}
                        />
                    </Box>
                </Box>
            </Modal>

            {/* 登録情報修正確認ダイアログ */}
            <Modal open={updateDialogOpen}>
                <Box sx={{
                    ...restoreDialogStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'grey.200',
                    border: '2px solid #000',
                    boxShadow: 24,
                    fontWeight: 'bold'
                }}>
                    <Typography sx={{
                        backgroundColor: '#0D47A1',
                        padding: '8px',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '1.5em',
                        marginBottom: '20px'
                    }}>
                        以下の注意事項を確認し、問題がなければ「修正する」を選択してください
                    </Typography>
                    <Box sx={{
                        color: 'darkred',
                        bgcolor: 'white',
                        fontSize: '1.2em',
                        paddingTop: '40px',
                        paddingBottom: '40px',
                        paddingLeft: '2%',
                        paddingRight: '2%',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <WarningIcon sx={{
                            color: 'darkorange',
                            fontSize: '4em',
                            textAlign: 'center',
                            marginRight: '20px'
                        }} />
                        <Box>
                            本機能から契約書の差替えは出来ません。<br />
                            契約書を差替える場合は、「破棄」してから再度アップロードし直してください。
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
                        <Button
                            variant="contained"
                            color='error'
                            onClick={restoreDocument}
                            sx={{ margin: '5px', width: '10em' }}
                        >
                            修正する
                        </Button>
                        <EdocButton
                            text='キャンセル'
                            variant='contained'
                            color='primary'
                            handleClick={handleUpdateDialogClose}
                        />
                    </Box>
                </Box>
            </Modal>

            {/* 破棄確認ダイアログ */}
            <Modal open={deleteDialogOpen}>
                <Box sx={{
                    ...deleteModalStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'grey.200',
                    border: '2px solid #000',
                    boxShadow: 24,
                    fontWeight: 'bold'
                }}>
                    <Typography sx={{
                        backgroundColor: '#0D47A1',
                        padding: '8px',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '1.5em',
                        marginBottom: '20px'
                    }}>
                        以下の注意事項を確認し、問題がなければ「破棄する」を選択してください
                    </Typography>
                    <Box sx={{
                        bgcolor: 'white',
                        fontSize: '1.2em',
                        paddingTop: '40px',
                        paddingBottom: '40px',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        marginBottom: '10px',
                        display: 'flex'
                    }}>
                        <WarningIcon sx={{
                            color: 'darkorange',
                            fontSize: '4em',
                            textAlign: 'center',
                            marginRight: '20px'
                        }} />
                        <Box>
                            破棄したファイルは復元する事が出来ません。<br />
                            同じファイルをアップロードする場合は、改めて「契約書登録」から
                            アップロードしてください。
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color='error'
                            onClick={onDelete}
                            sx={{ margin: '5px', width: '10em' }}
                        >
                            破棄する
                        </Button>
                        <EdocButton
                            text='キャンセル'
                            variant='contained'
                            color='primary'
                            handleClick={handleDeleteDialogClose}
                        />
                    </Box>
                </Box>
            </Modal>

            {/* API処理実行中ダイアログ */}
            <Modal open={executeApiDialog}>
                <Box sx={processingDialogStyle}>
                    <Typography sx={{
                        backgroundColor: 'darkblue',
                        padding: '8px',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '1.5em',
                        marginBottom: '20px'
                    }}>
                        リクエストの処理中
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        backgroundColor: 'white',
                        paddingTop: '40px',
                        paddingBottom: '40px'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%'
                        }}>
                            <Typography sx={{
                                padding: '8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginTop: '10px',
                                marginBottom: '10px',
                                fontSize: '1.5em'
                            }}>
                                処理が終わるまでしばらくお待ちください。
                            </Typography>
                            <CircularProgress />
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <ErrorDialog
                open={executeFailedApiDialog}
                handleClose={handleExecuteFailedApiDialogClose}
                errorCode={errorCode}
                errorProcess={errorProcess}
            />
        </ModernPageLayout>
    );
};

export default ModernApproveFlowStartPage;
