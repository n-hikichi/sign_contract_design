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
import PreviewApproveFlow, { PreviewBeforeStartApproveFlowNotifier } from '../common/PreviewApproveFlow';
import ErrorDialog from '../common/ErrorDialog';
import ApiProcessingDialog from "../common/ApiProcessingDialog";
import ApproveFlowTable, { AuthorizerTable } from "../common/ApproveFlowTable";

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
        internal_pic: User,
        internal_approver: User[],
        internal_approver_temp: User,
        internal_authorizer: User,
        internal_notifier: User[],
        internal_notifier_temp: User,
        customer_pic: User,
        customer_approver: User[],
        customer_approver_temp: User,
        customer_authorizer: User,
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

const ModifyHome: React.FC<{}> = () => {
    const navigate = useNavigate();

    let location = useLocation();
    const [selectedInfo, setSelectedInfo] = useState(location.state?.selectedInfo);
    const internalApproveFlow = location.state?.internalApproveFlow;
    const customerApproveFlow = location.state?.customerApproveFlow;
    const internalNotifier = location.state?.internalNotifier;
    const customerNotifier = location.state?.customerNotifier;
    // const submissionPeriod = location.state?.submissionPeriod;
    const submissionPeriod = 1; // TODO：社内リリース時点では10日固定とする

    const { approver_id: internalApprovalId, ...internalPicWithoutApprovalId } = selectedInfo.internal_pic;
    const { approver_id: customerApprovalId, ...customerPicWithoutApprovalId } = selectedInfo.customer_pic;

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
                    internal_pic: internalPicWithoutApprovalId,
                    internal_approver: initialApprovers,
                    internal_approver_temp: initialApprover, // 更新リクエストを送信する際に削除する
                    internal_authorizer: internalApproveFlow.find((item: any) => item.role === AUTHORIZER),
                    internal_notifier: initialApprovers,
                    internal_notifier_temp: initialApprover,
                    customer_pic: customerPicWithoutApprovalId,
                    customer_approver: initialApprovers,
                    customer_approver_temp: initialApprover, // 更新リクエストを送信する際に削除する
                    customer_authorizer: customerApproveFlow.find((item: any) => item.role === AUTHORIZER),
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
                // 社内承認フローから担当者と代表者を除外し、初期値として設定する
                const filteredInternalApproveFlow = internalApproveFlow.filter((item: any) => item.role !== PIC && item.role !== AUTHORIZER);
                if (filteredInternalApproveFlow.length !== 0) {
                    setSelectedValuesForInternal(filteredInternalApproveFlow);
                    setIsInternalApproverAdded(true);
                };

                // 自社関係者を設定する
                if (internalNotifier.length !== 0) {
                    setSelectedValuesForInternalNotifier(internalNotifier);
                    setIsInternalNotifierAdded(true);
                };

                // 顧客承認フローから担当者と代表者を除外し、初期値として設定する
                const filteredCustomerApproveFlow = customerApproveFlow.filter((item: any) => item.role !== PIC && item.role !== AUTHORIZER);
                if (filteredCustomerApproveFlow.length !== 0) {
                    setSelectedValuesForCustomer(filteredCustomerApproveFlow);
                    setIsCustomerApproverAdded(true);
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

                // internalUserをisRepresentativeSealがtrue/falseで分割
                const { internalTrueList, internalFalseList } = internalUserData.reduce(
                    (userList: { internalTrueList: typeof internalUserData; internalFalseList: typeof internalUserData }, user: any) => {
                        if (user.isRepresentativeSeal) {
                            userList.internalTrueList.push(user);
                        } else {
                            userList.internalFalseList.push(user);
                        }
                        return userList;
                    },
                    { internalTrueList: [], internalFalseList: [] }
                );
                // 社内承認ユーザー一覧を設定
                setInternalUserList(internalFalseList);

                // customerUserをisRepresentativeSealがtrue/falseで分割
                const { customerTrueList, customerFalseList } = customerUserData.reduce(
                    (userList: { customerTrueList: typeof customerUserData; customerFalseList: typeof customerUserData }, user: any) => {
                        if (user.isRepresentativeSeal) {
                            userList.customerTrueList.push(user);
                        } else {
                            userList.customerFalseList.push(user);
                        }
                        return userList;
                    },
                    { customerTrueList: [], customerFalseList: [] }
                );
                // 顧客承認ユーザー一覧を設定
                setCustomerUserList(customerFalseList);

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
        setValue('approval_flow.submission_period', Number(event.target.value));
    };

    // --------------------------------- //
    // ---       承認フロー設定       --- //
    // --------------------------------- //
    /***
     *
     * ユーザーロール選択タブ
     *
     */
    interface TabPanelProps {
        children?: React.ReactNode;
        dir?: string;
        index: number;
        value: number;
    }

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
                    <Box sx={{ p: 3 }}>
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

    /***
     *
     * 社内承認フロー設定フィールド（自社）
     * タブ制御
     *
     */
    const internalTheme = useTheme();
    const [internalThemeValue, setInternalThemeValue] = React.useState(0);

    const handleInternalThemeValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setInternalThemeValue(newValue);
    };

    /***
     *
     * 社内承認フロー設定フィールド（顧客）
     * タブ制御
     *
     */
    const customerTheme = useTheme();
    const [customerThemeValue, setCustomerThemeValue] = React.useState(0);

    const handleCustomerThemeValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setCustomerThemeValue(newValue);
    };

    // ---------------------------------------------- //
    // ---       承認フロー設定（承認者）：自社      --- //
    // ---------------------------------------------- //
    /***
     *
     * 社内フロー設定：承認者
     *
     */
    const [internalApprovers, setInternalApprovers] = useState<any[]>([]);
    const [selectedInternalApprover, setSelectedInternalApprover] = useState('');
    const [selectedValuesForInternal, setSelectedValuesForInternal] = useState<any[]>([]);

    // プルダウンメニューから選択したユーザー情報を追加
    const handleSelectChange_internalApprover = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedInternalApprover(selectedValue);

        const selectedUser = internalUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.internal_approver_temp.user_name', selectedUser.user_name);
            setValue('approval_flow.internal_approver_temp.position', selectedUser.position);
            setValue('approval_flow.internal_approver_temp.email', selectedUser.email);
        }
    };

    // 承認者をリストに追加する
    const addInternalApprovers = () => {
        const user_name = getValues().approval_flow.internal_approver_temp.user_name;
        const email = getValues().approval_flow.internal_approver_temp.email;

        if (user_name === '' || email === '') {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const manualUser = {
            company_name: getValues().own_company.company_name,
            user_name: user_name,
            position: getValues().approval_flow.internal_approver_temp.position,
            email: email,
        };

        const newApprovers = [...internalApprovers, manualUser];
        setInternalApprovers(newApprovers);
        setIsInternalApproverAdded(true);

        // setSelectedValuesForInternal((prev) => [...prev, manualUser]);
        setSelectedValuesForInternal((prev) => {
            if (prev.some(user => user.email === manualUser.email)) {
                alert(`このメールアドレス（${manualUser.email}）のユーザーは既に通知先に追加されています。`);
                return prev;
            };
            return [...prev, manualUser];
        });

        // 入力フォームの値を空にする
        setValue('approval_flow.internal_approver_temp.user_name', '');
        setValue('approval_flow.internal_approver_temp.position', '');
        setValue('approval_flow.internal_approver_temp.email', '');
    };

    // 追加した承認者情報をクリアする
    const clearTempInternalApprover = () => {
        setSelectedValuesForInternal([]);
        setIsInternalApproverAdded(false);
    }

    // 追加した承認者の順番をドラッグアンドドロップで入れ替える
    const handleInitialInternalRowsOnDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(internalApprovers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedValuesForInternal(items);
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

    // --------------------------------------- //
    // ---       承認フロー設定（顧客）      --- //
    // --------------------------------------- //
    /***
     *
     * 相手方フロー設定：承認者
     *
     */
    const [selectedCustomerApprover, setSelectedCustomerApprover] = useState('');

    const handleSelectChange_customerApprover = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedCustomerApprover(selectedValue);

        const selectedUser = customerUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.customer_approver_temp.user_name', selectedUser.user_name);
            setValue('approval_flow.customer_approver_temp.position', selectedUser.position);
            setValue('approval_flow.customer_approver_temp.email', selectedUser.email);
        }
    };

    const [customerApprovers, setCustomerApprovers] = useState<any[]>([]);
    const [selectedValuesForCustomer, setSelectedValuesForCustomer] = useState<any[]>([]);

    // 承認者をリストに追加する
    const addCustomerApprovers = () => {
        const user_name = getValues().approval_flow.customer_approver_temp.user_name;
        const email = getValues().approval_flow.customer_approver_temp.email;

        if (user_name === '' || email === '') {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const manualUser = {
            company_name: getValues().customer_company.company_name,
            user_name: user_name,
            position: getValues().approval_flow.customer_approver_temp.position,
            email: email,
        };

        const newApprovers = [...customerApprovers, manualUser];
        setCustomerApprovers(newApprovers);
        setIsCustomerApproverAdded(true);

        // setSelectedValuesForCustomer((prev) => [...prev, manualUser]);
        setSelectedValuesForCustomer((prev) => {
            if (prev.some(user => user.email === manualUser.email)) {
                alert(`このメールアドレス（${manualUser.email}）のユーザーは既に承認フローに追加されています。`);
                return prev;
            };
            return [...prev, manualUser];
        });

        // 入力フォームの値を空にする
        setValue('approval_flow.customer_approver_temp.user_name', '');
        setValue('approval_flow.customer_approver_temp.position', '');
        setValue('approval_flow.customer_approver_temp.email', '');
    };

    // 追加した承認者情報をクリアする
    const clearTempCustomerApprover = () => {
        setSelectedValuesForCustomer([]);
        setIsCustomerApproverAdded(false);
    }

    // 追加した承認者の順番をドラッグアンドドロップで入れ替える
    const handleInitialCustomerRowsOnDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(customerApprovers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedValuesForCustomer(items);
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
        setSelectedValuesForInternalNotifier((prev) => {
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

            // 各企業の承認者情報を設定
            setValue('approval_flow.internal_approver', selectedValuesForInternal);
            setValue('approval_flow.customer_approver', selectedValuesForCustomer);

            // 各企業の関係者情報を設定
            setValue('approval_flow.internal_notifier', selectedValuesForInternalNotifier);
            setValue('approval_flow.customer_notifier', selectedValuesForCustomerNotifier);

            // フォームから承認フローを取得
            const approval_flow = getValues().approval_flow;

            // 自社承認フローを設定
            const internalApprovalFlow = {
                internal_approver: selectedValuesForInternal,
                internal_authorizer: approval_flow.internal_authorizer,
            };

            // 相手方承認フローを設定
            const customerApprovalFlow = {
                customer_approver: selectedValuesForCustomer,
                customer_authorizer: approval_flow.customer_authorizer,
            };

            // 各ユーザーにユーザー権限（担当者、承認者、代表者）を付与
            const internalList = addUserRole(internalApprovalFlow);
            const customerList = addUserRole(customerApprovalFlow);

            // プレビュー画面に表示するデータを設定
            setPreviewInternal(internalList);
            setPreviewCustomer(customerList);

            // プレビュー画面を表示
            setIsPreviewVisible(true);
        }
    }

    // ユーザー権限（担当者、承認者、代表者）を付与する
    const addUserRole = (data: any) => {
        let modifyDate: ApproveFlowListColumns[] = [];

        for (let flowData in data) {
            if (apiStatus.userRole.hasOwnProperty(flowData)) {
                let role = apiStatus.userRole[flowData as keyof typeof apiStatus.userRole];

                if ((flowData === 'internal_approver' || flowData === 'customer_approver') && Array.isArray(data[flowData])) {
                    // internal_approverまたはcustomer_approverが配列の場合
                    const approvers = data[flowData] as Array<any>;
                    if (approvers.length === 0 || (approvers.length === 1 && approvers[0].user_name === initialApprover.user_name)) {
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
                        modifyDate.push(item);
                    });
                } else {
                    // internal_approver、customer_approver以外の場合
                    let item: ApproveFlowListColumns = {
                        role: role,
                        company_name: data[flowData].company_name,
                        user_name: data[flowData].user_name,
                        email: data[flowData].email,
                        position: data[flowData].position,
                    };

                    modifyDate.push(item);
                }
            }
        }

        return modifyDate;
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

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor="grey.200" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: '60px', width: '100%' }}>
                    <CssBaseline />
                    <Header />
                    <Box sx={{ flexGrow: 1, paddingLeft: '10%', paddingRight: '10%' }}>
                        {!isPreviewVisible && (
                            <>
                                <Box sx={{ marginTop: '20px', marginBottom: '10px' }}>
                                    <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', fontSize: '1.5em', marginBottom: '20px' }}>
                                        契約書情報を更新してください
                                    </Typography>
                                    <Box sx={{ border: '1px solid lightgray' }}>
                                        <Accordion defaultExpanded>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <Box sx={{ backgroundColor: '#1565c0', padding: '10px', width: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>契約基本情報設定</Typography>
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', width: '100px' }}>
                                                    <CheckCircleIcon sx={{ color: 'green', fontSize: '40px' }}></CheckCircleIcon>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Box sx={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}>
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
                                            </AccordionDetails>
                                        </Accordion>
                                    </Box>
                                    <Box sx={{ border: '1px solid lightgray' }}>
                                        <Accordion>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <Box sx={{ backgroundColor: '#1565c0', padding: '10px', width: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>自社承認フロー設定</Typography>
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', width: '100px' }}>
                                                    <CheckCircleIcon sx={{ color: 'green', fontSize: '40px' }}></CheckCircleIcon>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box bgcolor='white' sx={{ flexGrow: 1, paddingLeft: '40px', paddingRight: '20px', paddingTop: '5px' }}>
                                                    <Box sx={{ marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }}>
                                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                                            本設定項目は任意です。以下の注意事項に従ってユーザーを追加してください。<br />
                                                        </Typography>
                                                        <Typography sx={{ color: 'darkred', fontWeight: 'bold' }}>
                                                            承認フロー　　　：契約書への承認を依頼するユーザーを登録する<br />
                                                            完了通知の送付先：「社内承認の完了」「相手方と契約が締結」された際にメールを通知するユーザーを登録する（※承認依頼は送信されません）
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ width: '100%', paddingRight: '24px' }}>
                                                        <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <Tabs
                                                                    value={internalThemeValue}
                                                                    onChange={handleInternalThemeValueChange}
                                                                    textColor="inherit"
                                                                    variant="scrollable"
                                                                    aria-label="Vertical tabs example"
                                                                    sx={{
                                                                        backgroundColor: 'lightblue', // タブの背景色

                                                                        '& .MuiTab-root': {
                                                                            color: '#000', // タブのテキスト色
                                                                            fontWeight: 'bold', // タブのフォントウェイト
                                                                            fontSize: '24px', // タブのフォントサイズ
                                                                            width: '300px', // タブの幅
                                                                            height: '30px', // タブの高さ
                                                                            border: '0.5px solid gray', // タブのボーダー
                                                                        },
                                                                        '& .Mui-selected': {
                                                                            bgcolor: 'lightblue', // 選択されたタブのテキスト色
                                                                            border: '2px solidrgb(30, 32, 32)', // タブのボーダー
                                                                            backgroundColor: '#1565c0', // 選択されたタブの背景色
                                                                            color: 'white', // 選択されたタブのテキスト色
                                                                        },
                                                                        '& .MuiTabs-indicator': {
                                                                            backgroundColor: '#ff0000', // インジケーターの色
                                                                            height: '2px',
                                                                        },
                                                                    }}
                                                                >
                                                                    <Tab label="承認フロー" {...a11yProps(0)} />
                                                                    <Tab label="完了通知の送付先" {...a11yProps(1)} />
                                                                </Tabs>
                                                            </Box>
                                                        </AppBar>
                                                    </Box>
                                                    <Box sx={{ border: '2px solid lightgray', marginBottom: '20px', marginRight: '24px' }}>
                                                        <TabPanel value={internalThemeValue} index={0} dir={internalTheme.direction}>
                                                            <Box sx={{ marginBottom: '20px' }}>
                                                                <Box sx={{ marginLeft: '15%', marginRight: '15%', marginBottom: '10px' }}>
                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                                        本契約内容の承認を依頼する人を選択、または入力してから「追加する」ボタンを押下してください。
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', width: '100%', marginTop: '10px', padding: '20px' }}>
                                                                    <Box sx={{ display: 'flex', width: '45%', marginLeft: '2%', marginRight: '5%' }}>
                                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                            <InputLabel id="internal_approver">自社承認者</InputLabel>
                                                                            <Select
                                                                                labelId="internal_authorizer-label"
                                                                                id="internal_approver"
                                                                                value={selectedInternalApprover}
                                                                                onChange={handleSelectChange_internalApprover}
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
                                                                                name="approval_flow.internal_approver_temp.user_name"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <TextField
                                                                                        {...field}
                                                                                        id="approval_flow.internal_approver_temp.user_name"
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
                                                                                name="approval_flow.internal_approver_temp.position"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <TextField
                                                                                        {...field}
                                                                                        id="approval_flow.internal_approver_temp.position"
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
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                            <Controller
                                                                                name="approval_flow.internal_approver_temp.email"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <TextField
                                                                                        {...field}
                                                                                        id="approval_flow.internal_approver_temp.email"
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
                                                                <Box sx={{ width: '100%' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginBottom: '10px' }}>
                                                                        <Button variant="contained" onClick={() => addInternalApprovers()} sx={{ marginBottom: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>追加する</Button>
                                                                        {isInternalApproverAdded && (
                                                                            <Button variant="contained" onClick={() => clearTempInternalApprover()} sx={{ marginBottom: '10px', marginLeft: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>クリア</Button>
                                                                        )}
                                                                    </Box>
                                                                    {isInternalApproverAdded && (
                                                                        <>
                                                                            <Box sx={{ backgroundColor: 'grey.200', border: '1px solid lightgray' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                    <Box sx={{ width: '90%', py: 2, paddingTop: '20px', paddingBottom: '20px' }}>
                                                                                        <ApproveFlowTable
                                                                                            isAuthorizerAdded={true}
                                                                                            selectedApproverData={selectedValuesForInternal}
                                                                                            user_name={getValues('approval_flow.internal_authorizer.user_name')}
                                                                                            position={getValues('approval_flow.internal_authorizer.position')}
                                                                                            email={getValues('approval_flow.internal_authorizer.email')}
                                                                                        />
                                                                                    </Box>
                                                                                </Box>
                                                                            </Box>
                                                                        </>
                                                                    )}
                                                                    {!isInternalApproverAdded && (
                                                                        <>
                                                                            <Box sx={{ backgroundColor: 'grey.200', border: '1px solid lightgray' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                    <Box sx={{ width: '90%', py: 2, paddingTop: '20px', paddingBottom: '20px' }}>
                                                                                        <AuthorizerTable
                                                                                            isAuthorizerAdded={true}
                                                                                            user_name={getValues('approval_flow.internal_authorizer.user_name')}
                                                                                            position={getValues('approval_flow.internal_authorizer.position')}
                                                                                            email={getValues('approval_flow.internal_authorizer.email')}
                                                                                        />
                                                                                    </Box>
                                                                                </Box>
                                                                            </Box>
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </TabPanel>
                                                        <TabPanel value={internalThemeValue} index={1} dir={internalTheme.direction}>
                                                            <Box sx={{ marginBottom: '20px' }}>
                                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
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
                                                                <Box sx={{ width: '100%' }}>
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
                                                    </Box>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Box>
                                    <Box sx={{ border: '2px solid lightgray' }}>
                                        <Accordion>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <Box sx={{ backgroundColor: '#1565c0', padding: '10px', width: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>相手方承認フロー設定</Typography>
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', width: '100px' }}>
                                                    <CheckCircleIcon sx={{ color: 'green', fontSize: '40px' }}></CheckCircleIcon>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box bgcolor='white' sx={{ flexGrow: 1, paddingLeft: '40px', paddingRight: '20px', paddingTop: '5px' }}>
                                                    <Box sx={{ marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }}>
                                                        <Typography sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                                            本設定項目は任意です。以下の注意事項に従ってユーザーを追加してください。<br />
                                                        </Typography>
                                                        <Typography sx={{ color: 'darkred', fontWeight: 'bold' }}>
                                                            承認フロー　　　：契約書への承認を依頼するユーザーを登録する<br />
                                                            完了通知の送付先：「社内承認の完了」「相手方と契約が締結」された際にメールを通知するユーザーを登録する（※承認依頼は送信されません）
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ width: '100%', paddingRight: '24px' }}>
                                                        <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <Tabs
                                                                    value={customerThemeValue}
                                                                    onChange={handleCustomerThemeValueChange}
                                                                    textColor="inherit"
                                                                    variant="fullWidth"
                                                                    aria-label="full width tabs example"
                                                                    sx={{
                                                                        backgroundColor: 'lightblue', // タブの背景色

                                                                        '& .MuiTab-root': {
                                                                            color: '#000', // タブのテキスト色
                                                                            fontWeight: 'bold', // タブのフォントウェイト
                                                                            fontSize: '24px', // タブのフォントサイズ
                                                                            width: '300px', // タブの幅
                                                                            height: '30px', // タブの高さ
                                                                            border: '0.5px solid gray', // タブのボーダー
                                                                        },
                                                                        '& .Mui-selected': {
                                                                            bgcolor: 'lightblue', // 選択されたタブのテキスト色
                                                                            border: '2px solidrgb(30, 32, 32)', // タブのボーダー
                                                                            backgroundColor: '#1565c0', // 選択されたタブの背景色
                                                                            color: 'white', // 選択されたタブのテキスト色
                                                                        },
                                                                        '& .MuiTabs-indicator': {
                                                                            backgroundColor: '#ff0000', // インジケーターの色
                                                                            height: '2px',
                                                                        },
                                                                    }}
                                                                >
                                                                    <Tab label="承認フロー" {...a11yProps(0)} />
                                                                    <Tab label="完了通知の送付先" {...a11yProps(1)} />
                                                                </Tabs>
                                                            </Box>
                                                        </AppBar>
                                                    </Box>
                                                    <Box sx={{ border: '2px solid lightgray', marginBottom: '20px', marginRight: '24px' }}>
                                                        <TabPanel value={customerThemeValue} index={0} dir={customerTheme.direction}>
                                                            <Box sx={{ marginBottom: '20px' }}>
                                                                <Box sx={{ marginLeft: '15%', marginRight: '15%', marginBottom: '10px' }}>
                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                                        本契約内容の承認を依頼する人を選択、または入力してから「追加する」ボタンを押下してください。
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', width: '100%', marginTop: '10px', padding: '20px' }}>
                                                                    <Box sx={{ display: 'flex', width: '45%', marginLeft: '2%', marginRight: '5%' }}>
                                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                            <InputLabel id="customer_approver">相手方承認者</InputLabel>
                                                                            <Select
                                                                                labelId="customer_authorizer-label"
                                                                                id="customer_approver"
                                                                                value={selectedCustomerApprover}
                                                                                onChange={handleSelectChange_customerApprover}
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
                                                                                name="approval_flow.customer_approver_temp.user_name"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <TextField
                                                                                        {...field}
                                                                                        id="approval_flow.customer_approver_temp.user_name"
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
                                                                                name="approval_flow.customer_approver_temp.position"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <TextField
                                                                                        {...field}
                                                                                        id="approval_flow.customer_approver_temp.position"
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
                                                                                name="approval_flow.customer_approver_temp.email"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <TextField
                                                                                        {...field}
                                                                                        id="approval_flow.customer_approver_temp.email"
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
                                                                <Box sx={{ width: '100%' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginBottom: '10px' }}>
                                                                        <Button variant="contained" onClick={() => addCustomerApprovers()} sx={{ marginBottom: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>追加する</Button>
                                                                        {isCustomerApproverAdded && (
                                                                            <Button variant="contained" onClick={() => clearTempCustomerApprover()} sx={{ marginBottom: '10px', marginLeft: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>クリア</Button>
                                                                        )}
                                                                    </Box>
                                                                    {isCustomerApproverAdded && (
                                                                        <>
                                                                            <Box sx={{ backgroundColor: 'grey.200', border: '1px solid lightgray' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                    <Box sx={{ width: '90%', py: 2, paddingTop: '20px', paddingBottom: '20px' }}>
                                                                                        <ApproveFlowTable
                                                                                            isAuthorizerAdded={true}
                                                                                            selectedApproverData={selectedValuesForCustomer}
                                                                                            user_name={getValues('approval_flow.customer_authorizer.user_name')}
                                                                                            position={getValues('approval_flow.customer_authorizer.position')}
                                                                                            email={getValues('approval_flow.customer_authorizer.email')}
                                                                                        />
                                                                                    </Box>
                                                                                </Box>
                                                                            </Box>
                                                                        </>
                                                                    )}
                                                                    {!isCustomerApproverAdded && (
                                                                        <>
                                                                            <Box sx={{ backgroundColor: 'grey.200', border: '1px solid lightgray' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                    <Box sx={{ width: '90%', py: 2, paddingTop: '20px', paddingBottom: '20px' }}>
                                                                                        <AuthorizerTable
                                                                                            isAuthorizerAdded={true}
                                                                                            user_name={getValues('approval_flow.customer_authorizer.user_name')}
                                                                                            position={getValues('approval_flow.customer_authorizer.position')}
                                                                                            email={getValues('approval_flow.customer_authorizer.email')}
                                                                                        />
                                                                                    </Box>
                                                                                </Box>
                                                                            </Box>
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </TabPanel>
                                                        <TabPanel value={customerThemeValue} index={1} dir={customerTheme.direction}>
                                                            <Box sx={{ marginBottom: '20px' }}>
                                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
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
                                                                                value={selectedCustomerApprover}
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
                                                                <Box sx={{ width: '100%' }}>
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
                                                    </Box>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                    <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                        <Typography>戻る</Typography>
                                    </Button>
                                    <Button variant="contained" onClick={handleSubmit(onPreview)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                        <Typography>確認する</Typography>
                                    </Button>
                                </Box>
                            </>
                        )
                        }
                        {
                            isPreviewVisible && (
                                <>
                                    <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '20px', fontSize: '1.5em' }}>
                                        こちらの内容で更新します。よろしいですか？
                                    </Typography>
                                    <Box sx={{ marginTop: '20px' }}>
                                        <Box sx={{ width: '100%', marginBottom: '20px', bgcolor: "white", padding: '20px', border: '1px solid lightgray' }}>
                                            <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>基本情報</Typography>
                                            </Box>
                                            <CommonTextField value={getValues('type')} label="契約書種別" />
                                            <CommonTextField value={getValues('deal_amount').toLocaleString() + '円'} label="取引金額" />
                                            <CommonTextField value={dayjs(getValues('conclusion_date')).format('YYYY-MM-DD')} label="契約開始日" />
                                            <CommonTextField value={dayjs(getValues('expiration_date')).format('YYYY-MM-DD')} label="契約終了日" />
                                            <CommonTextField value={`${Number(getValues('approval_flow.submission_period'))}日`} label="署名用URL有効期限（相手方企業向け）" />
                                        </Box>
                                        <PreviewApproveFlow internalApproveFlow={previewInternal} customerApproveFlow={previewCustomer} />
                                        <PreviewBeforeStartApproveFlowNotifier internalNotifier={selectedValuesForInternalNotifier} customerNotifier={selectedValuesForCustomerNotifier} />
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
                            )
                        }
                    </Box >
                    <Footer />
                </Box >
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}

export default ModifyHome;