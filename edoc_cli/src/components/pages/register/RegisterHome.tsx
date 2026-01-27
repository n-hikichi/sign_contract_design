import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, CssBaseline, Fab, IconButton, FormControl, InputAdornment, InputLabel, MenuItem, Modal, RadioGroup, Radio, Select, SelectChangeEvent, TextField, List, ListItem, ListItemText, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomPulldownMenu, { contractType, CustomPulldownMenu_ForPrefecture, CustomPulldownMenu_SignTemplate, effectiveDate, representativeSealSelectType } from '../../../components/elements/CustomPulldownMenu';
import { readOnlyTextFieldPaddingLessStyle } from '../../../styles/fontStyles';
import { baseTextFieldStyle, parentTextFieldStyle, registerHomeInputErrorDialogStyle } from '../../../styles/styles';
import api from '../../../utils/apiAccessor';
import apiExecutor from "../../../utils/apiExecutor";
import apiStatus from "../../../utils/apiStatus";
import converter from "../../../utils/converter";
import validationRules from '../../../utils/validationRules';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import { PreviewApproveFlowForRegister, PreviewApproveFlow_forNotifier } from '../common/PreviewApproveFlow';
import PreviewRegisterBasicInfo from '../common/PreviewRegisterBasicInfo';
import ErrorDialog from '../common/ErrorDialog';
import ApiProcessingDialog from "../common/ApiProcessingDialog";
import ApproveFlowTable, { AuthorizerTable, ApproveFlowTableWithDeleteButton } from "../common/ApproveFlowTable";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ClientSideErrorDialog from '../common/ClientSideErrorDialog';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WorkFlowView from './WorkFlowView';

import awsconfig_generativeai from '../../../aws-exports';

const getTableHeaderStyle = () => ({
    fontWeight: 'bold',
    fontSize: '20px',
    paddingTop: '10px',
    paddingBottom: '10px'
});

const getTableCellStyle = () => ({
    fontWeight: 'bold',
    fontSize: '16px',
    paddingTop: '10px',
    paddingBottom: '10px',
});

interface User {
    user_id: string,
    email: string,
    location_id: string,
    position: string,
    user_name: string,
    company_name: string,
    file: string,
};

// 承認者の情報
interface Approver {
    // 会社名
    company_name: string,
    // 役職
    position: string,
    // 氏名
    user_name: string,
    // メールアドレス
    email: string,
};

interface ApproveUser {
    user_name: string;
    position: string;
    email: string;
};

// 承認者の初期値
const initialApprover: Approver = {
    user_name: '',
    company_name: '',
    position: '',
    email: '',
};

const initialApprovers: Approver[] = [initialApprover];

// フォームの入力値
interface FormInput {
    title: string,
    file_name: string,
    file: string,
    internal_seal: string,
    internal_seal_temp: string,
    customer_seal: string,
    customer_seal_temp: string,
    own_company: CompanyInfo,
    customer_company: CompanyInfo,
    type: string,
    deal_amount: number,
    conclusion_date: Dayjs | null,
    expiration_date: Dayjs | null,
    template_id: string,
    approval_flow: {
        // internal_pic: User,
        // internal_approver: User[],
        // internal_approver_temp: User,
        // internal_authorizer: User,
        // internal_notifier: User[],
        // internal_notifier_temp: User,
        // customer_pic: User,
        // customer_approver: User[],
        // customer_approver_temp: User,
        // customer_authorizer: User,
        // customer_notifier: User[],
        // customer_notifier_temp: User,
        internal_pic: Approver,
        internal_approver: Approver[],
        internal_approver_temp: Approver,
        internal_authorizer: Approver,
        internal_notifier: Approver[],
        internal_notifier_temp: Approver,
        customer_pic: Approver,
        customer_approver: Approver[],
        customer_approver_temp: Approver,
        customer_authorizer: Approver,
        customer_notifier: Approver[],
        customer_notifier_temp: Approver,
        submission_period: number,
    }
};

// フォームの入力値
interface ApproverForm {
    user_name: string,
    position: string,
    email: string,
};

interface CompanyInfo {
    company_id: string;
    company_name: string;
    postal_code: string;
    state: string;
    city: string;
    address_line: string;
    building: string;
};

interface Company {
    company_id: string;
    company_type: string;
    company_name: string;
    postal_code: string;
    state: string;
    city: string;
    address_line: string;
    building: string;
};

interface Location {
    location_id: string;
    company_id: string;
    location_name: string;
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
    file: string,
}

interface SignTemplate {
    template_id: string,
    template_name: string,
    type: string,
}

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

const RegisterHome: React.FC<{}> = () => {
    const navigate = useNavigate();

    // 一覧画面で選択した契約書の情報を取得する
    const location = useLocation();

    /***
     *
     * React hooks
     *
     */
    // ローディング中を表すフラグ
    const [isLoading, setIsLoading] = useState(false);

    // 入力画面・プレビュー画面を切り替えるフラグ
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    // 自社拠点一覧
    const [internalLocationList, setInternalLocationList] = useState<Location[]>([]);
    // 自社承認ユーザー一覧
    const [internalUserList, setInternalUserList] = useState<RegisterdUserInfo[]>([]);

    // 顧客拠点一覧
    const [customerLocationList, setCustomerLocationList] = useState<Location[]>([]);
    // 顧客承認ユーザー一覧
    const [customerUserList, setCustomerUserList] = useState<RegisterdUserInfo[]>([]);

    // 署名テンプレートリスト
    const [signTemplateList, setSignTemplateList] = useState<SignTemplate[]>([]);

    // 代表印（自社）
    const [internalRepresentativeSealMap, setInternalRepresentativeSealMap] = useState<Map<string, string>>(new Map());
    // 代表印（相手方）
    const [customerRepresentativeSealMap, setCustomerRepresentativeSealMap] = useState<Map<string, string>>(new Map());

    // API処理中ダイアログ：エラーダイアログの開閉状態
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);

    // API実行失敗ダイアログ
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);

    /***
     *
     * 契約書アップロード
     *
     */
    // ファイル名
    const [fileName, setFileName] = useState<string | null>(null);
    // ファイル情報
    const [file, setFile] = useState<File>();
    // ファイルアップロード状況
    const [fileUploaded, setFileUploaded] = useState(false);
    // ドロップされたファイルを処理します。ここでは最初のファイルだけを扱います。
    const onDropPdfFile = useCallback((acceptedFiles: File[]) => {
        handleFileUpload(acceptedFiles);
    }, []);
    const { getRootProps: getRootPropsPdfFile, getInputProps: getInputPropsPdfFile, isDragActive: isDragActivePdfFile } = useDropzone({ onDrop: onDropPdfFile });

    /***
     *
     * 契約基本情報設定フィールド
     *
     */
    // 契約種別
    const [selectedValue, setSelectedValue] = useState<string>('');
    // 署名テンプレート
    const [selectedValueSignTemplateName, setSelectedValueSignTemplateName] = useState<string>('');
    const [selectedValueSignTemplateId, setSelectedValueSignTemplateId] = useState<string>('');
    // 取引金額
    const inputRef = useRef<HTMLInputElement>(null);
    // 署名用URL有効期限
    const [selectedValueUrlExpirationDate, setSelectedValueUrlExpirationDate] = useState<string>('');

    /***
     *
     * 企業所在地設定フィールド
     * 
     */
    // 自社企業名（必須フィールド）チェック
    const [isSetInternalCompanyName, setIsSetInternalCompanyName] = useState(false);
    // 自社情報
    const [selectedInternalLocation, setSelectedInternalLocation] = useState('');

    // 顧客企業名（必須フィールド）チェック
    const [isSetCustomerCompanyName, setIsSetCustomerCompanyName] = useState(false);
    // 顧客情報
    const [selectedCustomerLocation, setSelectedCustomerLocation] = useState('');

    /***
     *
     * 契約担当者設定（自社）
     * 
     */
    // バリデーションフラグ
    const [isInternalPicInpuTFormValid, setIsInternalPicInpuTFormValid] = useState(false);
    const [isCustomerPicInpuTFormValid, setIsCustomerPicInpuTFormValid] = useState(false);
    // プルダウンメニューの選択肢
    const [selectedInternalPic, setSelectedInternalPic] = useState('');
    // チェックボックスの状態管理
    const [isChecked_internalPic, setIsChecked_internalPic] = useState(false);
    const [isChecked_internalSeal, setIsChecked_internalSeal] = useState(false);

    /***
     *
     * 契約担当者設定（顧客）
     * 
     */
    const [selectedCustomerPic, setSelectedCustomerPic] = useState('');
    // チェックボックスの状態管理
    const [isChecked_customerPic, setIsChecked_customerPic] = useState(false);
    const [isChecked_customerSeal, setIsChecked_customerSeal] = useState(false);

    /***
     *
     * 契約代表者設定（自社）
     * 
     */
    // バリデーションフラグ
    const [isInternalAuthorizerInpuTFormValid, setIsInternalAuthorizerInpuTFormValid] = useState(false);
    const [isCustomerAuthorizerInpuTFormValid, setIsCustomerAuthorizerInpuTFormValid] = useState(false);
    // プルダウンメニューの選択肢
    const [selectedInternalAuthorizer, setSelectedInternalAuthorizer] = useState('');
    // ファイルアップロード状況
    const [internalSealFileUploaded, setInternalSealFileUploaded] = useState(false);
    const [selectedPdfPreview_internal, setSelectedPdfPreview_internal] = useState<string>('');
    const [selectedRepresentativeSeal_internal, setSelectedRepresentativeSeal_internal] = useState('');

    /***
     *
     * 契約代表者設定（顧客）
     * 
     */
    const [selectedCustomerAuthorizer, setSelectedCustomerAuthorizer] = useState('');
    // ファイルアップロード状況
    const [customerSealFileUploaded, setCustomerSealFileUploaded] = useState(false);
    const [selectedPdfPreview_customer, setSelectedPdfPreview_customer] = useState<string>('');
    const [selectedRepresentativeSeal_customer, setSelectedRepresentativeSeal_customer] = useState('');

    /***
     *
     * 承認フロー設定
     * 
     */
    // ユーザーロール選択タブ制御（自社）
    const internalTheme = useTheme();
    const [internalThemeValue, setInternalThemeValue] = React.useState(0);

    // ユーザーロール選択タブ制御（顧客）
    const customerTheme = useTheme();
    const [customerThemeValue, setCustomerThemeValue] = React.useState(0);

    /***
     *
     * 承認フロー設定（承認者）：自社
     * 
     */
    const [internalApprovers, setInternalApprovers] = useState<any[]>([]);
    const [selectedInternalApprover, setSelectedInternalApprover] = useState('');
    const [selectedValuesForInternalApprover, setSelectedValuesForInternalApprover] = useState<any[]>([]);
    const [isInternalApproverAdded, setIsInternalApproverAdded] = useState(false);

    /***
     *
     * 承認フロー設定（関係者）：自社
     * 
     */
    const [internalNotifiers, setInternalNotifiers] = useState<any[]>([]);
    const [selectedInternalNotifier, setSelectedInternalNotifier] = useState('');
    const [selectedValuesForInternalNotifier, setSelectedValuesForInternalNotifier] = useState<any[]>([]);
    const [isInternalNotifierAdded, setIsInternalNotifierAdded] = useState(false);

    /***
     *
     * 承認フロー設定（承認者）：相手方
     * 
     */
    // プルダウンメニューで選択した値
    const [selectedCustomerApprover, setSelectedCustomerApprover] = useState('');
    const [customerApprovers, setCustomerApprovers] = useState<any[]>([]);
    const [selectedValuesForCustomerApprover, setSelectedValuesForCustomerApprover] = useState<any[]>([]);
    const [isCustomerApproverAdded, setIsCustomerApproverAdded] = useState(false);

    /***
     *
     * 承認フロー設定（関係者）：相手方
     * 
     */
    // プルダウンメニューで選択した値
    const [selectedCustomerNotifier, setSelectedCustomerNotifier] = useState('');
    const [customerNotifiers, setCustomerNotifiers] = useState<any[]>([]);
    const [selectedValuesForCustomerNotifier, setSelectedValuesForCustomerNotifier] = useState<any[]>([]);
    const [isCustomerNotifierAdded, setIsCustomerNotifierAdded] = useState(false);

    /***
     *
     * 承認フロー設定（情報のマージ）
     * 
     */
    const [previewInternal, setPreviewInternal] = useState<ApproveFlowListColumns[]>([]);
    const [previewCustomer, setPreviewCustomer] = useState<ApproveFlowListColumns[]>([]);

    /***
     *
     * 自社代表印：選択中ユーザー印情報
     * 
     */
    const [selectedInternalSeal, setSelectedInternalSeal] = useState<string>('');
    const [selectedCustomerSeal, setSelectedCustomerSeal] = useState<string>('');

    /***
     *
     * 相手方代表印：選択中代表印情報
     * 
     */
    const [selectedInternalRepresentativeSealName, setSelectedInternalRepresentativeSealName] = useState<string>('');
    const [selectedCustomerRepresentativeSealName, setSelectedCustomerRepresentativeSealName] = useState<string>('');
    const [selectedInternalRepresentativeSealFile, setSelectedInternalRepresentativeSealFile] = useState<string>('');
    const [selectedCustomerRepresentativeSealFile, setSelectedCustomerRepresentativeSealFile] = useState<string>('');

    /***
     *
     * 登録済み承認フローリスト
     * 
     */
    const [selectedInternalApprovalFlowTemplate, setSelectedInternalApprovalFlowTemplate] = useState<any[]>([]);
    const [selectedCustomerApprovalFlowTemplate, setSelectedCustomerApprovalFlowTemplate] = useState<any[]>([]);

    /***
     *
     * 自社代表者：代表印アップロード
     * 2025年6月時点では代表印のアップロード機能は搭載していない
     *
     */
    // const onDropInternalSeal = useCallback((acceptedFiles: File[]) => {
    //     handleInternalSealFileUpload(acceptedFiles);
    // }, []);
    // const { getRootProps: getRootPropsInternalSeal, getInputProps: getInputPropsInternalSeal, isDragActive: isDragActiveInternalSeal } = useDropzone({ onDrop: onDropInternalSeal });
    const [selectType_internal, setSelectType_internal] = useState(representativeSealSelectType[0].value);

    /***
     *
     * 相手方代表者：代表印アップロード
     *
     */
    // const onDropCustomerSeal = useCallback((acceptedFiles: File[]) => {
    //     handleCustomerSealFileUpload(acceptedFiles);
    // }, []);
    // const { getRootProps: getRootPropsCustomerSeal, getInputProps: getInputPropsCustomerSeal, isDragActive: isDragActiveCustomerSeal } = useDropzone({ onDrop: onDropCustomerSeal });

    const [selectType_customer, setSelectType_customer] = useState(representativeSealSelectType[0].value);

    /***
     *
     * 相手方代表者：代表者印アップロード
     *
     */
    const [openWorkFlowDialog, setOpenWorkFlowDialog] = useState(false);
    const [dialogType, setDialogType] = useState<'INTERNAL' | 'CUSTOMER' | null>(null);

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        setIsLoading(true);

        const fetchData = async () => {
            try {
                // 並列実行するAPIを設定
                const requests: Promise<Response>[] = [
                    apiExecutor.fetchGetLocationList(internalCompany_data.company_id),
                    apiExecutor.fetchGetUserData(internalCompany_data.company_id),
                    apiExecutor.fetchGetLocationList(customer_id),
                    apiExecutor.fetchGetUserData(customer_id),
                    apiExecutor.fetchGetSignedTemplateList(),
                    apiExecutor.fetchGetApprovalFlowList(internalCompany_data.company_id),
                    apiExecutor.fetchGetApprovalFlowList(customer_id)
                ];

                // APIを並列実行
                const responses = await Promise.all(requests);

                // ステータスコードが200以外の場合の処理
                const errorResponse = responses.find((res: Response) => res.status !== 200);
                if (errorResponse) {
                    setErrorCode(errorResponse.status);
                    setErrorProcess('契約書登録　情報取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const [
                    internalLocation,
                    internalUser,
                    customerLocation,
                    customerUser,
                    signedTemplate,
                    internalApprovalFlowTemplate,
                    customerApprovalFlowTemplate
                ] = await Promise.all(responses.map((res: Response) => res.json()));

                if (internalLocation.length > 0) {
                    // 自社拠点一覧を設定
                    setInternalLocationList(internalLocation);

                    // 初期値としてインデックス0の値を設定
                    setSelectedInternalLocation(internalLocation[0].location_name);
                    setValue('own_company.company_name', internalLocation[0].company_name);
                    setValue('own_company.postal_code', internalLocation[0].postal_code);
                    setValue('own_company.state', internalLocation[0].state);
                    setValue('own_company.city', internalLocation[0].city);
                    setValue('own_company.address_line', internalLocation[0].address_line);
                    setValue('own_company.building', internalLocation[0].building);

                    // デフォルト値が取得できた場合は企業名設定済み
                    setIsSetInternalCompanyName(true);
                };

                // internalUserをisRepresentativeSealがtrue/falseで分割
                const { internalTrueList, internalFalseList } = internalUser.reduce(
                    (userList: { internalTrueList: typeof internalUser; internalFalseList: typeof internalUser }, user: any) => {
                        if (user.isRepresentativeSeal) {
                            userList.internalTrueList.push(user);
                        } else {
                            userList.internalFalseList.push(user);
                        }
                        return userList;
                    },
                    { internalTrueList: [], internalFalseList: [] }
                );

                // 登録済みユーザー情報を追加する
                setInternalUserList(internalFalseList);

                // 登録済み代表印がある場合は追加する
                if (internalTrueList.length > 0) {
                    internalTrueList.forEach((user: { user_name: string; file: string }) => {
                        internalRepresentativeSealMap.set(user.user_name, user.file);
                        setInternalRepresentativeSealMap(new Map(internalRepresentativeSealMap));
                    });
                };

                if (customerLocation.length > 0) {
                    // 顧客拠点一覧を設定
                    setCustomerLocationList(customerLocation);

                    // 初期値としてインデックス0の値を設定
                    setSelectedCustomerLocation(customerLocation[0].location_name);
                    setValue('customer_company.company_name', customerLocation[0].company_name);
                    setValue('customer_company.postal_code', customerLocation[0].postal_code);
                    setValue('customer_company.state', customerLocation[0].state);
                    setValue('customer_company.city', customerLocation[0].city);
                    setValue('customer_company.address_line', customerLocation[0].address_line);
                    setValue('customer_company.building', customerLocation[0].building);

                    // デフォルト値が取得できた場合は企業名設定済み
                    setIsSetCustomerCompanyName(true);
                };

                // customerUserをisRepresentativeSealがtrue/falseで分割
                const { customerTrueList, customerFalseList } = customerUser.reduce(
                    (userList: { customerTrueList: typeof customerUser; customerFalseList: typeof customerUser }, user: any) => {
                        if (user.isRepresentativeSeal) {
                            userList.customerTrueList.push(user);
                        } else {
                            userList.customerFalseList.push(user);
                        }
                        return userList;
                    },
                    { customerTrueList: [], customerFalseList: [] }
                );

                // 登録済みユーザー情報を追加する
                setCustomerUserList(customerFalseList);

                // 登録済み代表印がある場合は追加する
                if (customerTrueList.length > 0) {
                    customerTrueList.forEach((user: { user_name: string; file: string }) => {
                        customerRepresentativeSealMap.set(user.user_name, user.file);
                        setCustomerRepresentativeSealMap(new Map(customerRepresentativeSealMap));
                    });
                };

                // 署名テンプレートリストを設定
                setSignTemplateList(signedTemplate);
                setSelectedValueSignTemplateId(signedTemplate[0].template_id);
                setSelectedValueSignTemplateName(signedTemplate[0].template_name);

                // 登録済み承認フローリストを設定
                setSelectedInternalApprovalFlowTemplate(internalApprovalFlowTemplate);
                setSelectedCustomerApprovalFlowTemplate(customerApprovalFlowTemplate);

            } catch (error) {
                console.error('Error fetching data:', error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('契約書登録　情報取得処理');
                setExecuteFailedApiDialogOpen(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // フォームの入力値
    const { control, setValue, getValues, handleSubmit } = useForm<FormInput>(
        {
            defaultValues: {
                title: '',
                file_name: '',
                file: '',
                internal_seal: '',
                internal_seal_temp: '',
                customer_seal: '',
                customer_seal_temp: '',
                own_company: {
                    company_id: location?.state?.internalInfo?.company_id ?? '',
                    company_name: '',
                    postal_code: '',
                    state: '',
                    city: '',
                    address_line: '',
                    building: ''
                },
                customer_company: {
                    company_id: location?.state?.selectedValue ?? '',
                    company_name: '',
                    postal_code: '',
                    state: '',
                    city: '',
                    address_line: '',
                    building: ''
                },
                type: contractType[0].value,
                deal_amount: 0,
                conclusion_date: dayjs(),
                expiration_date: dayjs().add(1, 'year').subtract(1, 'day'),
                template_id: location?.state?.signTemplateList?.[0]?.template_id ?? '',
                approval_flow: {
                    internal_pic: initialApprover,
                    internal_approver: initialApprovers,
                    internal_approver_temp: initialApprover, // 登録リクエストを送信する際に削除する
                    internal_authorizer: initialApprover,
                    internal_notifier: initialApprovers,
                    internal_notifier_temp: initialApprover,
                    customer_pic: initialApprover,
                    customer_approver: initialApprovers,
                    customer_approver_temp: initialApprover, // 登録リクエストを送信する際に削除する
                    customer_authorizer: initialApprover,
                    customer_notifier: initialApprovers,
                    customer_notifier_temp: initialApprover,
                    submission_period: 1,
                }
            }
        }
    );

    /***
     * 
     * API処理中ダイアログ
     * 
     */
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false); // ダイアログを閉じる
    const openExecuteApiDialogDialog = () => setExecuteApiDialogOpen(true); // ダイアログを開く関数

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false); // ダイアログを閉じる
    const openExecuteApiErrorDialogDialog = () => setExecuteFailedApiDialogOpen(true); // ダイアログを開く関数

    const [open, setOpen] = React.useState(true);

    /***
     * 
     * API処理中ダイアログ
     * 
     */
    const [hErrorDialog, sethErrorDialogOpen] = useState(false);
    const hErrorDialogClose = () => sethErrorDialogOpen(false); // ダイアログを閉じる
    const openhErrorDialogDialog = () => sethErrorDialogOpen(true); // ダイアログを開く関数

    useEffect(() => {
        if (!location.state) {
            sethErrorDialogOpen(true);
        }
    }, [location.state]);

    let internalCompany_data = location?.state?.internalInfo;
    let customer_id = location?.state?.selectedValue;
    let customer_data = location?.state?.selectedCompanyData;
    let sign_template_list = location?.state?.signTemplateList;

    // if (!location.state || !location.state.internalInfo) {
    //     // 例: エラー画面へ遷移、またはエラーメッセージを表示
    //     sethErrorDialogOpen(true);
    // };

    /***
     *
     * 契約書アップロード
     *
     */
    const handleFileUpload = (files: File[]) => {

        // // Base64エンコードするソースコード（Debug用）
        // if (files.length === 0) return;

        // const file = files[0];
        // const reader = new FileReader();

        // reader.onloadend = () => {
        //     const base64String = reader.result as string;
        //     console.log('↓Base64Encode');
        //     console.log(base64String); // base64文字列をコンソールに出力（必要に応じて処理を追加）
        // };

        // reader.readAsDataURL(file);

        const file = files[0];
        if (file) {
            setFileName(file.name);
            // ファイル名を件名として使用する
            let fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');

            setValue('title', fileNameWithoutExtension);
            setValue('file_name', file.name);
            setFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                let base64String = reader.result as string;
                // プレフィックスを取り除く
                base64String = base64String.replace(/^data:application\/pdf;base64,/, '');
                setValue('file', base64String);
            };
            reader.readAsDataURL(file);

            setFileUploaded(true);
        }
    };

    /***
     *
     * 契約基本情報設定フィールド
     *
     */
    // 契約種別
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        setSelectedValue(event.target.value as string);
        setValue('type', event.target.value);
    };

    // 署名テンプレート
    const handleSelectChangeSignTemplate = (event: SelectChangeEvent<string>) => {
        setSelectedValueSignTemplateId(event.target.value as string);
        setValue('template_id', event.target.value);

        const selectedTemplate = signTemplateList.find(template => template.template_id === event.target.value);
        setSelectedValueSignTemplateName(selectedTemplate?.template_name || '');
    };

    // 取引金額
    const formatNumber = (value: any) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

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
    const handleSelectedValueUrlExpirationDate = (event: SelectChangeEvent<string>) => {
        setSelectedValueUrlExpirationDate(event.target.value);
        setValue('approval_flow.submission_period', Number(event.target.value));
    };

    /***
     *
     * 企業所在地設定フィールド
     * 
     */
    // 自社企業名（必須フィールド）チェック

    const handleSelectChange_internalCompany = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedInternalLocation(selectedValue);

        const selectedCompany = internalLocationList.find(location => location.location_name === event.target.value);
        if (selectedCompany) {
            setValue('own_company.company_id', selectedCompany.company_id);
            setValue('own_company.company_name', selectedCompany.company_name);
            setValue('own_company.postal_code', selectedCompany.postal_code);
            setValue('own_company.state', selectedCompany.state);
            setValue('own_company.city', selectedCompany.city);
            setValue('own_company.address_line', selectedCompany.address_line);
            setValue('own_company.building', selectedCompany.building);

            setIsSetInternalCompanyName(true);
        }
    };

    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleBlurForInternalCompanyName = () => {
        // フォームの入力値をチェック
        const company_name = getValues('own_company.company_name');

        if (company_name === '') {
            setIsSetInternalCompanyName(false);
        } else {
            setIsSetInternalCompanyName(true);
        }
    };

    const handleSelectChange_customerCompany = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedCustomerLocation(selectedValue);

        const selectedCompany = customerLocationList.find(location => location.location_name === event.target.value);
        if (selectedCompany) {
            setValue('customer_company.company_id', selectedCompany.company_id);
            setValue('customer_company.company_name', selectedCompany.company_name);
            setValue('customer_company.postal_code', selectedCompany.postal_code);
            setValue('customer_company.state', selectedCompany.state);
            setValue('customer_company.city', selectedCompany.city);
            setValue('customer_company.address_line', selectedCompany.address_line);
            setValue('customer_company.building', selectedCompany.building);

            setIsSetCustomerCompanyName(true);
        }
    };

    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleBlurForCustomerCompanyName = () => {
        // フォームの入力値をチェック
        const company_name = getValues('customer_company.company_name');

        if (company_name === '') {
            setIsSetCustomerCompanyName(false);
        } else {
            setIsSetCustomerCompanyName(true);
        }
    };

    // 郵便番号入力フォーマット
    const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        event.target.value = converter.postalCodeConverter(event.target.value);
    };

    // ---------------------------------------- //
    // ---       契約担当者設定（自社）       --- //
    // ---------------------------------------- //
    /***
     *
     * フォームの入力チェック
     * user_name, emailの入力値が全て入力済みかチェックする
     * posiitonは任意入力のためチェックしない
     *
     */
    const isPicInputComplete = () => {
        const internalPicUserName = getValues('approval_flow.internal_pic.user_name');
        const internalPicEmail = getValues('approval_flow.internal_pic.email');
        const customerPicUserName = getValues('approval_flow.customer_pic.user_name');
        const customerPicEmail = getValues('approval_flow.customer_pic.email');

        // 必須フィールド（担当者／代表者）が全て入力済みか判定する
        if (internalPicUserName && internalPicEmail) {
            setIsInternalPicInpuTFormValid(true);
        } else {
            setIsInternalPicInpuTFormValid(false);
        }

        // 必須フィールド（担当者／代表者）が全て入力済みか判定する
        if (customerPicUserName && customerPicEmail) {
            setIsCustomerPicInpuTFormValid(true);
        } else {
            setIsCustomerPicInpuTFormValid(false);
        }
    };

    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleBlurForPicInputForm = () => {
        // フォームの入力値をチェック
        isPicInputComplete();
    };

    // プルダウンメニューのイベントハンドラ
    const handleSelectChange_internalPic = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedInternalPic(selectedValue);

        const selectedUser = internalUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            // 自社担当者フィールドに値を設定する
            setValue('approval_flow.internal_pic.user_name', selectedUser.user_name);
            setValue('approval_flow.internal_pic.company_name', getValues().own_company.company_name);
            setValue('approval_flow.internal_pic.position', selectedUser.position);
            setValue('approval_flow.internal_pic.email', selectedUser.email);
            setSelectedInternalSeal(selectedUser.file || '');

            // 担当者を代表者として指定する場合は、代表者情報にも設定する
            if (isChecked_internalPic) {
                setInternalPicTextField(selectedUser);
                // 代表者の入力フォームをチェック
                isAuthorizerInputComplete();
            };

            // フォームの入力値をチェック
            isPicInputComplete();
        };
    };

    // 担当者を代表者として設定する
    const setInternalPicTextField = (selectedUser: RegisterdUserInfo) => {

        setValue('approval_flow.internal_authorizer.user_name', selectedUser.user_name);
        setValue('approval_flow.internal_authorizer.company_name', getValues().own_company.company_name);
        setValue('approval_flow.internal_authorizer.position', selectedUser.position);
        setValue('approval_flow.internal_authorizer.email', selectedUser.email);

        // 代表印として「ユーザー情報」を利用する場合
        if (selectType_internal === 'useUserSeal') {
            if (selectedUser.file) { // ユーザー印が登録されている場合
                setValue('internal_seal_temp', selectedUser.file); // 画面に表示される印影情報を更新する
                setSelectedInternalSeal(selectedUser.file); // ユーザーの印影情報を保持する
                setIsChecked_internalSeal(true);
            } else { // ユーザー印が登録されていない場合
                setValue('internal_seal_temp', ''); // 画面に表示される印影情報を空にする
                setSelectedInternalSeal(''); // ユーザーの印影情報を空にする
                setIsChecked_internalSeal(false); // チェックボックスをオフにする
            };
        };

        // 代表印として「共通印」を利用する場合
        if (selectType_internal === 'useRepresentativeSeal') {
            if (selectedUser.file) { // ユーザー印が登録されている場合
                setSelectedInternalSeal(selectedUser.file); // ユーザーの印影情報を保持する
                setIsChecked_internalSeal(true);
            } else { // ユーザー印が登録されていない場合
                setSelectedInternalSeal(''); // ユーザーの印影情報を空にする
                setIsChecked_internalSeal(false); // チェックボックスをオフにする
            };
        };
    };

    // 「本契約の代表者として指定する」：チェックボックス状態を管理する
    // 自社担当者を代表者として設定するかを管理する
    const handleCheckboxChange_internalPic = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked_internalPic(event.target.checked);

        if (!event.target.checked) {
            setValue('internal_seal_temp', ''); // 現在画面に表示されている代表者の印影
            setValue('approval_flow.internal_authorizer.user_name', '');
            setValue('approval_flow.internal_authorizer.company_name', '');
            setValue('approval_flow.internal_authorizer.position', '');
            setValue('approval_flow.internal_authorizer.email', '');
            setSelectedInternalSeal(''); // 直近で選択されていた代表印の印影

            setIsChecked_internalSeal(false);
        } else {
            const user_name = getValues('approval_flow.internal_pic.user_name');
            const email = getValues('approval_flow.internal_pic.email');
            const position = getValues('approval_flow.internal_pic.position');
            const company_name = getValues('approval_flow.internal_pic.company_name');

            setValue('approval_flow.internal_authorizer.user_name', user_name);
            setValue('approval_flow.internal_authorizer.company_name', company_name);
            setValue('approval_flow.internal_authorizer.position', position);
            setValue('approval_flow.internal_authorizer.email', email);

            const userFile = internalUserList.find(user => user.user_name === user_name)?.file;

            // 代表印が登録されているユーザーの場合に設定
            if (userFile) {
                setValue('internal_seal_temp', userFile);
                setSelectedInternalSeal(userFile);
                setIsChecked_internalSeal(true);

                // 選択中の代表印を退避
                setSelectedInternalRepresentativeSealFile(userFile);
            } else {
                setSelectedInternalRepresentativeSealFile('');
            };
        };

        // 担当者の入力フォームをチェック
        isPicInputComplete();

        // 代表者の入力フォームをチェック
        isAuthorizerInputComplete();
    };

    // ---------------------------------------- //
    // ---       契約担当者設定（顧客）       --- //
    // ---------------------------------------- //
    /***
     *
     * 相手方担当者
     *
     */
    // プルダウンメニューのイベントハンドラ
    const handleSelectChange_customerPic = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedCustomerPic(selectedValue);

        const selectedUser = customerUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.customer_pic.user_name', selectedUser.user_name);
            setValue('approval_flow.customer_pic.company_name', getValues().customer_company.company_name);
            setValue('approval_flow.customer_pic.position', selectedUser.position);
            setValue('approval_flow.customer_pic.email', selectedUser.email);
            setSelectedCustomerSeal(selectedUser.file || '');

            // 担当者を代表者として指定する場合は、代表者情報にも設定する
            if (isChecked_customerPic) {
                setCustomerPicTextField(selectedUser);
                // 代表者の入力フォームをチェック
                isAuthorizerInputComplete();
            };

            // フォームの入力値をチェック
            isPicInputComplete();
        }
    };

    // 担当者を代表者として設定する
    const setCustomerPicTextField = (selectedUser: RegisterdUserInfo) => {

        setValue('approval_flow.customer_authorizer.user_name', selectedUser.user_name);
        setValue('approval_flow.customer_authorizer.company_name', getValues().own_company.company_name);
        setValue('approval_flow.customer_authorizer.position', selectedUser.position);
        setValue('approval_flow.customer_authorizer.email', selectedUser.email);

        // 代表印として「ユーザー情報」を利用する場合
        if (selectType_customer === 'useUserSeal') {
            if (selectedUser.file) { // ユーザー印が登録されている場合
                setValue('customer_seal_temp', selectedUser.file); // 画面に表示される印影情報を更新する
                setSelectedCustomerSeal(selectedUser.file); // ユーザーの印影情報を保持する
                setIsChecked_customerSeal(true);
            } else { // ユーザー印が登録されていない場合
                setValue('customer_seal_temp', ''); // 画面に表示される印影情報を空にする
                setSelectedCustomerSeal(''); // ユーザーの印影情報を空にする
                setIsChecked_customerSeal(false); // チェックボックスをオフにする
            };
        };

        // 代表印として「共通印」を利用する場合
        if (selectType_customer === 'useRepresentativeSeal') {
            if (selectedUser.file) { // ユーザー印が登録されている場合
                setSelectedCustomerSeal(selectedUser.file); // ユーザーの印影情報を保持する
                setIsChecked_customerSeal(true);
            } else { // ユーザー印が登録されていない場合
                setSelectedCustomerSeal(''); // ユーザーの印影情報を空にする
                setIsChecked_customerSeal(false); // チェックボックスをオフにする
            };
        };
    };

    // 承認者情報に関する処理
    // チェックボックスの状態を更新する
    const handleCheckboxChange_customerPic = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked_customerPic(event.target.checked);

        if (!event.target.checked) {
            setValue('customer_seal_temp', '');
            setValue('approval_flow.customer_authorizer.user_name', '');
            setValue('approval_flow.customer_authorizer.company_name', '');
            setValue('approval_flow.customer_authorizer.position', '');
            setValue('approval_flow.customer_authorizer.email', '');
            setSelectedCustomerSeal(''); // 直近で選択されていた代表印の印影

            setIsChecked_customerSeal(false);
        } else {
            const user_name = getValues('approval_flow.customer_pic.user_name');
            const email = getValues('approval_flow.customer_pic.email');
            const position = getValues('approval_flow.customer_pic.position');
            const company_name = getValues('approval_flow.customer_pic.company_name');

            setValue('approval_flow.customer_authorizer.user_name', user_name);
            setValue('approval_flow.customer_authorizer.company_name', company_name);
            setValue('approval_flow.customer_authorizer.position', position);
            setValue('approval_flow.customer_authorizer.email', email);

            const userFile = customerUserList.find(user => user.user_name === user_name)?.file;

            // 代表印が登録されているユーザーの場合に設定
            if (userFile) {
                setValue('customer_seal_temp', userFile);
                setSelectedCustomerSeal(userFile);
                setIsChecked_customerSeal(true);

                // 選択中の代表印を退避
                setSelectedCustomerRepresentativeSealFile(userFile);
            } else {
                setSelectedCustomerRepresentativeSealFile('');
            };
        };

        // 担当者の入力フォームをチェック
        isPicInputComplete();

        // 代表者の入力フォームをチェック
        isAuthorizerInputComplete();
    };

    // -------------------------------------- //
    // ---       契約代表者設定（自社）     --- //
    // -------------------------------------- //
    /***
     *
     * フォームの入力チェック
     * バリデーションチェックの結果OK/NGを判定する
     *
     */
    const isAuthorizerInputComplete = () => {
        const internalSealFile = getValues('internal_seal_temp');
        const internalAuthorizerUserName = getValues('approval_flow.internal_authorizer.user_name');
        const internalAuthorizerEmail = getValues('approval_flow.internal_authorizer.email');
        const customerSealFile = getValues('customer_seal_temp');
        const customerAuthorizerUserName = getValues('approval_flow.customer_authorizer.user_name');
        const customerAuthorizerEmail = getValues('approval_flow.customer_authorizer.email');

        // 自社代表者の必須フィールドが全て入力済みか判定する
        if (internalAuthorizerUserName && internalAuthorizerEmail &&
            (internalSealFile || internalSealFileUploaded)) {
            setIsInternalAuthorizerInpuTFormValid(true);
        } else {
            setIsInternalAuthorizerInpuTFormValid(false);
        }

        // 相手方代表者の必須フィールドが全て入力済みか判定する
        if (customerAuthorizerUserName && customerAuthorizerEmail &&
            (customerSealFile || customerSealFileUploaded)) {
            setIsCustomerAuthorizerInpuTFormValid(true);
        } else {
            setIsCustomerAuthorizerInpuTFormValid(false);
        }
    };

    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    // チェック対象：氏名・役職・メールアドレス
    const handleBlurForInternalInputForm = () => {
        // フォームの入力値をチェック
        isAuthorizerInputComplete();
    };

    // 代表者選択のセレクトボックス
    const handleSelectChange_internalAuthorizer = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedInternalAuthorizer(selectedValue);

        const selectedUser = internalUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.internal_authorizer.user_name', selectedUser.user_name);
            setValue('approval_flow.internal_authorizer.company_name', getValues().own_company.company_name);
            setValue('approval_flow.internal_authorizer.position', selectedUser.position);
            setValue('approval_flow.internal_authorizer.email', selectedUser.email);

            if (selectedUser.file) {
                // 代表印が登録されているユーザーの場合に設定する
                setValue('internal_seal_temp', selectedUser.file);
                // setInternalSealFileUploaded(true);

                // 選択中の代表印を退避
                setSelectedInternalSeal(selectedUser.file);
            };
        }

        // フォームの入力値をチェック
        isAuthorizerInputComplete();
    };

    // 代表印選択 ラジオボタン切替時の処理
    const handleSelectChange_selectType_internal = (event: SelectChangeEvent<string>) => {

        const selectedValue = event.target.value;

        setSelectType_internal(selectedValue); // ラジオボタンに選択された値をセット

        if (selectedValue === 'useUserSeal') {
            if (isChecked_internalPic) {
                setValue('internal_seal_temp', selectedInternalSeal || '');
            } else {
                setValue('internal_seal_temp', ''); // チェックボックスがオフの場合は空にする
            };
        };

        if (selectedValue === 'useRepresentativeSeal') {
            setValue('internal_seal_temp', selectedInternalRepresentativeSealFile || '');
            changeInternalRepresentativeSeal();
        };

        // 代表者の入力フォームをチェック
        isAuthorizerInputComplete();
    };

    // 代表印選択 ラジオボタンが操作された際に、代表印が登録されていたら設定する
    const changeInternalRepresentativeSeal = () => {
        setSelectedRepresentativeSeal_internal(selectedInternalRepresentativeSealName);
        setValue('internal_seal_temp', internalRepresentativeSealMap.get(selectedInternalRepresentativeSealName) || '');
    };

    // 代表印選択 ドロップダウンメニューのイベントハンドラ
    const handleSelectChange_selectRepresentativeSeal_internal = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;

        setSelectedRepresentativeSeal_internal(selectedValue);

        setSelectedPdfPreview_internal(internalRepresentativeSealMap.get(selectedValue) || '');

        setSelectedInternalRepresentativeSealFile(internalRepresentativeSealMap.get(selectedValue) || '');

        const sealValue = internalRepresentativeSealMap.get(selectedValue) || '';
        setSelectedInternalRepresentativeSealName(selectedValue);
        setSelectedInternalRepresentativeSealFile(sealValue);

        setValue('internal_seal_temp', internalRepresentativeSealMap.get(selectedValue) || '');

        // 代表者の入力フォームをチェック
        isAuthorizerInputComplete();
    };

    // -------------------------------------- //
    // ---       契約代表者設定（顧客）     --- //
    // -------------------------------------- //
    /***
     *
     * 相手方代表者：入力フォーム
     *
     */
    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleBlurForCustomerInputForm = () => {
        // フォームの入力値をチェック
        isAuthorizerInputComplete();
    };

    const handleSelectChange_customerAuthorizer = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedCustomerAuthorizer(selectedValue);

        const selectedUser = customerUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.customer_authorizer.user_name', selectedUser.user_name);
            setValue('approval_flow.customer_authorizer.company_name', getValues().customer_company.company_name);
            setValue('approval_flow.customer_authorizer.position', selectedUser.position);
            setValue('approval_flow.customer_authorizer.email', selectedUser.email);

            if (selectedUser.file) {
                // 代表印が登録されているユーザーの場合に設定する
                setValue('customer_seal_temp', selectedUser.file);
                // setInternalSealFileUploaded(true);

                // 選択中の代表印を退避
                setSelectedCustomerSeal(selectedUser.file);
            };
        }

        // フォームの入力値をチェック
        isAuthorizerInputComplete();
    };

    // 代表印選択 ラジオボタン切替時の処理
    const handleSelectChange_selectType_customer = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;

        setSelectType_customer(selectedValue); // ラジオボタンに選択された値をセット

        if (selectedValue === 'useUserSeal') {
            if (isChecked_customerPic) {
                setValue('customer_seal_temp', selectedCustomerSeal || '');
            } else {
                setValue('customer_seal_temp', ''); // チェックボックスがオフの場合は空にする
            };
        };

        if (selectedValue === 'useRepresentativeSeal') {
            setValue('customer_seal_temp', selectedCustomerRepresentativeSealFile || '');
            changeCustomerRepresentativeSeal();
        };

        // 代表者の入力フォームをチェック
        isAuthorizerInputComplete();
    };

    // 代表印選択 ラジオボタンが操作された際に、代表印が登録されていたら設定する
    const changeCustomerRepresentativeSeal = () => {
        setSelectedRepresentativeSeal_customer(selectedCustomerRepresentativeSealName);
        setValue('customer_seal_temp', customerRepresentativeSealMap.get(selectedCustomerRepresentativeSealName) || '');
    };

    // 代表印選択 ドロップダウンメニューのイベントハンドラ
    const handleSelectChange_selectRepresentativeSeal_customer = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedRepresentativeSeal_customer(selectedValue);
        setSelectedPdfPreview_customer(customerRepresentativeSealMap.get(selectedValue) || '');

        setSelectedCustomerRepresentativeSealFile(customerRepresentativeSealMap.get(selectedValue) || '');

        const sealValue = customerRepresentativeSealMap.get(selectedValue) || '';
        setSelectedCustomerRepresentativeSealName(selectedValue);
        setSelectedCustomerRepresentativeSealFile(sealValue);

        setValue('customer_seal_temp', customerRepresentativeSealMap.get(selectedValue) || '');

        // 代表者の入力フォームをチェック
        isAuthorizerInputComplete();
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
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    /***
     *
     * ユーザーロール選択タブ制御（自社）
     *
     */
    const handleInternalThemeValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setInternalThemeValue(newValue);
    };

    /***
     *
     * ユーザーロール選択タブ制御（顧客）
     *
     */
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
    // プルダウンメニューから選択したユーザー情報を追加
    const handleSelectChange_internalApprover = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedInternalApprover(selectedValue);

        const selectedUser = internalUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.internal_approver_temp.user_name', selectedUser.user_name);
            setValue('approval_flow.internal_approver_temp.company_name', getValues().own_company.company_name);
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

        // setSelectedValuesForInternalApprover((prev) => [...prev, manualUser]);
        setSelectedValuesForInternalApprover((prev) => {
            if (prev.some(user => user.email === manualUser.email)) {
                alert(`このメールアドレス（${manualUser.email}）のユーザーは既に承認フローに追加されています。`);
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
        setSelectedValuesForInternalApprover([]);
        setIsInternalApproverAdded(false);
    }

    // 追加した承認者の順番をドラッグアンドドロップで入れ替える
    const handleInitialInternalRowsOnDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(internalApprovers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedValuesForInternalApprover(items);
    };

    // ---------------------------------------------- //
    // ---       承認フロー設定（関係者）：自社      --- //
    // ---------------------------------------------- //
    /***
     *
     * 社内フロー設定：関係者
     *
     */
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
    const handleSelectChange_customerApprover = (event: SelectChangeEvent<string>) => {
        const selectedValue = event.target.value;
        setSelectedCustomerApprover(selectedValue);

        const selectedUser = customerUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.customer_approver_temp.user_name', selectedUser.user_name);
            setValue('approval_flow.customer_approver_temp.company_name', getValues().own_company.company_name);
            setValue('approval_flow.customer_approver_temp.position', selectedUser.position);
            setValue('approval_flow.customer_approver_temp.email', selectedUser.email);
        }
    };

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

        // setSelectedValuesForCustomerApprover((prev) => [...prev, manualUser]);
        setSelectedValuesForCustomerApprover((prev) => {
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

    // 「クリア」ボタンを押下した際に追加した承認者情報をクリアする
    const clearTempCustomerApprover = () => {
        setSelectedValuesForCustomerApprover([]);
        setIsCustomerApproverAdded(false);
    }

    // 追加した承認者の順番をドラッグアンドドロップで入れ替える
    const handleInitialCustomerRowsOnDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(customerApprovers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedValuesForCustomerApprover(items);
    };

    /***
     *
     * 相手方フロー設定：関係者
     *
     */
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

    // ---------------------------------------------- //
    // ---       承認フロー設定（情報のマージ）      --- //
    // ---------------------------------------------- //
    /***
     *
     * 登録画面で「確認する」、または確認画面で「戻る」を選択した時の処理
     *
     */
    const onPreview = () => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        if (isPreviewVisible) {
            setIsPreviewVisible(false); // 登録画面を表示する
        } else {

            // 各企業の承認者情報を設定
            setValue('approval_flow.internal_approver', selectedValuesForInternalApprover);
            setValue('approval_flow.customer_approver', selectedValuesForCustomerApprover);

            // 各企業の関係者情報を設定
            setValue('approval_flow.internal_notifier', selectedValuesForInternalNotifier);
            setValue('approval_flow.customer_notifier', selectedValuesForCustomerNotifier);

            // 各企業の代表印を設定
            setValue('internal_seal', getValues().internal_seal_temp);
            setValue('customer_seal', getValues().customer_seal_temp);

            // フォームから承認フローを取得
            const approval_flow = getValues().approval_flow;

            // 自社承認フローを設定
            const internalApprovalFlow = {
                internal_approver: selectedValuesForInternalApprover,
                internal_authorizer: approval_flow.internal_authorizer,
            };

            // 相手方承認フローを設定
            const customerApprovalFlow = {
                customer_approver: selectedValuesForCustomerApprover,
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
     * 「登録する」を選択した時の処理
     *
     */
    // フォームの登録内容を整理し、登録内容確認画面へ遷移する。
    const onSubmit = (data: FormInput) => {
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

        let reader = new FileReader();
        // ファイルの読み込み、契約書の登録
        reader.onload = () => {
            body.file_name = file?.name;
            const dataUrl = reader.result as string;
            body.file = dataUrl.replace(/data:.*\/.*;base64,/, '');
        }
        // ファイルのdataURLを取得
        if (file) {
            reader.readAsDataURL(file);
        }

        // body.approval_flow から不要なプロパティを削除
        delete body.approval_flow.internal_approver_temp;
        delete body.approval_flow.customer_approver_temp;
        delete body.approval_flow.internal_notifier_temp;
        delete body.approval_flow.customer_notifier_temp;
        delete body.internal_seal_temp;
        delete body.customer_seal_temp;

        registerAgreement(body);
    }

    // 契約書を登録する
    const registerAgreement = async (body: any) => {

        setExecuteApiDialogOpen(true);
        try {
            const res = await api.postAgreement(body);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('契約書登録処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            }

            const agreementData = await res.json();
            navigate('/documentManagement/register/registerComplete', { state: { agreementData } });
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('契約書登録処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    // const [open, setOpen] = useState<boolean>(false);
    // const [messages, setMessages] = useState<Message[]>([
    //     { role: "assistant", content: "こんにちは！　何かお困りのことはありますか？" },
    //     { role: "user", content: "建築業界向けの機密保持契約書作成にあたり、IT業界と異なる点を教えてください。" },
    //     { role: "assistant", content: "建築業界は図面や現場写真など視覚的・物理的な資料が多く、IT業界はソースコード、仕様書など電子データが多いです。" },
    // ]);
    // const [input, setInput] = useState<string>("");
    // // 初回表示用の情報取得
    // const [loading, setLoading] = useState(false);

    // interface Message {
    //     role: "user" | "assistant";
    //     content: string;
    // }

    // const handleSendMessage = async () => {
    //     if (!input.trim()) return;

    //     const userMessage: Message = { role: "user", content: input };
    //     setMessages((prevMessages) => [...prevMessages, userMessage]);
    //     setInput("");
    //     // setLoading(true);

    //     // try {
    //     //     const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/97c48ad8-c001-7032-d61f-16e38626e74c/messages", {
    //     //         // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
    //     //         method: "POST",
    //     //         headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
    //     //         body: JSON.stringify({ message: 'こんにちは' })
    //     //     });

    //     //     const data = await response.json();

    //     //     // 一番番号が大きいデータを取得
    //     //     const latestMessage = data.messages.reduce((prev: any, current: any) => {
    //     //         return prev.number > current.number ? prev : current;
    //     //     });

    //     //     const assistantMessage: Message = { role: "assistant", content: latestMessage.content };
    //     //     setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    //     //     // const assistantMessage: Message = { role: "assistant", content: data.messages[0].content };
    //     //     // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    //     // } catch (error) {
    //     //     console.error("Error fetching AI response:", error);
    //     // } finally {
    //     //     setLoading(false);
    //     // }
    //     setTimeout(async () => {
    //         try {
    //             const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/cf7e4da0-9417-40a2-bbd9-5b3ce55fdce2/messages", {
    //                 // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
    //                 method: "GET",
    //                 headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
    //                 // body: JSON.stringify({ message: input })
    //             });

    //             const data = await response.json();

    //             // 一番番号が大きいデータを取得
    //             const latestMessage = data.messages.reduce((prev: any, current: any) => {
    //                 return prev.number > current.number ? prev : current;
    //             });

    //             const assistantMessage: Message = { role: "assistant", content: latestMessage.content };
    //             setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    //             // const assistantMessage: Message = { role: "assistant", content: data.messages[0].content };
    //             // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    //         } catch (error) {
    //             console.error("Error fetching AI response:", error);
    //         } finally {
    //             // setLoading(false);
    //         }
    //     }, 3000);
    // };

    // let authorizationToken: string = '';

    // // CognitoのクライアントID
    // const clientId = awsconfig_generativeai.Auth.aws_user_pools_web_client_id;

    // // AuthorizationHeaderを設定する共通関数
    // const getAuthorizationHeader = () => {
    //     const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
    //     const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`) || '';
    //     const authorizationToken = `Bearer ${token}`;

    //     return { 'Authorization': `${authorizationToken}` };
    //     // return { 'Authorization': `eyJraWQiOiJhMTQ1bWplb0hoSnl3cnErY095OFwvUGtDQkNMakRDSUVMRzlQb2lhWGthaz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5N2M0OGFkOC1jMDAxLTcwMzItZDYxZi0xNmUzODYyNmU3NGMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtbm9ydGhlYXN0LTFfUEF4QWlJTXJCIiwiY29nbml0bzp1c2VybmFtZSI6Ijk3YzQ4YWQ4LWMwMDEtNzAzMi1kNjFmLTE2ZTM4NjI2ZTc0YyIsIm9yaWdpbl9qdGkiOiJlOThjMGU2My1iN2Y5LTQyMjItYmZhYS01NmNkNWE5MmRjMDkiLCJhdWQiOiI2ZzlhaTgxZjJ2cmoxdTJkYWpzb2JuN2plbiIsImV2ZW50X2lkIjoiZDJhZjE0MTgtNmY2Ny00MGRiLWFjN2MtZDE0ZmI5Y2YxZDEyIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NDE2NTMxMjcsImV4cCI6MTc0MjQ0MzE0NywiaWF0IjoxNzQyMzU2NzQ3LCJqdGkiOiIyZjYyMmRlYi02YWQxLTRjYTUtOWFkYS01YWMxYWE0YTBlYjMiLCJlbWFpbCI6ImQuYXJhaUBtaWNyb3MuY28uanAifQ.P7aQ8FBU2tZoJzETC73oLLqsPFy8Y1tu66eSiolZ3JEga-Al1A1Xo30rrrnCIVfeCvw817U5-lui6HztSRYHL8jShSLgcjNQ_JwU72cAJywnJ9zNsF9LyHbE_JRkMXittOOqx0rgAB5hjNekzeBjsHP56s2niAoNRKWaey8X2-KjHGMfhmhWdRysVyZoZ0LM_Fj2FyG7WlW1hR1FuItXVoUaiUydGjuc3T_n9QehgV41XEXQqqmGkZxTNF7Z47JaB4RzHtc4O2bb1quo2hIkT0AQzqvIJLokYlQyJv5sLLiCMnSlcrHU1xXv683X1-wXbzq8T_ofUlhAS5K2oF0uKA` };
    //     // return { 'Authorization': `eyJraWQiOiJFSWpGaFwvRzVrM1J3SUQ0ZnFvdWVaUUJSdkEwazNUaStacXVianQxQ0djOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhNzk0ZWEwOC05MGYxLTcwYTMtMjEzMS1jN2E2YTNmYjg3OGIiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1ub3J0aGVhc3QtMV9WNzcxenU4aVciLCJjb2duaXRvOnVzZXJuYW1lIjoidXNlciIsIm9yaWdpbl9qdGkiOiI2ZmUwMTJjNi1jZmFmLTQ2NjAtOTU3Ni1kNmYwYTExYWE0YmQiLCJhdWQiOiI2a2sxaWg5cGk3M2lxZ202NWE2cjEzNjYzbiIsImV2ZW50X2lkIjoiODg3ZmI1Y2UtYTliNi00YmIxLWJmNTQtOWI5NDYwNjdjMDIzIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NDQwNzg5MDYsImV4cCI6MTc0NDA4MjUwNiwiaWF0IjoxNzQ0MDc4OTA2LCJqdGkiOiI1Yzk2YjQxZi1mNTVmLTRjOGMtYTFhOC03YzQ5NDY5ZDE3MjkiLCJlbWFpbCI6Im5vcmVwbHlAbWljcm9zLXNvZnR3YXJlLmNvbSJ9.WBswLIEN--P_ohoNAfdniriwk6aE37QMYBngC1EhMTXmW4GiLNzPidIPoJRurR0o1P-pujZyhDV1Y6rzJJz-H2QfCKO8WPzl_TwiFi3O6fGHujlR9htVace2o2qKoN3fP-jJdITE_r6YeqdL_wcvXDafYmXayHbMxSzjKXhKf77Rq7h_i_gRAg2FqlAaeunQPR8JRpzD9E80hFjQDxrqCvbB-VLXaD1fr_idxNIOd5S-Sb_weB852-LmwAjhtgDCAJYo-c2K3UZk2VrvWFW0Je0V6yEVukC4i2tAFP4J2fxhWbYY2xObMiJxiDHjS54qsvHp8vUVT73cx56wfgzxxQ` };
    //     // return { 'Authorization': `eyJraWQiOiJFSWpGaFwvRzVrM1J3SUQ0ZnFvdWVaUUJSdkEwazNUaStacXVianQxQ0djOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0N2I0N2EzOC0zMGQxLTcwNWUtODU1My0zZDYxOTAzODU4ZTYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1ub3J0aGVhc3QtMV9WNzcxenU4aVciLCJjb2duaXRvOnVzZXJuYW1lIjoidGVzdCIsIm9yaWdpbl9qdGkiOiJjM2UzMTUwNy0zMTc0LTRlNWUtODRiZS1iNTY4Yjc0NGI5YzAiLCJhdWQiOiI2a2sxaWg5cGk3M2lxZ202NWE2cjEzNjYzbiIsImV2ZW50X2lkIjoiMTVmNGE3MTEtOTIyZC00NjQxLWJhZmMtM2UxN2RkYmQ5M2Q1IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NDQwODYwNzcsImV4cCI6MTc0NDA4OTY3NywiaWF0IjoxNzQ0MDg2MDc3LCJqdGkiOiJjNmNiOTg4Ni03ODNmLTRkZDktYjM1Zi1lM2JlMmU4MTVkYjkiLCJlbWFpbCI6ImQuYXJhaUBtaWNyb3MuY28uanAifQ.yUJaMgxS3IsNh-KOnihG4lNMvIEw9MhC797AhdibQaB4Rdgut79mdkTGL9hIRrYyOfTu1PU0N4o14ANzmLLwqxM860ucZYx_9ab4IbwnkKnCilUAp-Y0eWP55XjrXBHhITeg-MbXxLX1L7lsYivgspgaOJCdDKdPmyJnH3Ns80QHAJOGEjcOkOTMoJ3hX6C9_lQaAzEfduj7wYEN6N-E8ggYaMsvhfiYTif85jSw5KGg3ocz3o8XNWYQ3HCJTu--3ELPytt9ZyP-90znq5Zp_WkDGxcb26jR1KUjMSpEcRLQU1TC6BAhkNCwZRM7ZTD93063kGgAe0PJ4WVcOpuaJQ` };
    // };

    // const handleHelpClick = () => {
    //     setOpen(true); // ダイアログを開く
    // };

    // const handleClose = () => {
    //     setOpen(false); // ダイアログを閉じる
    // };

    const handleMoveInternalApprover = (from: number, to: number) => {
        if (to < 0 || to >= selectedValuesForInternalApprover.length) return;
        const updated = [...selectedValuesForInternalApprover];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setSelectedValuesForInternalApprover(updated);
    };

    // ---------------------------------------------- //
    // ---       登録済み承認フローを利用する       --- //
    // ---------------------------------------------- //
    // ボタン押下時のハンドラ
    const handleOpenInternalDialog = () => {
        setDialogType('INTERNAL');
        setOpenWorkFlowDialog(true);
    };
    const handleOpenCustomerDialog = () => {
        setDialogType('CUSTOMER');
        setOpenWorkFlowDialog(true);
    };
    const handleCloseWorkFlowDialog = () => {
        setOpenWorkFlowDialog(false);
        setDialogType(null);
    };

    const handleWorkFlowSelect = (selectedFlow: any) => {

        const representativeSealImage = selectedFlow.representativeSealImage;

        // 登録済み承認フローを利用する機能が利用された場合は、既存のデータを削除する（入力フォーム初期化）
        if (selectedFlow.workflow_type === 'INTERNAL') {
            setValue('internal_seal_temp', '');

            setValue('approval_flow.internal_pic', initialApprover);
            setValue('approval_flow.internal_approver_temp', initialApprover);
            setInternalApprovers([]);
            setSelectedValuesForInternalApprover([]);

            setValue('approval_flow.internal_authorizer', initialApprover);
            setValue('approval_flow.internal_notifier_temp', initialApprover);
            setInternalNotifiers([]);
            setSelectedValuesForInternalNotifier([]);

            // 自社代表者印としてセット
            if (representativeSealImage) {
                setSelectedInternalSeal(representativeSealImage);
                setValue('internal_seal_temp', representativeSealImage);
            };

            // 担当者を設定する
            const internalPic = selectedFlow.internal_pic;
            if (internalPic && Object.keys(internalPic).length > 0) {
                setPic(internalPic, selectedFlow.workflow_type);
            };

            // 代表者を設定する
            const internalAuthorizer = selectedFlow.internal_authorizer;
            if (internalAuthorizer && Object.keys(internalAuthorizer).length > 0) {
                setAuthorizer(internalAuthorizer, selectedFlow.workflow_type);
            };

            // approverをリスト（temp）へ追加する
            const internalApprover = selectedFlow.internal_approver || [];
            if (internalApprover.length > 0) {
                addApprovers(selectedFlow.internal_approver, selectedFlow.workflow_type);
            };

            // notifierをリスト（temp）へ追加する
            const internalNotifier = selectedFlow.internal_notifier || [];
            if (internalNotifier.length > 0) {
                addNotifiers(selectedFlow.internal_notifier, selectedFlow.workflow_type);
            };
        };

        if (selectedFlow.workflow_type === 'CUSTOMER') {
            setValue('customer_seal_temp', '');

            setValue('approval_flow.customer_pic', initialApprover);
            setValue('approval_flow.customer_approver_temp', initialApprover);
            setCustomerApprovers([]);
            setSelectedValuesForCustomerApprover([]);

            setValue('approval_flow.customer_authorizer', initialApprover);
            setValue('approval_flow.customer_notifier_temp', initialApprover);
            setCustomerNotifiers([]);
            setSelectedValuesForCustomerNotifier([]);

            // 例：相手方代表者印としてセット
            if (representativeSealImage) {
                setSelectedCustomerSeal(representativeSealImage);
                setValue('customer_seal_temp', representativeSealImage);
            };

            // 担当者を設定する
            const customerPic = selectedFlow.customer_pic;
            if (customerPic && Object.keys(customerPic).length > 0) {
                setPic(customerPic, selectedFlow.workflow_type);
            };

            // 代表者を設定する
            const customerAuthorizer = selectedFlow.customer_authorizer;
            if (customerAuthorizer && Object.keys(customerAuthorizer).length > 0) {
                setAuthorizer(customerAuthorizer, selectedFlow.workflow_type);
            };

            // approverをリスト（temp）へ追加する
            const customerApprover = selectedFlow.customer_approver || [];
            if (customerApprover.length > 0) {
                addApprovers(selectedFlow.customer_approver, selectedFlow.workflow_type);
            };

            // notifierをリスト（temp）へ追加する
            const customerNotifier = selectedFlow.customer_notifier || [];
            if (customerNotifier.length > 0) {
                addNotifiers(selectedFlow.customer_notifier, selectedFlow.workflow_type);
            };
        };

        // 担当者の入力フォームをチェック
        isPicInputComplete();

        // 代表者の入力フォームをチェック
        isAuthorizerInputComplete();
    };

    // 承認者をリストに追加する
    const setPic = (pic: any, workflowType: string) => {

        if (!pic || pic.pic === 0) return;

        if (workflowType === 'INTERNAL') {
            setValue('approval_flow.internal_pic.company_name', getValues().own_company.company_name);
            setValue('approval_flow.internal_pic.user_name', pic.user_name);
            setValue('approval_flow.internal_pic.position', pic.position);
            setValue('approval_flow.internal_pic.email', pic.email);
        } else if (workflowType === 'CUSTOMER') {
            setValue('approval_flow.customer_pic.company_name', getValues().customer_company.company_name);
            setValue('approval_flow.customer_pic.user_name', pic.user_name);
            setValue('approval_flow.customer_pic.position', pic.position);
            setValue('approval_flow.customer_pic.email', pic.email);
        };
    };

    // 承認者をリストに追加する
    const setAuthorizer = (authorizer: any, workflowType: string) => {

        if (!authorizer || authorizer.authorizer === 0) return;

        if (workflowType === 'INTERNAL') {
            setValue('approval_flow.internal_authorizer.company_name', getValues().own_company.company_name);
            setValue('approval_flow.internal_authorizer.user_name', authorizer.user_name);
            setValue('approval_flow.internal_authorizer.position', authorizer.position);
            setValue('approval_flow.internal_authorizer.email', authorizer.email);
        } else if (workflowType === 'CUSTOMER') {
            setValue('approval_flow.customer_authorizer.company_name', getValues().customer_company.company_name);
            setValue('approval_flow.customer_authorizer.user_name', authorizer.user_name);
            setValue('approval_flow.customer_authorizer.position', authorizer.position);
            setValue('approval_flow.customer_authorizer.email', authorizer.email);
        };
    };

    // 承認者をリストに追加する
    const addApprovers = (approvers: any, workflowType: string) => {

        if (!approvers || approvers.length === 0) return;

        // 追加する承認者リストを作成
        const newApprovers = approvers.map((approver: any) => ({
            company_name:
                workflowType === 'INTERNAL'
                    ? getValues().own_company.company_name
                    : getValues().customer_company.company_name,
            user_name: approver.user_name,
            position: approver.position,
            email: approver.email,
        }));

        if (workflowType === 'INTERNAL') {
            setInternalApprovers((prev) => [...prev, ...newApprovers]);
            setIsInternalApproverAdded(true);
            setSelectedValuesForInternalApprover((prev) => [...prev, ...newApprovers]);
        } else if (workflowType === 'CUSTOMER') {
            setCustomerApprovers((prev) => [...prev, ...newApprovers]);
            setIsCustomerApproverAdded(true);
            setSelectedValuesForCustomerApprover((prev) => [...prev, ...newApprovers]);
        };
    };

    const addNotifiers = (notifiers: any, workflowType: string) => {

        if (!notifiers || notifiers.length === 0) return;

        // 追加する承認者リストを作成
        const newNotifiers = notifiers.map((notifier: any) => ({
            company_name:
                workflowType === 'INTERNAL'
                    ? getValues().own_company.company_name
                    : getValues().customer_company.company_name,
            user_name: notifier.user_name,
            position: notifier.position,
            email: notifier.email,
        }));

        if (workflowType === 'INTERNAL') {
            setInternalNotifiers((prev) => [...prev, ...newNotifiers]);
            setIsInternalNotifierAdded(true);
            setSelectedValuesForInternalNotifier((prev) => [...prev, ...newNotifiers]);
        } else if (workflowType === 'CUSTOMER') {
            setCustomerNotifiers((prev) => [...prev, ...newNotifiers]);
            setIsCustomerNotifierAdded(true);
            setSelectedValuesForCustomerNotifier((prev) => [...prev, ...newNotifiers]);
        };
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor='grey.200' sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: '80px', width: '100%' }}>
                    <CssBaseline />
                    <Header />
                    <Box sx={{ flexGrow: 1, paddingLeft: '10%', paddingRight: '10%' }}>
                        {!isPreviewVisible && (
                            <>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                    契約に関する情報を登録してください
                                </Typography>
                                <Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ border: '1px solid lightgray' }}>
                                            <Accordion defaultExpanded >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    aria-controls="panel1a-content"
                                                    id="panel1a-header"
                                                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                                                >
                                                    <Box sx={{ backgroundColor: '#1565c0', padding: '10px', width: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>契約書アップロード</Typography>
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1 }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', width: '100px' }}>
                                                        <CheckCircleIcon sx={{ color: fileUploaded ? 'green' : 'red', fontSize: '40px' }} />
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Box
                                                        {...getRootPropsPdfFile()}
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            height: '200px',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            marginBottom: '20px',
                                                            border: isDragActivePdfFile ? 'dashed' : 'dotted',
                                                            marginLeft: '5%',
                                                            marginRight: '5%',
                                                        }}
                                                        onClick={() => document.getElementById('fileInput')?.click()}
                                                    >
                                                        <input {...getInputPropsPdfFile()} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                                                            <UploadFileIcon style={{ fontSize: 75 }} />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                                                            ここにファイルをドロップ or クリックしてファイルを選択<br />
                                                            （PDFファイル形式）<br />
                                                        </Box>
                                                        <input
                                                            id="fileInput"
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={(e) => handleFileUpload(e.target.files ? Array.from(e.target.files) : [])}
                                                            style={{ display: 'none' }} />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', color: getValues('title') ? 'inherit' : 'red', fontSize: '1.2em' }}>
                                                        {getValues('title') ?
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '90%', marginLeft: '5%', marginRight: '5%', marginBottom: '10px' }}>
                                                                    <TextField
                                                                        id="agreement-Subject1"
                                                                        variant="standard"
                                                                        label="アップロードファイル名"
                                                                        value={fileName}
                                                                        disabled={true}
                                                                        sx={{ ...readOnlyTextFieldPaddingLessStyle, width: '100%' }}
                                                                    />
                                                                </Box>
                                                            </Box> : '※ファイルをアップロードしてください。'}
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
                                                            <Box sx={{ width: '100%', paddingLeft: '5%', paddingRight: '5%' }}>
                                                                <Box sx={{ display: 'flex', width: '100%', marginBottom: '20px' }}>
                                                                    <Box sx={{ display: 'flex', width: '50%', marginRight: '10px' }}>
                                                                        <CustomPulldownMenu
                                                                            label="契約種別"
                                                                            value={selectedValue}
                                                                            onChange={handleSelectChange}
                                                                            items={contractType}
                                                                        />
                                                                    </Box>
                                                                    {/* <Box sx={{ display: 'flex', width: '50%', marginLeft: '10px' }}>
                                                                        <CustomPulldownMenu_SignTemplate
                                                                            label="署名テンプレート名"
                                                                            value={selectedValueSignTemplateId}
                                                                            onChange={handleSelectChangeSignTemplate}
                                                                            items={sign_template_list}
                                                                        />
                                                                    </Box> */}
                                                                    {/* <HelpOutlineIcon onClick={handleHelpClick} /> */}
                                                                    {/* <Fab
                                                                        color="primary"
                                                                        aria-label="chat"
                                                                        onClick={() => setOpen(true)}
                                                                        style={{ position: "fixed", bottom: 40, right: 20 }}
                                                                    >
                                                                        <HelpOutlineIcon />
                                                                    </Fab> */}
                                                                    {/* {open && (
                                                                        <Paper elevation={3} style={{
                                                                            position: "fixed", bottom: 60, right: 20, width: '60%', height: '70%', padding: "10px",
                                                                            display: "flex", flexDirection: "column", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", backgroundColor: "#f4f4f4", zIndex: 1000,
                                                                        }}>
                                                                            <Typography variant="h6" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: 'darkblue', color: 'white', paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                                                                                契約書テンプレート支援AI
                                                                                <IconButton onClick={() => setOpen(false)}>
                                                                                    <CloseIcon sx={{ color: 'white' }} />
                                                                                </IconButton>
                                                                            </Typography>
                                                                            <List style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", borderRadius: "4px", padding: "10px", backgroundColor: "white" }}>
                                                                                {messages.map((msg, index) => (
                                                                                    <ListItem key={index} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
                                                                                        <ListItemText
                                                                                            primary={msg.content}
                                                                                            primaryTypographyProps={{
                                                                                                style: {
                                                                                                    backgroundColor: msg.role === "user" ? "#1976d2" : "#e0e0e0",
                                                                                                    color: msg.role === "user" ? "#fff" : "#000",
                                                                                                    borderRadius: "10px",
                                                                                                    padding: "8px",
                                                                                                    display: "inline-block",
                                                                                                    maxWidth: "80%"
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </ListItem>
                                                                                ))}
                                                                            </List>
                                                                            <TextField
                                                                                fullWidth
                                                                                variant="outlined"
                                                                                placeholder="質問を入力してください"
                                                                                value={input}
                                                                                onChange={(e) => setInput(e.target.value)}
                                                                                style={{ marginTop: "10px", backgroundColor: "white" }}
                                                                            />
                                                                            <Button
                                                                                variant="contained"
                                                                                color="success"
                                                                                onClick={handleSendMessage}
                                                                                disabled={loading}
                                                                                fullWidth
                                                                                style={{ marginTop: "10px" }}
                                                                                sx={{ '&:hover': { backgroundColor: 'darkgreen' }, width: '40%', marginLeft: '30%', marginRight: '30%', display: 'block' }}
                                                                            >
                                                                                {loading ? <CircularProgress size={24} /> : "送信"}
                                                                            </Button>
                                                                            <Button
                                                                                variant="contained"
                                                                                color="success"
                                                                                onClick={handleSendMessage}
                                                                                disabled={loading}
                                                                                fullWidth
                                                                                style={{ marginTop: "10px" }}
                                                                                sx={{ '&:hover': { backgroundColor: 'darkgreen' }, width: '40%', marginLeft: '30%', marginRight: '30%', display: 'block' }}
                                                                            >
                                                                                {loading ? <CircularProgress size={24} /> : "新しいテンプレートを作成する"}
                                                                            </Button>
                                                                        </Paper>
                                                                    )} */}
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', marginBottom: '20px', marginRight: '10px' }}>
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
                                                                                        fontWeight: 'bold', // フォントウェイトをboldに設定
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
                                                                <Box sx={{ display: 'flex', width: '50%', marginBottom: '20px', marginRight: '10px' }}>
                                                                    <CustomPulldownMenu
                                                                        label="署名用URL有効期限（相手方企業用）"
                                                                        value={selectedValueUrlExpirationDate}
                                                                        onChange={handleSelectedValueUrlExpirationDate}
                                                                        items={effectiveDate}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', width: '100%' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', marginRight: '10px' }}>
                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                            <Controller
                                                                                name="conclusion_date"
                                                                                control={control}
                                                                                render={({ field, formState: { errors } }) => (
                                                                                    <MobileDatePicker
                                                                                        {...field}
                                                                                        label="契約開始日"
                                                                                        format='YYYY年MM月DD日'
                                                                                        sx={{
                                                                                            marginY: '0.5rem',
                                                                                            ...baseTextFieldStyle,
                                                                                            '& .MuiInputBase-input': {
                                                                                                fontWeight: 'bold', // フォントウェイトを指定
                                                                                                fontSize: '1.5em', // フォントウェイトを指定
                                                                                            }
                                                                                        }}
                                                                                        minDate={dayjs('2022-01-01')}
                                                                                        maxDate={dayjs('2050-12-31')}
                                                                                    />
                                                                                )}
                                                                            />
                                                                        </LocalizationProvider>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', marginLeft: '10px' }}>
                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                            <Controller
                                                                                name="expiration_date"
                                                                                control={control}
                                                                                render={({ field, formState: { errors } }) => (
                                                                                    <MobileDatePicker
                                                                                        {...field}
                                                                                        label="契約終了日"
                                                                                        format='YYYY年MM月DD日 '
                                                                                        sx={{
                                                                                            marginY: '0.5rem',
                                                                                            ...baseTextFieldStyle,
                                                                                            '& .MuiInputBase-input': {
                                                                                                fontWeight: 'bold', // フォントウェイトを指定
                                                                                                fontSize: '1.5em', // フォントウェイトを指定
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
                                                                {/* <Box sx={{ display: 'flex', width: '50%', marginBottom: '40px', marginRight: '10px' }}>
                                                                    <CustomPulldownMenu
                                                                        label="契約期限切れ自動通知：ON／OFF　←ONになっている契約書は期限切れ前に自動で担当者へ通知する"
                                                                        value={selectedValueUrlExpirationDate}
                                                                        onChange={handleSelectedValueUrlExpirationDate}
                                                                        items={effectiveDate}
                                                                    />
                                                                </Box> */}
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
                                                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>企業所在地設定</Typography>
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1 }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', width: '100px' }}>
                                                        <CheckCircleIcon sx={{ color: isSetInternalCompanyName && isSetCustomerCompanyName ? 'green' : 'red', fontSize: '40px' }} />
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Box sx={{ marginLeft: '20px', marginBottom: '10px' }}>
                                                            <Typography sx={{ color: 'darkred', fontWeight: 'bold' }}>
                                                                本設定の情報は、契約を締結した際に署名欄へ印字されます。<br />
                                                                システムに登録済みの拠点情報をプルダウンメニューから選択、あるいは直接入力する事ができます。
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'row', border: '2px solid lightgray', marginBottom: '10px', padding: '20px' }}>
                                                            <Box sx={{ width: '50%' }}>
                                                                <Box sx={{ bgcolor: 'lightgreen', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>自社情報</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '40px' }}>
                                                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                        <InputLabel id="internal_select">拠点選択</InputLabel>
                                                                        <Select
                                                                            labelId="internal-select-label"
                                                                            id="internal-select"
                                                                            value={selectedInternalLocation}
                                                                            onChange={handleSelectChange_internalCompany}
                                                                            label="拠点選択"
                                                                            variant="standard"
                                                                            sx={{ width: '70%', fontSize: '20px', fontWeight: 'bold', backgroundColor: 'grey.200', paddingLeft: '20px' }}
                                                                        >
                                                                            {internalLocationList.map((item: Location, index) => (
                                                                                <MenuItem key={index} value={item.location_name}>{item.location_name}</MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    </FormControl>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                    <Controller
                                                                        name="own_company.company_name"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <TextField
                                                                                {...field}
                                                                                id="own_company.company_name"
                                                                                label="企業名"
                                                                                variant="standard"
                                                                                placeholder="株式会社ブロックチェーン電子契約"
                                                                                sx={{ width: '100%' }}
                                                                                InputLabelProps={{ shrink: true }}
                                                                                InputProps={{
                                                                                    style: {
                                                                                        paddingLeft: '20px',
                                                                                        fontSize: '20px',
                                                                                        fontWeight: 'bold'
                                                                                    },
                                                                                }}
                                                                                onBlur={handleBlurForInternalCompanyName}
                                                                            />
                                                                        )}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                    <Controller
                                                                        name="own_company.postal_code"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <TextField
                                                                                {...field}
                                                                                id="own_company.postal_code"
                                                                                label="郵便番号"
                                                                                variant="standard"
                                                                                placeholder="123-4567"
                                                                                sx={{ width: '100%' }}
                                                                                InputLabelProps={{ shrink: true }}
                                                                                InputProps={{
                                                                                    style: {
                                                                                        paddingLeft: '20px',
                                                                                        fontSize: '20px',
                                                                                        fontWeight: 'bold'
                                                                                    },
                                                                                }}
                                                                                onChange={(e) => {
                                                                                    handlePostalCodeChange(e);
                                                                                    field.onChange(e);
                                                                                }}
                                                                            />
                                                                        )}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                    <Controller
                                                                        name="own_company.state"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <CustomPulldownMenu_ForPrefecture
                                                                                value={field.value}
                                                                                onChange={field.onChange as (event: SelectChangeEvent<string>) => void}
                                                                            />
                                                                        )}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                    <Controller
                                                                        name="own_company.city"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <TextField
                                                                                {...field}
                                                                                id="own_company.city"
                                                                                label="市区町村"
                                                                                variant="standard"
                                                                                placeholder="○○市"
                                                                                sx={{ width: '100%' }}
                                                                                InputLabelProps={{ shrink: true }}
                                                                                InputProps={{
                                                                                    style: {
                                                                                        paddingLeft: '20px',
                                                                                        fontSize: '20px',
                                                                                        fontWeight: 'bold'
                                                                                    },
                                                                                }}
                                                                            />
                                                                        )}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                    <Controller
                                                                        name="own_company.address_line"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <TextField
                                                                                {...field}
                                                                                id="own_company.address_line"
                                                                                label="町名番地"
                                                                                variant="standard"
                                                                                placeholder="○○町1-2-3"
                                                                                sx={{ width: '100%' }}
                                                                                InputLabelProps={{ shrink: true }}
                                                                                InputProps={{
                                                                                    style: {
                                                                                        paddingLeft: '20px',
                                                                                        fontSize: '20px',
                                                                                        fontWeight: 'bold'
                                                                                    },
                                                                                }}
                                                                            />
                                                                        )}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                    <Controller
                                                                        name="own_company.building"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <TextField
                                                                                {...field}
                                                                                id="own_company.building"
                                                                                label="建物名・部屋番号"
                                                                                variant="standard"
                                                                                placeholder="○○ビル"
                                                                                sx={{ width: '100%' }}
                                                                                InputLabelProps={{ shrink: true }}
                                                                                InputProps={{
                                                                                    style: {
                                                                                        paddingLeft: '20px',
                                                                                        fontSize: '20px',
                                                                                        fontWeight: 'bold'
                                                                                    },
                                                                                }}
                                                                            />
                                                                        )}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ width: '50%', marginLeft: '20px' }}>
                                                                <Box sx={{ marginBottom: '20px' }}>
                                                                    <Box sx={{ bgcolor: 'lightyellow', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                                                        <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>相手方企業情報</Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '40px' }}>
                                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                            <InputLabel id="customer_select">拠点選択</InputLabel>
                                                                            <Select
                                                                                labelId="customer-select-label"
                                                                                id="customer-select"
                                                                                value={selectedCustomerLocation}
                                                                                onChange={handleSelectChange_customerCompany}
                                                                                label="拠点選択"
                                                                                variant="standard"
                                                                                sx={{ width: '70%', fontSize: '20px', fontWeight: 'bold', backgroundColor: 'grey.200', paddingLeft: '20px' }}
                                                                            >
                                                                                {customerLocationList.map((item: Location, index) => (
                                                                                    <MenuItem key={index} value={item.location_name}>{item.location_name}</MenuItem>
                                                                                ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                        <Controller
                                                                            name="customer_company.company_name"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="customer_company.company_name"
                                                                                    label="企業名"
                                                                                    variant="standard"
                                                                                    placeholder="株式会社イースコントラクト"
                                                                                    sx={{ width: '100%' }}
                                                                                    InputLabelProps={{ shrink: true }}
                                                                                    InputProps={{
                                                                                        style: {
                                                                                            paddingLeft: '20px',
                                                                                            fontSize: '20px',
                                                                                            fontWeight: 'bold'
                                                                                        },
                                                                                    }}
                                                                                    onBlur={handleBlurForCustomerCompanyName}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                        <Controller
                                                                            name="customer_company.postal_code"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="customer_company.postal_code"
                                                                                    label="郵便番号"
                                                                                    variant="standard"
                                                                                    placeholder="123-4567"
                                                                                    sx={{ width: '100%' }}
                                                                                    InputLabelProps={{ shrink: true }}
                                                                                    InputProps={{
                                                                                        style: {
                                                                                            paddingLeft: '20px',
                                                                                            fontSize: '20px',
                                                                                            fontWeight: 'bold'
                                                                                        },
                                                                                    }}
                                                                                    onChange={(e) => {
                                                                                        handlePostalCodeChange(e);
                                                                                        field.onChange(e);
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                        <Controller
                                                                            name="customer_company.state"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <CustomPulldownMenu_ForPrefecture
                                                                                    value={field.value}
                                                                                    onChange={field.onChange as (event: SelectChangeEvent<string>) => void}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                        <Controller
                                                                            name="customer_company.city"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="customer_company.city"
                                                                                    label="市区町村"
                                                                                    variant="standard"
                                                                                    placeholder="○○市"
                                                                                    InputLabelProps={{ shrink: true }}
                                                                                    sx={{ width: '100%' }}
                                                                                    InputProps={{
                                                                                        style: {
                                                                                            paddingLeft: '20px',
                                                                                            fontSize: '20px',
                                                                                            fontWeight: 'bold'
                                                                                        },
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                        <Controller
                                                                            name="customer_company.address_line"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="customer_company.address_line"
                                                                                    label="町名番地"
                                                                                    variant="standard"
                                                                                    placeholder="○○町1-2-3"
                                                                                    InputLabelProps={{ shrink: true }}
                                                                                    sx={{ width: '100%' }}
                                                                                    InputProps={{
                                                                                        style: {
                                                                                            paddingLeft: '20px',
                                                                                            fontSize: '20px',
                                                                                            fontWeight: 'bold'
                                                                                        },
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                        <Controller
                                                                            name="customer_company.building"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="customer_company.building"
                                                                                    label="建物名・部屋番号"
                                                                                    variant="standard"
                                                                                    placeholder="○○ビル"
                                                                                    sx={{ width: '100%' }}
                                                                                    InputLabelProps={{ shrink: true }}
                                                                                    InputProps={{
                                                                                        style: {
                                                                                            paddingLeft: '20px',
                                                                                            fontSize: '20px',
                                                                                            fontWeight: 'bold'
                                                                                        },
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', border: '2px solid lightgray', marginBottom: '20px', padding: '20px', backgroundColor: 'white', marginTop: '20px' }}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>承認フロー設定</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '10px' }}>
                                                    <Box sx={{ justifyContent: 'center', textAlign: 'center' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px', color: 'darkred' }}>登録済みの承認フローから入力する場合は、以下のボタンから設定してください。
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ justifyContent: 'center', textAlign: 'center' }}>
                                                        <Button variant="contained" onClick={handleOpenInternalDialog} sx={{ marginBottom: '10px', marginRight: '50px', width: '16em', height: '40px', backgroundColor: 'darkgreen', '&:hover': { backgroundColor: 'green' } }} disabled={!selectedInternalApprovalFlowTemplate || selectedInternalApprovalFlowTemplate.length === 0}>自社承認フローを選択する</Button>
                                                        <Button variant="contained" onClick={handleOpenCustomerDialog} sx={{ marginBottom: '10px', width: '16em', height: '40px', backgroundColor: 'darkorange', '&:hover': { backgroundColor: 'orange' } }} disabled={!selectedCustomerApprovalFlowTemplate || selectedCustomerApprovalFlowTemplate.length === 0}>相手方承認フローを選択する</Button>
                                                    </Box>
                                                </Box>
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
                                                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>契約担当者設定</Typography>
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', width: '100px' }}>
                                                            <CheckCircleIcon sx={{ color: isInternalPicInpuTFormValid && isCustomerPicInpuTFormValid ? 'green' : 'red', fontSize: '40px' }} />
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Box sx={{ marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }}>
                                                                <Typography sx={{ color: 'darkred', fontWeight: 'bold' }}>
                                                                    本契約の担当者（窓口）として設定するユーザーを登録してください。
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexDirection: 'row', border: '2px solid lightgray', marginBottom: '20px', padding: '20px' }}>
                                                                <Box sx={{ width: '50%', marginRight: '20px' }}>
                                                                    <Box sx={{ bgcolor: 'lightgreen', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                                                        <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>自社担当者</Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '10px' }}>
                                                                        <Box sx={{ display: 'flex', width: '60%', marginLeft: '3%', marginBottom: '40px' }}>
                                                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                                <InputLabel id="internal_pic">自社担当者</InputLabel>
                                                                                <Select
                                                                                    labelId="internal_pic-label"
                                                                                    id="internal_pic"
                                                                                    value={selectedInternalPic}
                                                                                    onChange={handleSelectChange_internalPic}
                                                                                    label="自社担当者"
                                                                                    variant="standard"
                                                                                    sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold', backgroundColor: 'grey.200', paddingLeft: '20px' }}
                                                                                >
                                                                                    {internalUserList.map((item: ApproveUser, index) => (
                                                                                        <MenuItem key={index} value={item.user_name}>{item.user_name}</MenuItem>
                                                                                    ))}
                                                                                </Select>
                                                                            </FormControl>
                                                                        </Box>
                                                                        <Box sx={{ width: '90%', marginLeft: '5%' }}>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                <Controller
                                                                                    name="approval_flow.internal_pic.user_name"
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <TextField
                                                                                            {...field}
                                                                                            id="approval_flow.internal_pic.user_name"
                                                                                            label="氏名"
                                                                                            variant="standard"
                                                                                            sx={{ width: '100%' }}
                                                                                            InputProps={{
                                                                                                style: {
                                                                                                    paddingLeft: '20px',
                                                                                                    fontSize: '20px',
                                                                                                    fontWeight: 'bold'
                                                                                                },
                                                                                            }}
                                                                                            onBlur={handleBlurForPicInputForm}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                <Controller
                                                                                    name="approval_flow.internal_pic.position"
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <TextField
                                                                                            {...field}
                                                                                            id="approval_flow.internal_pic.position"
                                                                                            label="役職"
                                                                                            variant="standard"
                                                                                            sx={{ width: '100%' }}
                                                                                            InputProps={{
                                                                                                style: {
                                                                                                    paddingLeft: '20px',
                                                                                                    fontSize: '20px',
                                                                                                    fontWeight: 'bold'
                                                                                                },
                                                                                            }}
                                                                                            onBlur={handleBlurForPicInputForm}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                                <Controller
                                                                                    name="approval_flow.internal_pic.email"
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <TextField
                                                                                            {...field}
                                                                                            id="approval_flow.internal_pic.email"
                                                                                            label="メールアドレス"
                                                                                            variant="standard"
                                                                                            sx={{ width: '100%' }}
                                                                                            InputProps={{
                                                                                                style: {
                                                                                                    paddingLeft: '20px',
                                                                                                    fontSize: '20px',
                                                                                                    fontWeight: 'bold'
                                                                                                },
                                                                                            }}
                                                                                            onBlur={handleBlurForPicInputForm}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'start', marginLeft: '5%' }}>
                                                                        <FormControlLabel
                                                                            disabled={!isInternalPicInpuTFormValid}
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={isChecked_internalPic}
                                                                                    onChange={handleCheckboxChange_internalPic}
                                                                                />}
                                                                            label="本契約の代表者として指定する"
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                                <Box sx={{ width: '50%', marginLeft: '20px' }}>
                                                                    <Box sx={{ bgcolor: 'lightyellow', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                                                        <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>相手方担当者</Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '20px', marginBottom: '10px' }}>
                                                                            <Box sx={{ display: 'flex', width: '60%', marginLeft: '3%', marginBottom: '40px' }}>
                                                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                                    <InputLabel id="customer_pic">相手方担当者</InputLabel>
                                                                                    <Select
                                                                                        labelId="customer_pic-label"
                                                                                        id="customer_pic"
                                                                                        value={selectedCustomerPic}
                                                                                        onChange={handleSelectChange_customerPic}
                                                                                        label="相手方担当者"
                                                                                        variant="standard"
                                                                                        sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold', backgroundColor: 'grey.200', paddingLeft: '20px' }}
                                                                                    >
                                                                                        {customerUserList.map((item: ApproveUser, index) => (
                                                                                            <MenuItem key={index} value={item.user_name}>{item.user_name}</MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                </FormControl>
                                                                            </Box>
                                                                            <Box sx={{ width: '90%', marginLeft: '5%' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.customer_pic.user_name"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.customer_pic.user_name"
                                                                                                label="氏名"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForPicInputForm}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.customer_pic.position"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.customer_pic.position"
                                                                                                label="役職"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForPicInputForm}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.customer_pic.email"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.customer_pic.email"
                                                                                                label="メールアドレス"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForPicInputForm}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'start', marginLeft: '5%' }}>
                                                                            <FormControlLabel
                                                                                disabled={!isCustomerPicInpuTFormValid}
                                                                                control={
                                                                                    <Checkbox
                                                                                        checked={isChecked_customerPic}
                                                                                        onChange={handleCheckboxChange_customerPic}
                                                                                    />}
                                                                                label="本契約の代表者として指定する"
                                                                            />
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
                                                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>契約代表者設定</Typography>
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', width: '100px' }}>
                                                            <CheckCircleIcon sx={{
                                                                color: (isInternalAuthorizerInpuTFormValid && isCustomerAuthorizerInpuTFormValid) ||
                                                                    (isChecked_internalPic && isChecked_customerPic && isChecked_internalSeal && isChecked_customerSeal) ? 'green' : 'red', fontSize: '40px'
                                                            }} />
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Box sx={{ flexGrow: 1, paddingBottom: '20px' }}>
                                                            <Box sx={{ marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }}>
                                                                <Typography sx={{ color: 'darkred', fontWeight: 'bold' }}>
                                                                    本契約を合意する権限を持っている関係者を登録してください。<br />
                                                                    本項目に設定した情報は、各社の代表として契約書へ署名情報・印影が印字されます。
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexDirection: 'row', border: '2px solid lightgray', marginBottom: '20px', padding: '20px' }}>
                                                                <Box sx={{ width: '50%', marginRight: '20px' }}>
                                                                    <Box sx={{ marginBottom: '20px' }}>
                                                                        <Box sx={{ bgcolor: 'lightgreen', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                                                            <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>自社代表者</Typography>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '10px' }}>
                                                                            <Box sx={{ display: 'flex', width: '60%', marginLeft: '5%', marginBottom: '40px' }}>
                                                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                                    <InputLabel id="internal_authorizer">自社代表者</InputLabel>
                                                                                    <Select
                                                                                        labelId="internal_authorizer-label"
                                                                                        id="internal_authorizer"
                                                                                        value={selectedInternalAuthorizer}
                                                                                        onChange={handleSelectChange_internalAuthorizer}
                                                                                        label="自社代表者"
                                                                                        variant="standard"
                                                                                        sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold', backgroundColor: 'grey.200', paddingLeft: '20px' }}
                                                                                        disabled={isChecked_internalPic}
                                                                                    >
                                                                                        {internalUserList.map((item: ApproveUser, index) => (
                                                                                            <MenuItem key={index} value={item.user_name}>{item.user_name}</MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                </FormControl>
                                                                            </Box>
                                                                            <Box sx={{ width: '90%', marginLeft: '5%' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.internal_authorizer.user_name"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.internal_authorizer.user_name"
                                                                                                label="氏名"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForInternalInputForm}
                                                                                                disabled={isChecked_internalPic}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.internal_authorizer.position"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.internal_authorizer.position"
                                                                                                label="役職"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForInternalInputForm}
                                                                                                disabled={isChecked_internalPic}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.internal_authorizer.email"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.internal_authorizer.email"
                                                                                                label="メールアドレス"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForInternalInputForm}
                                                                                                disabled={isChecked_internalPic}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', width: '100%', marginBottom: '20px' }}>
                                                                            <Box sx={{ width: '100%', marginBottom: '20px' }}>
                                                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'start', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '5px' }}>
                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                                                        代表印選択<br />
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', width: '60%', marginLeft: '5%' }}>
                                                                                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                                                                                        <RadioGroup
                                                                                            value={selectType_internal}
                                                                                            onChange={handleSelectChange_selectType_internal}
                                                                                            sx={{ width: '100%' }}
                                                                                        >
                                                                                            {representativeSealSelectType.map((pref) => (
                                                                                                <FormControlLabel
                                                                                                    key={pref.value}
                                                                                                    value={pref.value}
                                                                                                    control={<Radio />}
                                                                                                    label={pref.label}
                                                                                                    sx={{ fontSize: '20px', fontWeight: 'bold' }}
                                                                                                />
                                                                                            ))}
                                                                                        </RadioGroup>
                                                                                    </FormControl>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', width: '80%', marginLeft: '10%', marginBottom: '50px' }}>
                                                                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                                        <InputLabel id="selectRepresentativeSeal">代表印選択</InputLabel>
                                                                                        <Select
                                                                                            labelId="selectRepresentativeSeal-label"
                                                                                            id="selectRepresentativeSeal"
                                                                                            value={selectedRepresentativeSeal_internal}
                                                                                            onChange={handleSelectChange_selectRepresentativeSeal_internal}
                                                                                            label="代表印選択"
                                                                                            variant="standard"
                                                                                            sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
                                                                                            disabled={selectType_internal !== 'useRepresentativeSeal'}
                                                                                        >
                                                                                            {Array.from(internalRepresentativeSealMap.keys()).map((key) => (
                                                                                                <MenuItem key={key} value={key}>
                                                                                                    {key}
                                                                                                </MenuItem>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </FormControl>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                                                    {selectType_internal === 'useRepresentativeSeal' ? (
                                                                                        <>
                                                                                            {selectedPdfPreview_internal ? (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%', height: '300px' }}>
                                                                                                    <img src={`data:image/png;base64,${selectedPdfPreview_internal}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid gray', borderRadius: '10px' }} />
                                                                                                </Box>
                                                                                            ) : (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                                                        代表印を選択してください<br />
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            {getValues('internal_seal_temp') ? (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%', height: '300px' }}>
                                                                                                    <img src={`data:image/png;base64,${getValues('internal_seal_temp')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid gray', borderRadius: '10px' }} />
                                                                                                </Box>
                                                                                            ) : (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                                                        代表印が登録されているユーザーを選択してください<br />
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                                <Box sx={{ width: '50%', marginLeft: '20px' }}>
                                                                    <Box sx={{ marginBottom: '20px' }}>
                                                                        <Box sx={{ bgcolor: 'lightyellow', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                                                            <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>相手方代表者</Typography>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '10px' }}>
                                                                            <Box sx={{ display: 'flex', width: '60%', marginLeft: '5%', marginBottom: '40px' }}>
                                                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                                    <InputLabel id="customer_authorizer">相手方代表者選択</InputLabel>
                                                                                    <Select
                                                                                        labelId="customer_authorizer-label"
                                                                                        id="customer_authorizer"
                                                                                        value={selectedCustomerAuthorizer}
                                                                                        onChange={handleSelectChange_customerAuthorizer}
                                                                                        label="相手方代表者"
                                                                                        variant="standard"
                                                                                        sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold', backgroundColor: 'grey.200', paddingLeft: '20px' }}
                                                                                        disabled={isChecked_customerPic}
                                                                                    >
                                                                                        {customerUserList.map((item: ApproveUser, index) => (
                                                                                            <MenuItem key={index} value={item.user_name}>{item.user_name}</MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                </FormControl>
                                                                            </Box>
                                                                            <Box sx={{ width: '90%', marginLeft: '5%' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.customer_authorizer.user_name"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.customer_authorizer.user_name"
                                                                                                label="氏名"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForCustomerInputForm}
                                                                                                disabled={isChecked_customerPic}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.customer_authorizer.position"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.customer_authorizer.position"
                                                                                                label="役職"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForCustomerInputForm}
                                                                                                disabled={isChecked_customerPic}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                                    <Controller
                                                                                        name="approval_flow.customer_authorizer.email"
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <TextField
                                                                                                {...field}
                                                                                                id="approval_flow.customer_authorizer.email"
                                                                                                label="メールアドレス"
                                                                                                variant="standard"
                                                                                                sx={{ width: '100%' }}
                                                                                                InputProps={{
                                                                                                    style: {
                                                                                                        paddingLeft: '20px',
                                                                                                        fontSize: '20px',
                                                                                                        fontWeight: 'bold'
                                                                                                    },
                                                                                                }}
                                                                                                onBlur={handleBlurForCustomerInputForm}
                                                                                                disabled={isChecked_customerPic}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', width: '100%', marginBottom: '20px' }}>
                                                                            <Box sx={{ width: '100%', marginBottom: '20px' }}>
                                                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'start', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '5px' }}>
                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                                                        代表印選択<br />
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', width: '60%', marginLeft: '5%' }}>
                                                                                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                                                                                        <RadioGroup
                                                                                            value={selectType_customer}
                                                                                            onChange={handleSelectChange_selectType_customer}
                                                                                            sx={{ width: '100%' }}
                                                                                        >
                                                                                            {representativeSealSelectType.map((pref) => (
                                                                                                <FormControlLabel
                                                                                                    key={pref.value}
                                                                                                    value={pref.value}
                                                                                                    control={<Radio />}
                                                                                                    label={pref.label}
                                                                                                    sx={{ fontSize: '20px', fontWeight: 'bold' }}
                                                                                                />
                                                                                            ))}
                                                                                        </RadioGroup>
                                                                                    </FormControl>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', width: '80%', marginLeft: '10%', marginBottom: '50px' }}>
                                                                                    <FormControl variant="standard" sx={{ width: '100%' }}>
                                                                                        <InputLabel id="selectRepresentativeSeal">代表印選択</InputLabel>
                                                                                        <Select
                                                                                            labelId="selectRepresentativeSeal-label"
                                                                                            id="selectRepresentativeSeal"
                                                                                            value={selectedRepresentativeSeal_customer}
                                                                                            onChange={handleSelectChange_selectRepresentativeSeal_customer}
                                                                                            label="代表印選択"
                                                                                            variant="standard"
                                                                                            sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
                                                                                            disabled={selectType_customer !== 'useRepresentativeSeal'}
                                                                                        >
                                                                                            {Array.from(customerRepresentativeSealMap.keys()).map((key) => (
                                                                                                <MenuItem key={key} value={key}>
                                                                                                    {key}
                                                                                                </MenuItem>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </FormControl>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                                                    {selectType_customer === 'useRepresentativeSeal' ? (
                                                                                        <>
                                                                                            {selectedPdfPreview_customer ? (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginLeft: '5%', width: '90%', height: '300px' }}>
                                                                                                    <img src={`data:image/png;base64,${selectedPdfPreview_customer}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid gray', borderRadius: '10px' }} />
                                                                                                </Box>
                                                                                            ) : (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                                                        代表印を選択してください<br />
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            {getValues('customer_seal_temp') ? (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginLeft: '5%', width: '90%', height: '300px' }}>
                                                                                                    <img src={`data:image/png;base64,${getValues('customer_seal_temp')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid gray', borderRadius: '10px' }} />
                                                                                                </Box>
                                                                                            ) : (
                                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                                                        代表印が登録されているユーザーを選択してください<br />
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </Box>
                                                                            </Box>
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
                                                            <CheckCircleIcon sx={{ color: 'green', fontSize: '40px' }} />
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
                                                                        <Box sx={{ marginLeft: '10%', marginRight: '10%', marginBottom: '10px' }}>
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
                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                                                                                <Button variant="contained" onClick={() => addInternalApprovers()} sx={{ marginBottom: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>追加する</Button>
                                                                                {isInternalApproverAdded && (
                                                                                    <Button variant="contained" onClick={() => clearTempInternalApprover()} sx={{ marginBottom: '10px', marginLeft: '10px', width: '100px', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}>クリア</Button>
                                                                                )}
                                                                            </Box>
                                                                            {isInternalApproverAdded && (
                                                                                <> {/* 承認フロー行 */}
                                                                                    <Box sx={{ backgroundColor: 'grey.200', border: '1px solid lightgray' }}>
                                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                            <Box sx={{ width: '90%', py: 2, paddingTop: '20px', paddingBottom: '20px' }}>
                                                                                                <ApproveFlowTableWithDeleteButton
                                                                                                    isAuthorizerAdded={isInternalAuthorizerInpuTFormValid}
                                                                                                    selectedApproverData={selectedValuesForInternalApprover}
                                                                                                    user_name={getValues('approval_flow.internal_authorizer.user_name')}
                                                                                                    position={getValues('approval_flow.internal_authorizer.position')}
                                                                                                    email={getValues('approval_flow.internal_authorizer.email')}
                                                                                                    onChangeApproverList={setSelectedValuesForInternalApprover}
                                                                                                />
                                                                                            </Box>
                                                                                        </Box>
                                                                                    </Box>
                                                                                </>
                                                                            )}
                                                                            {!isInternalApproverAdded && (
                                                                                <> {/* 代表者行 */}
                                                                                    <Box sx={{ backgroundColor: 'grey.200', border: '1px solid lightgray' }}>
                                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                            <Box sx={{ width: '90%', py: 2, paddingTop: '20px', paddingBottom: '20px' }}>
                                                                                                <AuthorizerTable
                                                                                                    isAuthorizerAdded={isInternalAuthorizerInpuTFormValid}
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
                                                                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center' }}>
                                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px', width: '100%' }}>
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
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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
                                                            <CheckCircleIcon sx={{ color: 'green', fontSize: '40px' }} />
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
                                                                    完了通知の送付先：「相手方と契約が締結」された際にメールを通知するユーザーを登録する（※承認依頼は送信されません）
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
                                                                        <Box sx={{ marginLeft: '10%', marginRight: '10%', marginBottom: '10px' }}>
                                                                            <Typography sx={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '20px' }}>
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
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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
                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
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
                                                                                                <ApproveFlowTableWithDeleteButton
                                                                                                    isAuthorizerAdded={isCustomerAuthorizerInpuTFormValid}
                                                                                                    selectedApproverData={selectedValuesForCustomerApprover}
                                                                                                    user_name={getValues('approval_flow.customer_authorizer.user_name')}
                                                                                                    position={getValues('approval_flow.customer_authorizer.position')}
                                                                                                    email={getValues('approval_flow.customer_authorizer.email')}
                                                                                                    onChangeApproverList={setSelectedValuesForCustomerApprover}
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
                                                                                                    isAuthorizerAdded={isCustomerAuthorizerInpuTFormValid}
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
                                                                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center' }}>
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
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}>
                                        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                            <Typography>戻る</Typography>
                                        </Button>
                                        <Button
                                            variant="contained"
                                            disabled={!fileUploaded || !isSetInternalCompanyName || !isSetCustomerCompanyName
                                                || !isInternalPicInpuTFormValid || !isCustomerPicInpuTFormValid
                                                || !isInternalAuthorizerInpuTFormValid || !isCustomerAuthorizerInpuTFormValid}
                                            onClick={handleSubmit(onPreview)}
                                            sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                            <Typography>確認する</Typography>
                                        </Button>
                                    </Box>
                                </Box >
                            </>
                        )}
                        {
                            isPreviewVisible && (
                                <>
                                    <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5em' }}>
                                        こちらの内容で登録します。よろしいですか？
                                    </Typography>
                                    <Box sx={{ marginTop: '20px' }}>
                                        <PreviewRegisterBasicInfo basicInfo={getValues()} file={file} templateId={selectedValueSignTemplateId} templateName={selectedValueSignTemplateName} />
                                        <PreviewApproveFlowForRegister internalApproveFlow={previewInternal} customerApproveFlow={previewCustomer} internalSeal={getValues('internal_seal')} customerSeal={getValues('customer_seal')} />
                                        <PreviewApproveFlow_forNotifier internalNotifier={getValues('approval_flow.internal_notifier')} customerNotifier={getValues('approval_flow.customer_notifier')} />
                                        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                            <Button variant="contained" onClick={handleSubmit(onPreview)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                                <Typography>戻る</Typography>
                                            </Button>
                                            <Button variant="contained" onClick={handleSubmit(onSubmit)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                                <Typography>登録する</Typography>
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
                <Modal
                    open={hErrorDialog}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{ ...registerHomeInputErrorDialogStyle, backgroundColor: '#ffeeee' }}>
                        <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            入力エラー
                        </Typography>
                        <Box bgcolor='white' sx={{ border: '1px solid lightgray', padding: '20px', marginBottom: '10px' }}>
                            <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em' }}>
                                登録フォームの入力中にエラーが発生しました。登録操作を最初からやり直してください。
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant="contained" onClick={() => navigate('/documentManagement/register')} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                <Typography>閉じる</Typography>
                            </Button>
                        </Box>
                    </Box>
                </Modal >
                <Modal
                    open={openWorkFlowDialog}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{ bgcolor: 'grey.200', height: '95vh', width: '80vw', margin: 'auto', marginTop: '2.5vh', border: '2px solid lightgray', borderRadius: '8px', padding: '20px', overflowY: 'auto' }}>
                        <WorkFlowView
                            open={openWorkFlowDialog}
                            onClose={handleCloseWorkFlowDialog}
                            onSelect={handleWorkFlowSelect}
                            companyId={
                                dialogType === 'INTERNAL'
                                    ? getValues('own_company.company_id')
                                    : getValues('customer_company.company_id')
                            }
                            companyType={
                                dialogType === 'INTERNAL'
                                    ? 'INTERNAL'
                                    : 'CUSTOMER'
                            }
                            approveFlowList={
                                dialogType === 'INTERNAL'
                                    ? selectedInternalApprovalFlowTemplate
                                    : selectedCustomerApprovalFlowTemplate
                            }
                        />
                    </Box>
                </Modal >
            </>
        );
    };
}
export default RegisterHome;