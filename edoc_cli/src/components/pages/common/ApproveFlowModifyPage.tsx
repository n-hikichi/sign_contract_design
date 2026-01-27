import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CssBaseline, FormControl, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Tab, Tabs, TextField, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle_Register } from '../../../styles/fontStyles';
import { baseTextFieldStyle } from '../../../styles/styles';
import api from '../../../utils/apiAccessor';
import apiExecutor from "../../../utils/apiExecutor";
import apiStatus from "../../../utils/apiStatus";
import validationRules from '../../../utils/validationRules';
import CustomPulldownMenu, { contractType, effectiveDate } from '../../elements/CustomPulldownMenu';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import PreviewApproveFlow, { PreviewApproveFlowNotifier } from '../common/PreviewApproveFlow';
import ErrorDialog from '../common/ErrorDialog';
import ApiProcessingDialog from "../common/ApiProcessingDialog";

const PIC = '担当者'
const AUTHORIZER = '代表者'

const getTableHeaderStyle = () => ({
    fontWeight: 'bold',
    fontSize: '20px',
    paddingTop: '10px',
    paddingBottom: '10px'
});

const getTableCellStyle = () => ({
    fontSize: '16px',
    paddingTop: '10px',
    paddingBottom: '10px',
});

interface CommonTextFieldProps {
    value: string;
    label: string;
}

const CommonTextField: React.FC<CommonTextFieldProps> = ({ value, label }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
            <TextField
                value={value}
                label={label}
                variant="standard"
                sx={readOnlyTextFieldStyle_Register}
                disabled={true}
                InputProps={{
                    disableUnderline: true,
                }}
            />
        </Box>
    );
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

type User = {
    user_id: string,
    position: string,
    user_name: string,
    company_name: string,
    email: string,
    user_attribute: 'INTERNAL' | 'CUSTOMER',
}

// 承認者の情報
type Approver = {
    // 会社名
    company_name: string,
    // 役職
    position: string,
    // 氏名
    user_name: string,
    // メールアドレス
    email: string,
};

// 承認者の初期値
const initialApprover: Approver = {
    company_name: '',
    position: '',
    user_name: '',
    email: '',
};

const initialApprovers: Approver[] = [initialApprover];

// フォームの入力値
interface FormInput {
    title: string,
    own_company: CompanyInfo,
    customer_company: CompanyInfo,
    type: string,
    deal_amount: number,
    conclusion_date: Dayjs | null,
    expiration_date: Dayjs | null,
    template_id: string,
    approval_flow: {
        internal_notifier: User[],
        internal_notifier_temp: User,
        customer_notifier: User[],
        customer_notifier_temp: User,
        submission_period: number,
    }
};

type CompanyInfo = {
    company_name: string;
    postal_code: string;
    state: string;
    city: string;
    address_line: string;
    building: string;
};

interface RegisterdUserInfo {
    user_id: string,
    user_name: string,
    company_id: string,
    location_id: string,
    position: string,
    email: string,
}

type ApproveUser = {
    user_name: string;
    position: string;
    email: string;
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

const ApproveFlowModifyPage: React.FC<{}> = () => {
    const navigate = useNavigate();

    let location = useLocation();
    const modifyType = location.state?.type;
    const [selectedInfo, setSelectedInfo] = useState(location.state?.selectedInfo);
    const internalApproveFlow = location.state?.internalApproveFlow;
    const customerApproveFlow = location.state?.customerApproveFlow;
    const internalNotifier = location.state?.internalNotifier;
    const customerNotifier = location.state?.customerNotifier;
    // const submissionPeriod = location.state?.submissionPeriod;
    const submissionPeriod = 10; // TODO：社内リリース時点では10日固定とする

    const { approver_id: internalApprovalId, ...internalPicWithoutApprovalId } = selectedInfo.internal_pic;
    const { approver_id: customerApprovalId, ...customerPicWithoutApprovalId } = selectedInfo.customer_pic;

    const pageTitle = modifyType === 'basicInfo' ? '契約基本情報更新' : '完了通知の送付先更新';

    /***
     *
     * React hooks
     *
     */
    // 自社情報一覧
    const [isLoading, setIsLoading] = useState(false);

    // 入力画面・プレビュー画面を切り替えるフラグ
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    // 自社承認ユーザー一覧
    const [internalUserList, setInternalUserList] = useState<RegisterdUserInfo[]>([]);

    // 顧客承認ユーザー一覧
    const [customerUserList, setCustomerUserList] = useState<RegisterdUserInfo[]>([]);

    // 承認者の追加状況（自社）
    const [isInternalApproverAdded, setIsInternalApproverAdded] = useState(false);

    // 承認者の追加状況（顧客）
    const [isCustomerApproverAdded, setIsCustomerApproverAdded] = useState(false);

    // フォームの入力値
    const { control, setValue, getValues, handleSubmit } = useForm<FormInput>(
        {
            defaultValues: {
                title: selectedInfo.title,
                own_company: {
                    company_name: selectedInfo.own_company.company_name,
                    postal_code: selectedInfo.own_company.postal_code,
                    state: selectedInfo.own_company.state,
                    city: selectedInfo.own_company.city,
                    address_line: selectedInfo.own_company.address_line,
                    building: selectedInfo.own_company.building
                },
                customer_company: {
                    company_name: selectedInfo.customer_company.company_name,
                    postal_code: selectedInfo.customer_company.postal_code,
                    state: selectedInfo.customer_company.state,
                    city: selectedInfo.customer_company.city,
                    address_line: selectedInfo.customer_company.address_line,
                    building: selectedInfo.customer_company.building
                },
                type: selectedInfo.type,
                deal_amount: selectedInfo.deal_amount,
                conclusion_date: dayjs(),
                expiration_date: dayjs().add(1, 'year').subtract(1, 'day'),
                approval_flow: {
                    internal_notifier: initialApprovers,
                    internal_notifier_temp: initialApprover,
                    customer_notifier: initialApprovers,
                    customer_notifier_temp: initialApprover,
                    submission_period: submissionPeriod,
                }
            }
        }
    );

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
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteApiErrorDialogDialog = () => {
        setExecuteFailedApiDialogOpen(true);
    };

    // 初回レンダー時に書類ファイル(.pdf)を取得する
    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        setIsLoading(true);

        const fetchData = async () => {
            try {
                // 自社関係者を設定する
                if (internalNotifier.length !== 0) {
                    setSelectedValuesForInternalNotifier(internalNotifier);
                    setIsInternalNotifierAdded(true);
                };

                // 相手方関係者を設定する
                if (customerNotifier.length !== 0) {
                    setSelectedValuesForCustomerNotifier(customerNotifier);
                    setIsCustomerNotifierAdded(true);
                };

                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetUserData(selectedInfo.own_company.company_id),
                    apiExecutor.fetchGetUserData(selectedInfo.customer_company.company_id)
                ];

                // APIを並列実行
                const responses = await Promise.all(requests);

                // ステータスコードが200以外の場合の処理
                const errorResponse = responses.find((res: Response) => res.status !== 200);
                if (errorResponse) {
                    setErrorCode(errorResponse.status);
                    setErrorProcess('契約書情報修正処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const [internalUserData, customerUserData] = await Promise.all(responses.map((res: Response) => res.json()));

                setInternalUserList(internalUserData);
                setCustomerUserList(customerUserData);

            } catch (error) {
                console.error('Error fetching data:', error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('契約書情報修正処理');
                setExecuteFailedApiDialogOpen(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /***
     *
     * 基本情報
     *
     */
    // 契約種別
    const [selectedValue, setSelectedValue] = useState<string>('');
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        setSelectedValue(event.target.value as string);
        setValue('type', event.target.value);
    };

    // 取引金額
    const formatNumber = (value: any) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const start = input.selectionStart;
        const end = input.selectionEnd;

        const value = input.value.replace(/,/g, '');
        const numberValue = Number(value);
        if (!isNaN(numberValue) && numberValue <= 1000000000) {
            setValue('deal_amount', numberValue);
        }

        // カーソルの位置を再設定
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(start, end);
            }
        }, 0);
    };

    // 署名用URL有効期限
    const [selectedValueUrlExpirationDate, setSelectedValueUrlExpirationDate] = useState<string>('');

    const handleSelectedValueUrlExpirationDate = (event: SelectChangeEvent<string>) => {
        setSelectedValueUrlExpirationDate(event.target.value as string);
    };

    // ---------------------------------------------- //
    // ---       承認フロー設定（関係者）：自社      --- //
    // ---------------------------------------------- //
    /***
     *
     * 社内フロー設定：関係者
     *
     */
    const [internalNotifiers, setInternalNotifiers] = useState<any[]>([]);
    const [selectedInternalNotifier, setSelectedInternalNotifier] = useState('');
    const [selectedValuesForInternalNotifier, setSelectedValuesForInternalNotifier] = useState<any[]>([]);

    // プルダウンメニューから選択したユーザー情報を追加
    const handleSelectChange_internalNotifier = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedInternalNotifier(selectedValue);

        const selectedUser = internalUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.internal_notifier_temp.user_name', selectedUser.user_name);
            setValue('approval_flow.internal_notifier_temp.company_name', getValues().own_company.company_name);
            setValue('approval_flow.internal_notifier_temp.position', selectedUser.position);
            setValue('approval_flow.internal_notifier_temp.email', selectedUser.email);
        }
    };

    const [isInternalNotifierAdded, setIsInternalNotifierAdded] = useState(false);

    // 関係者をリストに追加する
    const addInternalNotifiers = () => {
        const user_name = getValues().approval_flow.internal_notifier_temp.user_name;
        const email = getValues().approval_flow.internal_notifier_temp.email;

        if (user_name === '' || email === '') {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const manualUser = {
            company_name: getValues().own_company.company_name,
            user_name: user_name,
            position: getValues().approval_flow.internal_notifier_temp.position,
            email: email,
        };

        const newNotifiers = [...internalNotifiers, manualUser];
        setInternalNotifiers(newNotifiers);
        setIsInternalNotifierAdded(true);

        // setSelectedValuesForInternalNotifier((prev) => [...prev, manualUser]);
        setSelectedValuesForInternalNotifier((prev) => {
            if (prev.some(user => user.email === manualUser.email)) {
                alert(`このメールアドレス（${manualUser.email}）のユーザーは既に通知先に追加されています。`);
                return prev;
            };
            return [...prev, manualUser];
        });

        // 入力フォームの値を空にする
        setValue('approval_flow.internal_notifier_temp.user_name', '');
        setValue('approval_flow.internal_notifier_temp.position', '');
        setValue('approval_flow.internal_notifier_temp.email', '');
    };

    // 追加した関係者情報をクリアする
    const clearTempInternalNotifier = () => {
        setSelectedValuesForInternalNotifier([]);
        setIsInternalNotifierAdded(false);
    };

    /***
     *
     * 相手方フロー設定：関係者
     *
     */
    // プルダウンメニューで選択した値
    const [selectedCustomerNotifier, setSelectedCustomerNotifier] = useState('');

    const handleSelectChange_customerNotifier = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedCustomerNotifier(selectedValue);

        const selectedUser = customerUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.customer_notifier_temp.user_name', selectedUser.user_name);
            setValue('approval_flow.customer_notifier_temp.company_name', getValues().own_company.company_name);
            setValue('approval_flow.customer_notifier_temp.position', selectedUser.position);
            setValue('approval_flow.customer_notifier_temp.email', selectedUser.email);
        }
    };

    const [customerNotifiers, setCustomerNotifiers] = useState<any[]>([]);
    const [selectedValuesForCustomerNotifier, setSelectedValuesForCustomerNotifier] = useState<any[]>([]);

    const [isCustomerNotifierAdded, setIsCustomerNotifierAdded] = useState(false);

    // 関係者をリストに追加する
    const addCustomerNotifiers = () => {
        const user_name = getValues().approval_flow.customer_notifier_temp.user_name;
        const email = getValues().approval_flow.customer_notifier_temp.email;

        if (user_name === '' || email === '') {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const manualUser = {
            company_name: getValues().customer_company.company_name,
            user_name: user_name,
            position: getValues().approval_flow.customer_notifier_temp.position,
            email: email,
        };

        const newNotifiers = [...customerNotifiers, manualUser];
        setCustomerNotifiers(newNotifiers);
        setIsCustomerNotifierAdded(true);

        // setSelectedValuesForCustomerNotifier((prev) => [...prev, manualUser]);
        setSelectedValuesForCustomerNotifier((prev) => {
            if (prev.some(user => user.email === manualUser.email)) {
                alert(`このメールアドレス（${manualUser.email}）のユーザーは既に通知先に追加されています。`);
                return prev;
            };
            return [...prev, manualUser];
        });

        // 入力フォームの値を空にする
        setValue('approval_flow.customer_notifier_temp.user_name', '');
        setValue('approval_flow.customer_notifier_temp.position', '');
        setValue('approval_flow.customer_notifier_temp.email', '');
    };

    // 「クリア」ボタンを押下した際に追加した関係者情報をクリアする
    const clearTempCustomerNotifier = () => {
        setSelectedValuesForCustomerNotifier([]);
        setIsCustomerNotifierAdded(false);
    };

    /***
     *
     * 登録画面で「確認する」、または確認画面で「戻る」を選択した時の処理
     *
     */
    const [previewInternal, setPreviewInternal] = useState<ApproveFlowListColumns[]>([]);
    const [previewCustomer, setPreviewCustomer] = useState<ApproveFlowListColumns[]>([]);

    const onPreview = () => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        if (isPreviewVisible) {
            setIsPreviewVisible(false); // 登録画面を表示する
        } else {

            // 各企業の関係者情報を設定
            setValue('approval_flow.internal_notifier', selectedValuesForInternalNotifier);
            setValue('approval_flow.customer_notifier', selectedValuesForCustomerNotifier);

            // フォームから承認フローを取得
            const approval_flow = getValues().approval_flow;

            // プレビュー画面を表示
            setIsPreviewVisible(true);
        }
    };

    /***
     *
     * 「確認する」を選択した時の処理
     *
     */
    // フォームの登録内容を整理し、登録内容確認画面へ遷移する。
    const onUpdate = (data: FormInput) => {

        const dataKeys = Object.keys(data) as (keyof FormInput)[];
        const registerKeys = dataKeys.filter(key => data[key] || data[key] === 0);
        const body: any = {};
        registerKeys.forEach(key => {
            let value = data[key];
            // Dayjsを文字列に変換
            if (key === 'conclusion_date' || key === 'expiration_date') {
                value = (value as Dayjs)?.format('YYYY-MM-DD');
            }
            body[key] = value;
        });

        // body.approval_flow から不要なプロパティを削除
        delete body.approval_flow.internal_approver_temp;
        delete body.approval_flow.customer_approver_temp;
        delete body.approval_flow.internal_notifier_temp;
        delete body.approval_flow.customer_notifier_temp;

        body.approval_flow = removeRoleFromApprovalFlow(body.approval_flow);

        updateAgreement(body);
    }

    // 契約書を登録する
    const updateAgreement = async (body: any) => {

        setExecuteApiDialogOpen(true);
        try {
            const res = await api.putAgreement(selectedInfo.agreement_id, body);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('契約書更新処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            }

            const agreementData = await res.json();
            navigate('/documentManagement/modifyDocument/modifyComplete', { state: { agreementData } });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('契約書更新処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    // approval_flowから特定のプロパティのrole情報を除外する関数
    const removeRoleFromApprovalFlow = (approvalFlow: any): any => {
        const newApprovalFlow: any = { ...approvalFlow };

        const keysToRemoveRole = [
            'internal_approver',
            'internal_authorizer',
            'customer_approver',
            'customer_authorizer'
        ];

        keysToRemoveRole.forEach(key => {
            if (newApprovalFlow[key]) {
                if (Array.isArray(newApprovalFlow[key])) {
                    // 配列の場合、各オブジェクトからroleを削除
                    newApprovalFlow[key] = newApprovalFlow[key].map((item: any) => {
                        const { role, ...rest } = item;
                        return rest;
                    });
                } else if (typeof newApprovalFlow[key] === 'object' && 'role' in newApprovalFlow[key]) {
                    // オブジェクトの場合、roleを削除
                    delete newApprovalFlow[key].role;
                }
            }
        });

        return newApprovalFlow;
    };

    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const handleChange_ = (event: React.SyntheticEvent, newTabValue: number) => {
        setTabValue(newTabValue);
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor="grey.200" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: '80px', width: '100%', minHeight: 'calc(100vh - 35px)' }}>
                    <CssBaseline />
                    <Header />
                    <Box sx={{ flexGrow: 1, paddingLeft: '10%', paddingRight: '10%' }}>
                        {!isPreviewVisible && (
                            <>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', fontSize: '1.5em', marginBottom: '20px' }}>
                                    {pageTitle}
                                </Typography>
                                {modifyType === 'basicInfo' && (
                                    <>
                                        <Box sx={{ backgroundColor: 'white', border: '1px solid lightgray' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                                <Box sx={{ width: '100%', padding: '40px' }}>
                                                    <Box sx={{ display: 'flex', width: '100%', marginBottom: '30px' }}>
                                                        <Box sx={{ display: 'flex', width: '50%', marginRight: '10px' }}>
                                                            <CustomPulldownMenu
                                                                label="契約種別"
                                                                value={selectedValue}
                                                                onChange={handleSelectChange}
                                                                items={contractType}
                                                            />
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', marginBottom: '30px', marginRight: '10px' }}>
                                                        <Controller
                                                            name="deal_amount"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <TextField
                                                                    {...field}
                                                                    id="deal_amount"
                                                                    label="取引金額"
                                                                    variant="standard"
                                                                    sx={{
                                                                        ...baseTextFieldStyle,
                                                                        '& .MuiInputBase-input': {
                                                                            fontWeight: 'bold',
                                                                            fontSize: '1.5em',
                                                                            textAlign: 'right',
                                                                        }
                                                                    }}
                                                                    value={field.value ? formatNumber(field.value) : '0'}
                                                                    onChange={handleChange}
                                                                    InputProps={{
                                                                        endAdornment: <InputAdornment position="end">円</InputAdornment>,
                                                                    }}
                                                                    inputProps={{
                                                                        autoComplete: 'off',
                                                                        max: 1000000000,
                                                                        ref: inputRef,
                                                                    }}
                                                                    onFocus={(event) => {
                                                                        const input = event.target;
                                                                        const length = input.value.length;
                                                                        input.setSelectionRange(length, length);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', width: '50%', marginBottom: '40px', marginRight: '10px' }}>
                                                        <CustomPulldownMenu
                                                            label="署名用URL有効期限（相手方企業用）"
                                                            value={selectedValueUrlExpirationDate}
                                                            onChange={handleSelectedValueUrlExpirationDate}
                                                            items={effectiveDate}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', width: '100%' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', marginRight: '20px' }}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <Controller
                                                                    name="conclusion_date"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <MobileDatePicker
                                                                            {...field}
                                                                            label="契約開始日"
                                                                            format='YYYY年MM月DD日'
                                                                            sx={{
                                                                                marginY: '0.5rem',
                                                                                ...baseTextFieldStyle,
                                                                                '& .MuiInputBase-input': {
                                                                                    fontWeight: 'bold',
                                                                                    fontSize: '1.5em',
                                                                                }
                                                                            }}
                                                                            minDate={dayjs('2022-01-01')}
                                                                            maxDate={dayjs('2050-12-31')}
                                                                        />
                                                                    )}
                                                                />
                                                            </LocalizationProvider>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%' }}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <Controller
                                                                    name="expiration_date"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <MobileDatePicker
                                                                            {...field}
                                                                            label="契約終了日"
                                                                            format='YYYY年MM月DD日 '
                                                                            sx={{
                                                                                marginY: '0.5rem',
                                                                                ...baseTextFieldStyle,
                                                                                '& .MuiInputBase-input': {
                                                                                    fontWeight: 'bold',
                                                                                    fontSize: '1.5em',
                                                                                }
                                                                            }}
                                                                            minDate={dayjs('2022-01-01')}
                                                                            maxDate={dayjs('2050-12-31')}
                                                                        />
                                                                    )}
                                                                />
                                                            </LocalizationProvider>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </>
                                )}
                                {modifyType === 'notification' && (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px', width: '100%' }}>
                                            <Box sx={{ width: '30%' }}>
                                                <AppBar position="static">
                                                    <Tabs
                                                        value={tabValue}
                                                        onChange={handleChange_}
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
                                                        <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>自社通知先</Typography>}
                                                            {...a11yProps(0)}
                                                        />
                                                        <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>相手方通知再起</Typography>}
                                                            {...a11yProps(1)}
                                                        />
                                                    </Tabs>
                                                </AppBar>
                                            </Box>
                                        </Box>
                                        <TabPanel value={tabValue} index={0} dir={theme.direction}>
                                            <Box bgcolor='white' sx={{ flexGrow: 1, paddingLeft: '40px', paddingRight: '20px', paddingTop: '5px', border: '1px solid lightgray' }}>
                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px' }}>
                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                        本契約の完了を通知する人を選択、または入力してください。
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', width: '100%', marginTop: '10px', padding: '20px' }}>
                                                    <Box sx={{ display: 'flex', width: '45%', marginLeft: '2%', marginRight: '5%' }}>
                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                            <InputLabel id="internal_notifier">自社関係者</InputLabel>
                                                            <Select
                                                                labelId="internal_authorizer-label"
                                                                id="internal_notifier"
                                                                value={selectedInternalNotifier}
                                                                onChange={handleSelectChange_internalNotifier}
                                                                label="自社承認者"
                                                                variant="standard"
                                                                sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
                                                            >
                                                                {internalUserList.map((item: ApproveUser, index) => (
                                                                    <MenuItem key={index} value={item.user_name}>{item.user_name}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                    <Box sx={{ width: '45%' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <Controller
                                                                name="approval_flow.internal_notifier_temp.user_name"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        id="approval_flow.internal_notifier_temp.user_name"
                                                                        label="氏名"
                                                                        variant="standard"
                                                                        sx={{ width: '100%' }}
                                                                        InputProps={{
                                                                            style: {
                                                                                paddingLeft: '20px',
                                                                                fontSize: '20px',
                                                                                fontWeight: 'bold'
                                                                            },
                                                                            inputProps: {
                                                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <Controller
                                                                name="approval_flow.internal_notifier_temp.position"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        id="approval_flow.internal_notifier_temp.position"
                                                                        label="役職"
                                                                        variant="standard"
                                                                        sx={{ width: '100%' }}
                                                                        InputProps={{
                                                                            style: {
                                                                                paddingLeft: '20px',
                                                                                fontSize: '20px',
                                                                                fontWeight: 'bold'
                                                                            },
                                                                            inputProps: {
                                                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <Controller
                                                                name="approval_flow.internal_notifier_temp.email"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        id="approval_flow.internal_notifier_temp.email"
                                                                        label="メールアドレス"
                                                                        variant="standard"
                                                                        sx={{ width: '100%' }}
                                                                        InputProps={{
                                                                            style: {
                                                                                paddingLeft: '20px',
                                                                                fontSize: '20px',
                                                                                fontWeight: 'bold'
                                                                            },
                                                                            inputProps: {
                                                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ width: '100%', marginTop: '10px', paddingTop: '20px' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginBottom: '10px' }}>
                                                        <Button variant="contained" onClick={() => addInternalNotifiers()} sx={{ marginBottom: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>追加する</Button>
                                                        {isInternalNotifierAdded && (
                                                            <Button variant="contained" onClick={() => clearTempInternalNotifier()} sx={{ marginBottom: '10px', marginLeft: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>クリア</Button>
                                                        )}
                                                    </Box>
                                                    {isInternalNotifierAdded && (
                                                        <>
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                                                                <Box sx={{ display: 'flex', width: '90%', padding: '40px', justifyContent: 'center', borderTop: '2px solid lightgray' }}>
                                                                    <TableContainer component={Paper}>
                                                                        <Table
                                                                            sx={{ minWidth: 500, border: '1px solid lightgray' }}
                                                                            aria-label="simple table"
                                                                        >
                                                                            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                                                <TableRow>
                                                                                    <TableCell sx={getTableHeaderStyle()}>氏名</TableCell>
                                                                                    <TableCell sx={getTableHeaderStyle()} align="right">役職</TableCell>
                                                                                    <TableCell sx={getTableHeaderStyle()} align="right">メールアドレス</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {selectedValuesForInternalNotifier.map((row, index) => (
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell sx={getTableCellStyle()}>{row.user_name}</TableCell>
                                                                                        <TableCell sx={getTableCellStyle()} align="right">{row.position}</TableCell>
                                                                                        <TableCell sx={getTableCellStyle()} align="right">{row.email}</TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </TableContainer>
                                                                </Box>
                                                            </Box>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TabPanel>
                                        <TabPanel value={tabValue} index={1} dir={theme.direction}>
                                            <Box bgcolor='white' sx={{ flexGrow: 1, paddingLeft: '40px', paddingRight: '20px', paddingTop: '5px', border: '1px solid lightgray' }}>
                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px' }}>
                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                        本契約の完了を通知する人を選択、または入力してください。
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', width: '100%', marginTop: '10px', padding: '20px' }}>
                                                    <Box sx={{ display: 'flex', width: '45%', marginLeft: '2%', marginRight: '5%' }}>
                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                            <InputLabel id="customer_notifier">相手方承認者</InputLabel>
                                                            <Select
                                                                labelId="customer_authorizer-label"
                                                                id="customer_notifier"
                                                                value={selectedCustomerNotifier}
                                                                onChange={handleSelectChange_customerNotifier}
                                                                label="相手方承認者"
                                                                variant="standard"
                                                                sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
                                                            >
                                                                {customerUserList.map((item: ApproveUser, index) => (
                                                                    <MenuItem key={index} value={item.user_name}>{item.user_name}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                    <Box sx={{ width: '45%' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <Controller
                                                                name="approval_flow.customer_notifier_temp.user_name"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        id="approval_flow.customer_notifier_temp.user_name"
                                                                        label="氏名"
                                                                        variant="standard"
                                                                        sx={{ width: '100%' }}
                                                                        InputProps={{
                                                                            style: {
                                                                                paddingLeft: '20px',
                                                                                fontSize: '20px',
                                                                                fontWeight: 'bold'
                                                                            },
                                                                            inputProps: {
                                                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <Controller
                                                                name="approval_flow.customer_notifier_temp.position"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        id="approval_flow.customer_notifier_temp.position"
                                                                        label="役職"
                                                                        variant="standard"
                                                                        sx={{ width: '100%' }}
                                                                        InputProps={{
                                                                            style: {
                                                                                paddingLeft: '20px',
                                                                                fontSize: '20px',
                                                                                fontWeight: 'bold'
                                                                            },
                                                                            inputProps: {
                                                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <Controller
                                                                name="approval_flow.customer_notifier_temp.email"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        id="approval_flow.customer_notifier_temp.email"
                                                                        label="メールアドレス"
                                                                        variant="standard"
                                                                        sx={{ width: '100%' }}
                                                                        InputProps={{
                                                                            style: {
                                                                                paddingLeft: '20px',
                                                                                fontSize: '20px',
                                                                                fontWeight: 'bold'
                                                                            },
                                                                            inputProps: {
                                                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ width: '100%', marginTop: '10px', paddingTop: '20px' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginBottom: '10px' }}>
                                                        <Button variant="contained" onClick={() => addCustomerNotifiers()} sx={{ marginBottom: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>追加する</Button>
                                                        {isCustomerNotifierAdded && (
                                                            <Button variant="contained" onClick={() => clearTempCustomerNotifier()} sx={{ marginBottom: '10px', marginLeft: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>クリア</Button>
                                                        )}
                                                    </Box>
                                                    {isCustomerNotifierAdded && (
                                                        <>
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                                                                <Box sx={{ display: 'flex', width: '90%', padding: '40px', justifyContent: 'center', borderTop: '2px solid lightgray' }}>
                                                                    <TableContainer component={Paper}>
                                                                        <Table
                                                                            sx={{ minWidth: 650, border: '1px solid lightgray' }}
                                                                            aria-label="simple table"
                                                                        >
                                                                            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                                                <TableRow>
                                                                                    <TableCell sx={getTableHeaderStyle()}>氏名</TableCell>
                                                                                    <TableCell sx={getTableHeaderStyle()} align="right">役職</TableCell>
                                                                                    <TableCell sx={getTableHeaderStyle()} align="right">メールアドレス</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {selectedValuesForCustomerNotifier.map((row, index) => (
                                                                                    <TableRow
                                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                                    >
                                                                                        <TableCell sx={getTableCellStyle()}>{row.user_name}</TableCell>
                                                                                        <TableCell sx={getTableCellStyle()} align="right">{row.position}</TableCell>
                                                                                        <TableCell sx={getTableCellStyle()} align="right">{row.email}</TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </TableContainer>
                                                                </Box>
                                                            </Box>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TabPanel>
                                    </>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}>
                                    <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                        <Typography>戻る</Typography>
                                    </Button>
                                    <Button variant="contained" onClick={handleSubmit(onPreview)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                        <Typography>確認する</Typography>
                                    </Button>
                                </Box>
                            </>
                        )}
                        {isPreviewVisible && (
                            <>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '30px', marginBottom: '30px', fontSize: '1.5em' }}>
                                    こちらの内容で更新します。よろしいですか？
                                </Typography>
                                <Box sx={{ marginTop: '20px' }}>
                                    {modifyType === 'basicInfo' && (
                                        <Box sx={{ width: '100%', marginBottom: '20px', bgcolor: "white", padding: '20px', border: '1px solid lightgray' }}>
                                            <CommonTextField value={getValues('type')} label="契約書種別" />
                                            <CommonTextField value={getValues('deal_amount').toLocaleString() + '円'} label="取引金額" />
                                            <CommonTextField value={dayjs(getValues('conclusion_date')).format('YYYY-MM-DD')} label="契約開始日" />
                                            <CommonTextField value={dayjs(getValues('expiration_date')).format('YYYY-MM-DD')} label="契約終了日" />
                                            <CommonTextField value={`${Number(getValues('approval_flow.submission_period'))}日`} label="署名用URL有効期限（相手方企業向け）" />
                                        </Box>
                                    )}
                                    {modifyType === 'notification' && (
                                        <PreviewApproveFlowNotifier internalNotifier={selectedValuesForInternalNotifier} customerNotifier={selectedValuesForCustomerNotifier} />
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                        <Button variant="contained" onClick={handleSubmit(onPreview)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                            <Typography>戻る</Typography>
                                        </Button>
                                        <Button variant="contained" onClick={handleSubmit(onUpdate)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                            <Typography>更新する</Typography>
                                        </Button>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box >
                <Footer />
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}

export default ApproveFlowModifyPage;