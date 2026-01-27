import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Checkbox, CircularProgress, FormControlLabel, InputAdornment, MenuItem, Modal, Radio, RadioGroup, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomPulldownMenu, { contractType, CustomPulldownMenu_ForPrefecture, effectiveDate, representativeSealSelectType } from '../../../components/elements/CustomPulldownMenu';
import { readOnlyTextFieldPaddingLessStyle, readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { baseContentsStyle, baseTextFieldStyle, createNewAgreementRequestDialogStyle, pdfPreviewDialogStyle, resendSighUrlDialogStyleConcluded_one } from '../../../styles/styles';
import api from "../../../utils/apiAccessor";
import apiExecutor from "../../../utils/apiExecutor";
import converter from "../../../utils/converter";
import validationRules from "../../../utils/validationRules";
import ApiProcessingDialog from "../common/ApiProcessingDialog";
import ErrorDialog from '../common/ErrorDialog';
import validator from 'validator';

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
    '& .MuiInputBase-input': {
        fontWeight: 'bold',
        fontSize: '20px',
    },
    '& .MuiInputLabel-root': {
        fontWeight: 'bold', // ラベルも太字
        fontSize: '18px',
    },
};

const alwaysStyledTextFieldStyle = {
    width: '100%',
    color: 'black !important',
    fontSize: '20px',
    paddingLeft: '20px',
    fontWeight: 'bold',
    '& .MuiInputBase-input': {
        color: 'black !important',
        fontSize: '20px',
        paddingLeft: '20px',
        fontWeight: 'bold',
        '-webkit-text-fill-color': 'black !important',
        opacity: 1,
    },
    '& .Mui-disabled': {
        color: 'black !important',
        opacity: 1,
        '-webkit-text-fill-color': 'black !important',
        fontSize: '20px',
        paddingLeft: '20px',
        fontWeight: 'bold',
    },
    '& .MuiInputLabel-root': {
        color: 'black !important',
        fontSize: '20px',
        fontWeight: 'bold',
        opacity: 1,
        backgroundColor: 'transparent',
        paddingLeft: '20px',
    },
    '& .MuiInputLabel-root.Mui-disabled': {
        color: 'black !important',
        fontSize: '20px',
        fontWeight: 'bold',
        opacity: 1,
        backgroundColor: 'transparent',
        paddingLeft: '20px',
    },
};

const getTableHeaderStyle = () => ({
    fontWeight: 'bold',
    fontSize: '18px',
    paddingTop: '10px',
    paddingBottom: '10px'
});

const getTableCellStyle = (row: any) => ({
    fontSize: '16px',
    fontWeight: 'bold',
    color: row.role === '代表者' ? 'darkred' : 'brack',
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
interface NewAgreementApprover {
    company_name: string, // 会社名
    position: string, // 役職
    user_name: string, // 氏名
    email: string, // メールアドレス
};

interface ApproveUser {
    user_name: string;
    position: string;
    email: string;
};

interface UserData {
    email: string,
    position: string,
    user_name: string,
    file?: string,
};

// 承認者の初期値
const initialUser: UserData = {
    user_name: '',
    position: '',
    email: '',
    file: '',
};

// 承認者の初期値
const initialApprover: NewAgreementApprover = {
    user_name: '',
    company_name: '',
    position: '',
    email: '',
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

const initialApprovers: NewAgreementApprover[] = [initialApprover];
const initialUsers: UserData[] = [initialUser];

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

interface CustomerPic {
    approver_id: string;
    user_name: string;
    company_name: string;
    position: string;
    email: string;
}

// 書類情報一覧の表の列名を示すインタフェース
interface DocumentListColumns {
    // ユーザー名
    user_name: string,
    // メールアドレス
    email: CustomerPic;
    // 権限（管理者／一般／ゲスト）
    authority: string;
};

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

type UserList = {
    user_name: string;
    email: string;
    authority: string;
};

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
    submission_period?: string;
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

interface Signatures {
    user_name: string;
    company_name: string;
    position: string;
    email: string;
    role: string;
    signed_time: string;
    valid: boolean;
};

interface SignTemplate {
    template_id: string,
    template_name: string,
    type: string,
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

interface RegisterdUserInfo {
    user_id: string,
    user_name: string,
    company_id: string,
    location_id: string,
    position: string,
    email: string,
    file: string,
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
};

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
};

// 契約書新規作成のステップ（定数）
const CREATEINFO_STEP = 0;
const MODIFYINFO_STEP = 1;
const USEINFO_STEP = 2;
const PREVIEW_NEWAGREEMENT_STEP = 3;
const PREVIEW_MODIFYAGREEMENT_STEP = 3;
const PREVIEW_STEP = 9;
const MODIFY_STEP = 10;

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const RegisterNewAgreementUseExistDataDialog = (props: any) => {
    const location = useLocation();
    const navigate = useNavigate();

    // 契約書idに対する承認フロー
    const [presentData, setPresentData] = useState<any>(location.state?.record);
    // pdf読み込み中を表すフラグ
    const [pdfIsLoading, setPdfIsLoading] = useState(false);
    // 契約書idに対する承認フロー
    const [approveFlowData, setApproveFlowData] = useState<AgreementFlow>(initialAgreementFlow);
    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);
    // 署名履歴の署名者リスト
    const [approveUserList, setApproveUserList] = useState<Signatures[]>([]);
    // 契約締結日時
    const [latestSignedTime, setLatestSignedTime] = useState('');

    // PDFファイルプレビューダイアログの開閉状態
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);
    // 契約書idに対する承認フロー
    const [presentApproveFlowData, setPresentApproveFlowData] = useState<any>(props.approveFlowData);

    // ダイアログの開閉状態
    const [createNewAgreementDialogOpen, setCreateNewAgreementDialogOpen] = useState(false);

    // フォームの入力値チェック（企業情報）
    const [isCompanyFormValid, setIsCompanyFormValid] = useState(false);
    // フォームの入力値チェック（企業情報）
    const [isInternalFormValid, setIsInternalFormValid] = useState(false);
    // フォームの入力値チェック（企業情報）
    const [isCustomerFormValid, setIsCustomerFormValid] = useState(false);

    const [internalUserList, setInternalUserList] = useState<any[]>([]);
    const [customerUserList, setCustomerUserList] = useState<any[]>([]);

    const [internalRepresentativeSealList, setInternalRepresentativeSealList] = useState<any[]>([]);
    const [customerRepresentativeSealList, setCustomerRepresentativeSealList] = useState<any[]>([]);

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
    const [internalThemeValue, setInternalThemeValue] = useState(0);

    // ユーザーロール選択タブ制御（顧客）
    const customerTheme = useTheme();
    const [customerThemeValue, setCustomerThemeValue] = useState(0);

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

    // 代表印（自社）
    const [internalRepresentativeSealMap, setInternalRepresentativeSealMap] = useState<Map<string, string>>(new Map());
    // 代表印（相手方）
    const [customerRepresentativeSealMap, setCustomerRepresentativeSealMap] = useState<Map<string, string>>(new Map());

    /***
     *
     * 契約基本情報設定フィールド
     *
     */
    // 契約種別
    const [selectedAgreementTypeValue, setSelectedAgreementTypeValue] = useState<string>('');
    // 取引金額
    const inputDealAmountRef = useRef<HTMLInputElement>(null);
    // 署名用URL有効期限
    const [selectedUrlExpirationDateValue, setSelectedUrlExpirationDateValue] = useState<string>('');

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


    // 署名テンプレート
    const [signTemplateList, setSignTemplateList] = useState<SignTemplate[]>([]);
    const [selectedValueSignTemplateName, setSelectedValueSignTemplateName] = useState<string>('');
    const [selectedValueSignTemplateId, setSelectedValueSignTemplateId] = useState<string>('');

    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    useEffect(() => {

        // 非同期処理を開始する前にローディング状態をtrueに設定
        setIsLoading(true);

        const fetchData = async () => {
            setCreateNewAgreementDialogOpen(true);

            try {
                // 追加情報をAPIから取得
                // 追加情報：
                // 代表印、承認フロー（自社・相手方） → 必要な情報を全てDynamoDBから取得する（T.B.D）
                setExecuteApiDialogOpen(true); // ローディング表示
                // const res = await api.getAdditionalAgreementInfo(presentData.agreement_id);
                const res = await apiExecutor.fetchGetAgreementSignatures(presentData.agreement_id);
                if (res.status === api.HTTP_OK) {
                    const additionalInfo = await res.json();
                    // 取得した情報をstateにセット（例: setAdditionalAgreementInfo(additionalInfo);）
                    console.log(additionalInfo);
                } else {
                    setErrorCode(res.status);
                    setErrorProcess('追加契約情報取得');
                    setExecuteFailedApiDialogOpen(true);
                };

                const responseTemplateList = await apiExecutor.fetchGetSignedTemplateList();
                if (res.status === api.HTTP_OK) {
                    const templateList = await responseTemplateList.json();
                    // 署名テンプレートリストを設定
                    setSignTemplateList(templateList);
                    setSelectedValueSignTemplateId(templateList[0].template_id);
                    setSelectedValueSignTemplateName(templateList[0].template_name);
                    setValue('template_id', templateList[0].template_id);
                } else {
                    setErrorCode(res.status);
                    setErrorProcess('追加契約情報取得');
                    setExecuteFailedApiDialogOpen(true);
                };

                // 締結時の代表印取得（自社・相手方）
                const representativeSeal = await apiExecutor.fetchGetConcludedRepresentativeSeal(presentData.agreement_id);
                if (representativeSeal.status === api.HTTP_OK) {
                    const additionalInfo = await representativeSeal.json();
                    // 取得した情報をstateにセット（例: setAdditionalAgreementInfo(additionalInfo);）
                    console.log(additionalInfo);
                    setInternalRepresentativeSeal(additionalInfo.internal_seal);
                    setCustomerRepresentativeSeal(additionalInfo.customer_seal);

                    setValue('internal_seal', additionalInfo.internal_seal);
                    setValue('customer_seal', additionalInfo.customer_seal);
                    setValue('internal_seal_temp', additionalInfo.internal_seal);
                    setValue('customer_seal_temp', additionalInfo.customer_seal);
                } else {
                    setErrorCode(representativeSeal.status);
                    setErrorProcess('追加契約情報取得');
                    setExecuteFailedApiDialogOpen(true);
                };

                // 承認フロー取得
                const respo = await apiExecutor.fetchGetAgreementApprovals(presentData.agreement_id);
                if (respo.status === api.HTTP_OK) {
                    const additionalInfo = await respo.json();
                    const notifierList = Array.isArray(additionalInfo) ? additionalInfo : [];

                    // additionalInfoからinternal_approverを抽出してセット
                    const internalApprovers = Array.isArray(additionalInfo.internal_approver)
                        ? additionalInfo.internal_approver
                        : additionalInfo.internal_approver
                            ? [additionalInfo.internal_approver]
                            : [];
                    setInternalApproverList(internalApprovers);

                    // additionalInfoからcustomer_approverを抽出してセット
                    const customerApprovers = Array.isArray(additionalInfo.customer_approver)
                        ? additionalInfo.customer_approver
                        : additionalInfo.customer_approver
                            ? [additionalInfo.customer_approver]
                            : [];
                    setCustomerApproverList(customerApprovers);

                    // additionalInfoからinternal_notifireを抽出してセット
                    const internalNotifiers = Array.isArray(additionalInfo.internal_notifier)
                        ? additionalInfo.internal_notifier
                        : additionalInfo.internal_notifier
                            ? [additionalInfo.internal_notifier]
                            : [];
                    setInternalNotifierList(internalNotifiers);

                    // additionalInfoからcustomer_notifireを抽出してセット
                    const customerNotifiers = Array.isArray(additionalInfo.customer_notifier)
                        ? additionalInfo.customer_notifier
                        : additionalInfo.customer_notifier
                            ? [additionalInfo.customer_notifier]
                            : [];
                    setCustomerNotifierList(customerNotifiers);

                    // setWorkFlowNotifierList(notifierList);

                    if (presentData.own_company.company_name) {
                        setIsSetInternalCompanyName(true);
                    };

                    if (presentData.customer_company.company_name) {
                        setIsSetCustomerCompanyName(true);
                    };

                    const internalUserList = await apiExecutor.fetchGetUserData(presentData.own_company.company_id);
                    if (internalUserList.status === api.HTTP_OK) {
                        const additionalInfo = await internalUserList.json();

                        const userList = additionalInfo.filter((user: any) => user.isRepresentativeSeal === false);
                        const representativeSealList = additionalInfo.filter((user: any) => user.isRepresentativeSeal === true);

                        setInternalUserList(userList);
                        setInternalRepresentativeSealList(representativeSealList);

                        // 登録済み代表印がある場合は追加する
                        if (representativeSealList.length > 0) {
                            representativeSealList.forEach((user: { user_name: string; file: string }) => {
                                internalRepresentativeSealMap.set(user.user_name, user.file);
                                setInternalRepresentativeSealMap(new Map(internalRepresentativeSealMap));
                            });
                        };
                    } else {
                        setErrorCode(internalUserList.status);
                        setErrorProcess('追加契約情報取得');
                        setExecuteFailedApiDialogOpen(true);
                    };

                    const customerUserList = await apiExecutor.fetchGetUserData(presentData.customer_company.company_id);
                    if (customerUserList.status === api.HTTP_OK) {
                        const additionalInfo = await customerUserList.json();

                        const userList = additionalInfo.filter((user: any) => user.isRepresentativeSeal === false);
                        const representativeSealList = additionalInfo.filter((user: any) => user.isRepresentativeSeal === true);

                        setCustomerUserList(userList);
                        setCustomerRepresentativeSealList(representativeSealList);
                    } else {
                        setErrorCode(customerUserList.status);
                        setErrorProcess('追加契約情報取得');
                        setExecuteFailedApiDialogOpen(true);
                    };

                } else {
                    setErrorCode(res.status);
                    setErrorProcess('追加契約情報取得');
                    setExecuteFailedApiDialogOpen(true);
                };
            } catch (error) {
                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('追加契約情報取得');
                setExecuteFailedApiDialogOpen(true);
            } finally {
                setExecuteApiDialogOpen(false);
            };
        };

        fetchData();
    }, []);

    // ユーザー情報から必要な値だけ抽出する関数
    const pickUserFields = (user: any) => {
        if (!user) return undefined;
        const { company_name, user_name, position, email } = user;
        return { company_name, user_name, position, email };
    };

    // 承認者リストの初期値を決定する関数
    const getInitialApprovers = (approvers: any) => {
        if (Array.isArray(approvers) && approvers.length > 0) {
            return approvers.map(pickUserFields).filter(Boolean);
        }
        return [];
    };

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
                    company_id: props.selectedInfo.own_company?.company_id ?? '',
                    company_name: presentData?.own_company.company_name ?? '',
                    postal_code: presentData?.own_company.postal_code ?? '',
                    state: presentData?.own_company.state ?? '',
                    city: presentData?.own_company.city ?? '',
                    address_line: presentData?.own_company.address_line ?? '',
                    building: presentData?.own_company.building ?? '',
                },
                customer_company: {
                    company_id: props.selectedInfo.customer_company.company_id ?? '',
                    company_name: presentData?.customer_company.company_name ?? '',
                    postal_code: presentData?.customer_company.postal_code ?? '',
                    state: presentData?.customer_company.state ?? '',
                    city: presentData?.customer_company.city ?? '',
                    address_line: presentData?.customer_company.address_line ?? '',
                    building: presentData?.customer_company.building ?? '',
                },
                type: contractType[0].value,
                deal_amount: presentData?.deal_amount ?? 0,
                conclusion_date: dayjs(),
                expiration_date: dayjs().add(1, 'year').subtract(1, 'day'),
                template_id: location?.state?.signTemplateList?.[0]?.template_id ?? '',
                approval_flow: {
                    internal_pic: pickUserFields(presentData?.internal_pic),
                    internal_approver: getInitialApprovers(presentData?.internal_approver),
                    internal_approver_temp: initialApprover, // 登録リクエストを送信する際に削除する
                    internal_authorizer: pickUserFields(props.internalAuthorizer),
                    internal_notifier: getInitialApprovers(presentData?.internal_notifier),
                    internal_notifier_temp: initialApprover,
                    customer_pic: pickUserFields(presentData?.customer_pic),
                    customer_approver: getInitialApprovers(presentData?.customer_approver),
                    customer_approver_temp: initialApprover, // 登録リクエストを送信する際に削除する
                    customer_authorizer: pickUserFields(props.customerAuthorizer),
                    customer_notifier: getInitialApprovers(presentData?.customer_notifier),
                    customer_notifier_temp: initialApprover,
                    submission_period: 1,
                }
            }
        }
    );

    /**
     * --------------------------------------
     * 
     * 契約情報を流用して、新しい契約書を作成する
     * 
     * --------------------------------------
     */
    /***
     *
     * 契約書アップロード／契約基本情報
     *
     */
    // ファイル名
    const [fileName, setFileName] = useState<string | null>(null);
    // ファイル情報
    const [file, setFile] = useState<File>();
    // ファイルアップロード状況
    const [fileUploaded, setFileUploaded] = useState(false);
    // data url形式のbase64にエンコードされたpdfファイル
    const [createNewAgreementPdfBase64, setCreateNewAgreementPdfBase64] = useState('');

    // ドロップされたファイルを処理する
    const onDropPdfFile = useCallback((acceptedFiles: File[]) => {
        handleFileUpload(acceptedFiles);
    }, []);
    const { getRootProps: getRootPropsPdfFile, getInputProps: getInputPropsPdfFile, isDragActive: isDragActivePdfFile } = useDropzone({ onDrop: onDropPdfFile });

    // 契約開始日・終了日の初期値を設定
    const today = dayjs();
    const defaultConclusionDate = today;
    const defaultExpirationDate = today.add(1, 'year').subtract(1, 'day');

    const [conclusionDate, setConclusionDate] = useState<Dayjs | null>(defaultConclusionDate);
    const [expirationDate, setExpirationDate] = useState<Dayjs | null>(defaultExpirationDate);

    // 現行契約の承認フロー、通知先
    const [internalApproverList, setInternalApproverList] = useState<any[]>([]);
    const [internalNotifierList, setInternalNotifierList] = useState<any[]>([]);
    const [customerApproverList, setCustomerApproverList] = useState<any[]>([]);
    const [customerNotifierList, setCustomerNotifierList] = useState<any[]>([]);

    /***
     *
     * 契約内容をコピーして新しい承認フローを作成する
     *
     */
    const [copyDealAmount, setCopyDealAmount] = useState(presentData?.deal_amount.toLocaleString() || '');
    const [copySubmissionPeriod, setCopySubmissionPeriod] = useState(approveFlowData?.submission_period || '');

    /***
     *
     * 契約書アップロード（契約書を流用して新しい契約フローを開始する）
     *
     */
    // PDFファイルプレビューダイアログの開閉状態
    const [createNewAgreementPdfPreviewDialogOpen, setCreateNewAgreementPdfPreviewDialogOpen] = useState(false);
    const handleCreateNewAgreementPdfPreviewDialogClose = () => setCreateNewAgreementPdfPreviewDialogOpen(false);
    // ダイアログを開く関数
    const openCreateNewAgreementPdfPreviewDialog = () => {
        setCreateNewAgreementPdfPreviewDialogOpen(true);
    };

    const handleFileUpload = (files: File[]) => {

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
                setCreateNewAgreementPdfBase64(base64String);
                setValue('file', base64String);
            };
            reader.readAsDataURL(file);

            setFileUploaded(true);
        }
    };

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
     * 管理者権限保持者向けの画面制御処理
     *
     */
    const themeCreateNewAgreement = useTheme();
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleUseInfo = () => {
        setActiveStep(USEINFO_STEP);
    };

    const handleModifyInfo = () => {
        setActiveStep(MODIFYINFO_STEP);
    };

    const handlePreviewNewAgreementStep = () => {
        setActiveStep(PREVIEW_NEWAGREEMENT_STEP);
    };

    const handlePreviewModifyAgreementStep = () => {
        setActiveStep(PREVIEW_MODIFYAGREEMENT_STEP);
    };

    const handleTopStep = () => {
        setActiveStep(CREATEINFO_STEP);
    };

    const handlePreviewStep = () => {
        setActiveStep(PREVIEW_STEP);
    };

    const handleModifyStep = () => {

        setSelectedInternalPicUser(presentData?.internal_pic);
        setSelectedInternalAuthorizerUser(approveFlowData?.internal_authorizer);
        setSelectedCustomerPicUser(presentData?.customer_pic);
        setSelectedCustomerAuthorizerUser(approveFlowData?.customer_authorizer);



        setActiveStep(MODIFY_STEP);
    };

    // 締結済み契約書から新規契約書を作成する
    const createNewAgreementTheme = useTheme();
    const [createNewAgreementValue, setCreateNewAgreementValue] = useState(0);

    const handleCreateNewAgreementValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setCreateNewAgreementValue(newValue);
    };

    // 締結済み契約書情報を修正して新規契約書を作成する
    const modifyNewAgreementTheme = useTheme();
    const [modifyNewAgreementValue, setModifyNewAgreementValue] = useState(0);

    const handleModifyNewAgreementValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setModifyNewAgreementValue(newValue);
    };

    // 締結済み契約書情報を修正して新規契約書を作成する
    const modifyInternalInfoTheme = useTheme();
    const [modifyInternalInfoValue, setModifyInternalInfoValue] = useState(0);

    const handleModifyInternalInfoValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setModifyInternalInfoValue(newValue);
    };

    // 締結済み契約書情報を修正して新規契約書を作成する
    const modifyCustomerInfoTheme = useTheme();
    const [modifyCustomerInfoValue, setModifyCustomerInfoValue] = useState(0);

    const handleModifyCustomerInfoValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setModifyCustomerInfoValue(newValue);
    };

    // const [createNewAgreementActiveStep, setCreateNewAgreementActiveStep] = useState(0);

    // const handleNext_createNewAgreement = () => {
    //     setCreateNewAgreementActiveStep((prevActiveStep_createNewAgreement) => prevActiveStep_createNewAgreement + 1);
    // };

    // const handleBack_createNewAgreement = () => {
    //     setCreateNewAgreementActiveStep((prevActiveStep_createNewAgreement) => prevActiveStep_createNewAgreement - 1);
    // };

    // const handleNext_useInfo = () => {
    //     setCreateNewAgreementActiveStep((prevActiveStep_createNewAgreement) => prevActiveStep_createNewAgreement + 1);
    // };

    // const handleNext_modifyInfo = () => {
    //     setCreateNewAgreementActiveStep((prevActiveStep_createNewAgreement) => prevActiveStep_createNewAgreement + 1);
    // };

    const getTabBgColor = () => {

        const isValid = true;
        // 例: tabIndexごとにバリデーション結果を判定
        // ここでは仮にvaliateMessageが"全ての署名が有効です"ならOKとする
        if (isValid) {
            return 'darkgreen'; // 成功時
        } else {
            return 'lightred'; // デフォルト
        }
    };

    /***
     *
     * 自社担当者選択
     *
     */
    const [selectedInternalPicValue, setSelectedInternalPicValue] = useState<string>('');
    const [selectedInternalPicUser, setSelectedInternalPicUser] = useState<any>(null);
    const [isCheckworkFlowInternalPicUser, setIsCheckWorkFlowInternalPicUser] = useState<boolean>(false);

    const handleSelectInternalPicChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedInternalPicValue(userName);

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
                // // 代表者の入力フォームをチェック
                // isAuthorizerInputComplete();
            };

            // // フォームの入力値をチェック
            // isPicInputComplete();
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

        // // 担当者の入力フォームをチェック
        // isPicInputComplete();

        // // 代表者の入力フォームをチェック
        // isAuthorizerInputComplete();
    };

    /***
     *
     * 自社代表者選択
     *
     */
    const [selectedInternalAuthorizerValue, setSelectedInternalAuthorizerValue] = useState<string>('');
    const [selectedInternalAuthorizerUser, setSelectedInternalAuthorizerUser] = useState<any>(null);
    const [isCheckworkFlowInternalAuthorizerUser, setIsCheckWorkFlowInternalAuthorizerUser] = useState<boolean>(false);

    const handleSelectedInternalAuthorizerChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedInternalAuthorizerValue(userName);

        const selectedUser = internalUserList.find(approveFlow => approveFlow.user_name === event.target.value);
        if (selectedUser) {
            setValue('approval_flow.internal_authorizer.user_name', selectedUser.user_name);
            setValue('approval_flow.internal_authorizer.company_name', getValues().own_company.company_name);
            setValue('approval_flow.internal_authorizer.position', selectedUser.position);
            setValue('approval_flow.internal_authorizer.email', selectedUser.email);
            setSelectedInternalSeal(selectedUser.file || '');

            if (selectedUser.file) {
                // 代表印が登録されているユーザーの場合に設定する
                setValue('internal_seal_temp', selectedUser.file);
                // setInternalSealFileUploaded(true);

                // 選択中の代表印を退避
                setSelectedInternalSeal(selectedUser.file);
            };
        };

        // // フォームの入力値をチェック
        // isAuthorizerInputComplete();
    };

    /***
     *
     * 相手方担当者選択
     *
     */
    const [selectedCustomerPicValue, setSelectedCustomerPicValue] = useState<string>('');
    const [selectedCustomerPicUser, setSelectedCustomerPicUser] = useState<any>(null);
    const [isCheckworkFlowCustomerPicUser, setIsCheckWorkFlowCustomerPicUser] = useState<boolean>(false);

    const handleSelectCustomerPicChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedCustomerPicValue(userName);

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
                // // 代表者の入力フォームをチェック
                // isAuthorizerInputComplete();
            };

            // // フォームの入力値をチェック
            // isPicInputComplete();
        };
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

        // // 担当者の入力フォームをチェック
        // isPicInputComplete();

        // // 代表者の入力フォームをチェック
        // isAuthorizerInputComplete();
    };

    /***
     *
     * 自社代表者選択
     *
     */
    const [selectedCustomerAuthorizerValue, setSelectedCustomerAuthorizerValue] = useState<string>('');
    const [selectedCustomerAuthorizerUser, setSelectedCustomerAuthorizerUser] = useState<any>(null);
    const [isCheckworkFlowCustomerAuthorizerUser, setIsCheckWorkFlowCustomerAuthorizerUser] = useState<boolean>(false);

    const handleSelectedCustomerAuthorizerChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedCustomerAuthorizerValue(userName);

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

        // // フォームの入力値をチェック
        // isAuthorizerInputComplete();
    };

    // 自社代表印表示ダイアログの開閉状態
    const [internalRepresentativeSealDialogOpen, setInternalRepresentativeSealDialogOpen] = useState(false);
    const handleInternalRepresentativeSealDialogClose = () => setInternalRepresentativeSealDialogOpen(false);
    const [selectedInternalRepresentativeSeal, setSelectedInternalRepresentativeSeal] = useState<string>('');
    const [internalRepresentativeSeal, setInternalRepresentativeSeal] = useState<string>('');

    // 相手方代表印表示ダイアログの開閉状態
    const [customerRepresentativeSealDialogOpen, setCustomerRepresentativeSealDialogOpen] = useState(false);
    const handleCustomerRepresentativeSealDialogClose = () => setCustomerRepresentativeSealDialogOpen(false);
    const [selectedCustomerRepresentativeSeal, setSelectedCustomerRepresentativeSeal] = useState<string>('');
    const [customerRepresentativeSeal, setCustomerRepresentativeSeal] = useState<string>('');

    // 承認フローリスト
    const [workFlowNotifierList, setWorkFlowNotifierList] = useState<any[]>([]);

    // ダイアログを開く関数
    const openRepresentativeSealDialog = (type: string) => {
        if (type === 'INTERNAL') {
            setInternalRepresentativeSealDialogOpen(true);
        } else if (type === 'CUSTOMER') {
            setCustomerRepresentativeSealDialogOpen(true);
        }
    };

    // 相手方代表印表示ダイアログの開閉状態
    const [confirmApprovalFlowDialogOpen, setConfirmApprovalFlowDialogOpen] = useState(false);
    const handleConfirmApprovalFlowDialogClose = () => setConfirmApprovalFlowDialogOpen(false);

    /***
     *
     * 契約書の登録処理
     *
     */
    const onRegisterAgreement = (data: FormInput) => {
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
    };

    // 契約書を登録する
    const registerAgreement = async (body: any) => {

        setExecuteApiDialogOpen(true);
        try {

            console.log('登録リクエストボディ:', body);

            const res = await api.postAgreement(body);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('契約書登録処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            };

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

    const closeCreateNewAgreementDialog = () => {
        setActiveStep(0);

        // フォームの内容をリセットする
        // T.B.D

        // setCreateNewAgreementDialogOpen(false);
    };

    /***
     *
     * 契約基本情報設定フィールド
     *
     */
    // 契約種別
    const handleSelectSelectedAgreementTypeChange = (event: SelectChangeEvent<string>) => {
        setSelectedAgreementTypeValue(event.target.value as string);
        setValue('type', event.target.value);
    };

    // 取引金額
    const formatNumber = (value: any) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleDealAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            if (inputDealAmountRef.current) {
                inputDealAmountRef.current.setSelectionRange(start, end);
            }
        }, 0);
    };

    // 署名用URL有効期限
    const handleSelectedUrlExpirationDateValue = (event: SelectChangeEvent<string>) => {
        setSelectedUrlExpirationDateValue(event.target.value);
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

        // const selectedCompany = internalLocationList.find(location => location.location_name === event.target.value);
        // if (selectedCompany) {
        //     setValue('own_company.company_id', selectedCompany.company_id);
        //     setValue('own_company.company_name', selectedCompany.company_name);
        //     setValue('own_company.postal_code', selectedCompany.postal_code);
        //     setValue('own_company.state', selectedCompany.state);
        //     setValue('own_company.city', selectedCompany.city);
        //     setValue('own_company.address_line', selectedCompany.address_line);
        //     setValue('own_company.building', selectedCompany.building);

        //     setIsSetInternalCompanyName(true);
        // }
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

        // const selectedCompany = customerLocationList.find(location => location.location_name === event.target.value);
        // if (selectedCompany) {
        //     setValue('customer_company.company_id', selectedCompany.company_id);
        //     setValue('customer_company.company_name', selectedCompany.company_name);
        //     setValue('customer_company.postal_code', selectedCompany.postal_code);
        //     setValue('customer_company.state', selectedCompany.state);
        //     setValue('customer_company.city', selectedCompany.city);
        //     setValue('customer_company.address_line', selectedCompany.address_line);
        //     setValue('customer_company.building', selectedCompany.building);

        //     setIsSetCustomerCompanyName(true);
        // }
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

    /***
     *
     * 自社代表者選択
     *
     */
    const [selectedAuthorizerValue, setSelectedAuthorizerValue] = useState<string>('');
    const [selectedAuthorizerUser, setSelectedAuthorizerUser] = useState<any>(null);
    const handleSelectedAuthorizerChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedAuthorizerValue(userName);
        // 選択したユーザー情報を取得してstateにセット
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        setSelectedAuthorizerUser(user || null);
    };

    // 代表印
    const [selectType_internal, setSelectType_internal] = useState(representativeSealSelectType[0].value);
    const [selectType_customer, setSelectType_customer] = useState(representativeSealSelectType[0].value);
    const [isAuthorizerPulldownDisabled, setIsAuthorizerPulldownDisabled] = useState(true);

    // 代表者印選択 ラジオボタン切替時の処理
    const handleSelectChange_selectType_internal = (event: SelectChangeEvent<string>) => {

        const selectedValue = event.target.value;

        setSelectType_internal(selectedValue); // ラジオボタンに選択された値をセット

        // 'useRepresentativeSeal'の場合のみプルダウンを有効にする
        setIsAuthorizerPulldownDisabled(selectedValue !== 'useRepresentativeSeal');

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

        // // 代表者の入力フォームをチェック
        // isAuthorizerInputComplete();
    };

    // 代表印選択 ラジオボタンが操作された際に、代表印が登録されていたら設定する
    const changeInternalRepresentativeSeal = () => {
        setSelectedRepresentativeSeal_internal(selectedInternalRepresentativeSealName);
        setValue('internal_seal_temp', internalRepresentativeSealMap.get(selectedInternalRepresentativeSealName) || '');
    };

    // 登録済み代表印から選択する
    const handleSelectedRepresentativeSealChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedAuthorizerValue(userName);

        // 選択したユーザー情報を取得してstateにセット
        const user = internalRepresentativeSealList.find((u: any) => u.user_name === userName);
        if (user) {
            setValue('internal_seal_temp', user.file || '');
        };
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
        // // フォームの入力値をチェック
        // isAuthorizerInputComplete();
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

        // // フォームの入力値をチェック
        // isAuthorizerInputComplete();
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

        // // 代表者の入力フォームをチェック
        // isAuthorizerInputComplete();
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

        // // 代表者の入力フォームをチェック
        // isAuthorizerInputComplete();
    };


    // 自社企業名（必須フィールド）チェック
    const [isInternalUserForm, setIsInternalUserForm] = useState(false);

    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleOnChangeForInternalUserForm = () => {

        const pic_user_name = getValues('approval_flow.internal_pic.user_name');
        const pic_email = getValues('approval_flow.internal_pic.email');
        const authorizer_user_name = getValues('approval_flow.internal_authorizer.user_name');
        const authorizer_email = getValues('approval_flow.internal_authorizer.email');

        const isFilled =
            !!pic_user_name && String(pic_user_name).trim() !== '' &&
            !!pic_email && String(pic_email).trim() !== '' && validator.isEmail(String(pic_email).trim()) &&
            !!authorizer_user_name && String(authorizer_user_name).trim() !== '' &&
            !!authorizer_email && String(authorizer_email).trim() !== '' && validator.isEmail(String(authorizer_email).trim());

        setIsInternalUserForm(Boolean(isFilled));
    };

    // 自社企業名（必須フィールド）チェック
    const [isCustomerUserForm, setIsCustomerUserForm] = useState(false);

    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleOnChangeForCustomerUserForm = () => {

        const pic_user_name = getValues('approval_flow.customer_pic.user_name');
        const pic_email = getValues('approval_flow.customer_pic.email');
        const authorizer_user_name = getValues('approval_flow.customer_authorizer.user_name');
        const authorizer_email = getValues('approval_flow.customer_authorizer.email');

        const isFilled =
            !!pic_user_name && String(pic_user_name).trim() !== '' &&
            !!pic_email && String(pic_email).trim() !== '' && validator.isEmail(String(pic_email).trim()) &&
            !!authorizer_user_name && String(authorizer_user_name).trim() !== '' &&
            !!authorizer_email && String(authorizer_email).trim() !== '' && validator.isEmail(String(authorizer_email).trim());

        setIsCustomerUserForm(Boolean(isFilled));
    };

    /***
     **-------------------------
     * 承認フロー選択
     **-------------------------
     */
    const [selecteApproverValue, setSelectedApproverValue] = useState<string>('');
    const handleSelectApproverChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedApproverValue(userName);

        // 選択したユーザー情報を設定する
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        setValue('approval_flow.internal_approver_temp', user || null);
    };

    // 承認フロー設定
    const [workFlowApprovalList, setWorkFlowApprovalList] = useState<any[]>([]);

    // // 承認者をリストに追加する
    // const addInternalApprovers = () => {

    //     if (!getValues('approval_flow.internal_approver_temp.user_name') || !getValues('approval_flow.internal_approver_temp.email')) {
    //         alert('氏名とメールアドレスは入力必須です。');
    //         return;
    //     };

    //     setWorkFlowApprovalList((prev) => [...prev, getValues('approval_flow.internal_approver_temp')]);
    //     setSelectedApproverValue('');
    //     // setValue('approval_flow.internal_approver_temp', initialUser);
    // };

    // // 追加した承認者情報をクリアする
    // const clearTempInternalApprover = () => {
    //     setWorkFlowApprovalList([]);
    // };

    /***
     **-------------------------
     * 通知先選択
     **-------------------------
     */
    const [selecteNotifierValue, setSelectedNotifierValue] = useState<string>('');
    const handleSelectNotifierChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedNotifierValue(userName);

        // 選択したユーザー情報を設定する
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        setValue('approval_flow.internal_notifier_temp', user || null);
    };

    // 通知先をリストに追加する
    const addInternalNotifier = () => {

        if (!getValues('approval_flow.internal_notifier_temp.user_name') || !getValues('approval_flow.internal_notifier_temp.email')) {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        setWorkFlowNotifierList(prevList => [...prevList, getValues('approval_flow.internal_notifier_temp')]);
        setSelectedNotifierValue('');
        // setValue('approval_flow.internal_notifier_temp', initialUser);
    };

    // // 追加した承認者情報をクリアする
    // const clearTempInternalNotifier = () => {
    //     setWorkFlowNotifierList([]);
    // };

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

    const handleMoveInternalApprover = (from: number, to: number) => {
        setWorkFlowApprovalList(prev => {
            if (to < 0 || to >= prev.length) return prev;
            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            return updated;
        });
    };

    const handleDeleteApprover = (index: number) => {
        setWorkFlowApprovalList(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteNotifier = (index: number) => {
        setWorkFlowNotifierList(prev => prev.filter((_, i) => i !== index));
    };

    const handleTabChange = (tabIndex: number) => {

        if (tabIndex === 1) {
            handleOnChangeForInternalUserForm();
        };

        if (tabIndex === 2) {
            handleOnChangeForCustomerUserForm();
        };

        setCreateNewAgreementValue(tabIndex);
    };

    /***
     *
     * 自社関係者設定（バリデーション）
     *
     */
    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleOnCHangeForInternalUserForm = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        // フォームの入力値をチェック
        // const company_name = getValues('own_company.company_name');

        // if (company_name === '') {
        //     setIsSetInternalCompanyName(false);
        // } else {
        //     setIsSetInternalCompanyName(true);
        // }
    };

    /***
     *
     * 相手方関係者設定（バリデーション）
     *
     */
    // フォーカスが外れた時にチェックを行うonBlurイベントハンドラ
    const handleOnCHangeForCustomerUserForm = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // フォームの入力値をチェック
        const company_name = getValues('own_company.company_name');

        if (company_name === '') {
            setIsSetInternalCompanyName(false);
        } else {
            setIsSetInternalCompanyName(true);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0: // 契約書ファイル以外の情報は全てコピーする
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            新しい登録情報を入力してください。
                        </Typography>
                        <Box sx={{ width: '100%', overflowY: 'auto', height: '800px' }}>
                            <Box bgcolor='white' sx={{ border: '1px solid lightgray', paddingTop: '40px', paddingBottom: '20px', paddingLeft: '2%', paddingRight: '2%', marginRight: '5px', marginBottom: '20px' }}>
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
                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                                    {/* {getValues('title') ? */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '90%', marginLeft: '5%', marginRight: '5%', marginBottom: '10px' }}>
                                            <TextField
                                                variant="standard"
                                                label="アップロードファイル名"
                                                value={fileName}
                                                disabled={true}
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ ...readOnlyTextFieldPaddingLessStyle, width: '100%' }}
                                            />
                                        </Box>
                                    </Box>
                                    {/* : '※ファイルをアップロードしてください。'} */}
                                </Box>
                            </Box>
                            {/* ※ AI OCRでテキストデータを抽出し、入力データに反映させる機能を追加する予定です。 */}
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', paddingBottom: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '30px' }}>
                                    <CustomPulldownMenu
                                        label="契約種別"
                                        value={selectedAgreementTypeValue}
                                        onChange={handleSelectSelectedAgreementTypeChange}
                                        items={contractType}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '30px' }}>
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
                                                onChange={handleDealAmountChange}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">円</InputAdornment>,
                                                }}
                                                inputProps={{
                                                    autoComplete: 'off',
                                                    max: 1000000000,
                                                    ref: inputDealAmountRef,
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '30px' }}>
                                    <CustomPulldownMenu
                                        label="署名用URL有効期限（相手方企業用）"
                                        value={selectedUrlExpirationDateValue}
                                        onChange={handleSelectedUrlExpirationDateValue}
                                        items={effectiveDate}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', marginRight: '10px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <MobileDatePicker
                                                label="契約開始日"
                                                format='YYYY年MM月DD日'
                                                value={conclusionDate}
                                                onChange={newValue => setConclusionDate(newValue)}
                                                sx={{
                                                    marginY: '0.5rem',
                                                    ...baseTextFieldStyle,
                                                    '& .MuiInputBase-input': {
                                                        fontWeight: 'bold',
                                                        fontSize: '1.5em',
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontWeight: 'bold', // ラベルも太字
                                                        fontSize: '18px',
                                                    },
                                                }}
                                                minDate={dayjs('2022-01-01')}
                                                maxDate={dayjs('2050-12-31')}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '50%', marginLeft: '10px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <MobileDatePicker
                                                label="契約終了日"
                                                format='YYYY年MM月DD日'
                                                value={expirationDate}
                                                onChange={newValue => setExpirationDate(newValue)}
                                                sx={{
                                                    marginY: '0.5rem',
                                                    ...baseTextFieldStyle,
                                                    '& .MuiInputBase-input': {
                                                        fontWeight: 'bold',
                                                        fontSize: '1.5em',
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontWeight: 'bold', // ラベルも太字
                                                        fontSize: '18px',
                                                    },
                                                }}
                                                minDate={dayjs('2022-01-01')}
                                                maxDate={dayjs('2050-12-31')}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                );
            case 9: // 契約書ファイル以外の情報は全てコピーする（プレビュー表示）
                return (
                    <Box sx={{ marginBottom: '20px', height: '100vh' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            こちらの内容で登録します。よろしいですか？
                        </Typography>
                        <Box sx={{ overflowY: 'auto', height: '80vh' }}>
                            <Box sx={{ width: '100%', backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginBottom: '5px' }}>
                                    <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                        契約基本情報
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey', marginRight: '5%', marginLeft: '5%', }}>
                                    <TextField
                                        value={getValues('title')}
                                        label='件名'
                                        variant="standard"
                                        sx={disabledTextFieldStyle}
                                        disabled={true}
                                        InputProps={{
                                            disableUnderline: true,
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '10px', width: '14rem', paddingRight: '20px' }}>
                                        <Button variant="contained" onClick={openCreateNewAgreementPdfPreviewDialog} sx={{ '&:hover': { backgroundColor: 'darkblue' } }} >
                                            全画面で表示する
                                        </Button>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                    <TextField
                                        value={getValues('type')}
                                        label="契約種別"
                                        variant="standard"
                                        sx={disabledTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                    <TextField
                                        value={getValues('deal_amount').toLocaleString() + '円'}
                                        label="契約金額"
                                        variant="standard"
                                        sx={disabledTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                    <TextField
                                        value={getValues('approval_flow.submission_period') + '日'}
                                        label="署名用URL有効期限（相手方企業用）"
                                        variant="standard"
                                        sx={disabledTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                    <TextField
                                        value={getValues('conclusion_date')?.format('YYYY年MM月DD日')}
                                        label="契約開始日"
                                        variant="standard"
                                        sx={{ ...disabledTextFieldStyle, width: '48%' }}
                                        disabled={true}
                                    />
                                    <TextField
                                        value={getValues('expiration_date')?.format('YYYY年MM月DD日')}
                                        label="契約終了日"
                                        variant="standard"
                                        sx={{ ...disabledTextFieldStyle, width: '48%' }}
                                        disabled={true}
                                    />
                                </Box>
                            </Box>
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginBottom: '5px' }}>
                                    <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                        自社情報
                                    </Typography>
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                        <TextField
                                            // value={presentData?.own_company?.company_name}
                                            value={getValues('own_company.company_name')}
                                            label="企業名"
                                            variant="standard"
                                            sx={disabledTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                        <TextField
                                            value={getValues('own_company.postal_code')}
                                            label="郵便番号"
                                            variant="standard"
                                            sx={disabledTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                        <TextField
                                            value={`${getValues('own_company.state')} ${getValues('own_company.city')} ${getValues('own_company.address_line')} ${getValues('own_company.building')}`}
                                            label="住所"
                                            variant="standard"
                                            sx={disabledTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                        <TextField
                                            value={
                                                [
                                                    getValues('approval_flow.internal_pic.user_name') || '---',
                                                    getValues('approval_flow.internal_pic.position') || '---',
                                                    getValues('approval_flow.internal_pic.email') || '---'
                                                ].join('／')
                                            }
                                            label="担当者（氏名／役職／メールアドレス）"
                                            variant="standard"
                                            sx={disabledTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
                                        <TextField
                                            value={
                                                [
                                                    getValues('approval_flow.internal_authorizer.user_name') || '---',
                                                    getValues('approval_flow.internal_authorizer.position') || '---',
                                                    getValues('approval_flow.internal_authorizer.email') || '---'
                                                ].join('／')
                                            }
                                            label="代表者（氏名／役職／メールアドレス）"
                                            variant="standard"
                                            sx={disabledTextFieldStyle}
                                            disabled={true}
                                            InputProps={{
                                                disableUnderline: true,
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '10px', width: '14rem', paddingRight: '20px' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                sx={{ marginLeft: '20px', minWidth: '10rem', '&:hover': { backgroundColor: 'darkblue' } }}
                                                onClick={() => { openRepresentativeSealDialog('INTERNAL'); }}
                                            >
                                                代表印を確認する
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                            相手方情報
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                            <TextField
                                                value={getValues('customer_company.company_name')}
                                                label="企業名"
                                                variant="standard"
                                                sx={disabledTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                            <TextField
                                                value={getValues('customer_company.postal_code')}
                                                label="郵便番号"
                                                variant="standard"
                                                sx={disabledTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                            <TextField
                                                value={`${getValues('customer_company.state')} ${getValues('customer_company.city')} ${getValues('customer_company.address_line')} ${getValues('customer_company.building')}`}
                                                label="住所"
                                                variant="standard"
                                                sx={disabledTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                                            <TextField
                                                value={
                                                    [
                                                        getValues('approval_flow.customer_pic.user_name') || '---',
                                                        getValues('approval_flow.customer_pic.position') || '---',
                                                        getValues('approval_flow.customer_pic.email') || '---'
                                                    ].join('／')
                                                }
                                                label="担当者"
                                                variant="standard"
                                                sx={disabledTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
                                            <TextField
                                                value={
                                                    [
                                                        getValues('approval_flow.customer_authorizer.user_name') || '---',
                                                        getValues('approval_flow.customer_authorizer.position') || '---',
                                                        getValues('approval_flow.customer_authorizer.email') || '---'
                                                    ].join('／')
                                                }
                                                label="代表者"
                                                variant="standard"
                                                sx={disabledTextFieldStyle}
                                                disabled={true}
                                                InputProps={{
                                                    disableUnderline: true,
                                                }}
                                            />
                                            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '10px', width: '14rem', paddingRight: '20px', borderBottom: '1px solid lightgrey' }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    sx={{ marginLeft: '20px', minWidth: '10rem', '&:hover': { backgroundColor: 'darkblue' } }}
                                                    onClick={() => { openRepresentativeSealDialog('CUSTOMER'); }}
                                                >
                                                    代表印を確認する
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                            承認フロー
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                                                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                    <TableRow>
                                                        {/* <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '8%' }}>順番</TableCell> */}
                                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>氏名</TableCell>
                                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {internalApproverList?.map((row: any, index) => (
                                                        <TableRow
                                                            key={index + 1}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            {/* <TableCell align="right" sx={getTableCellStyle(row)}>{index + 1}</TableCell> */}
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.company_name}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.position}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.user_name}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.email}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow
                                                        // key={index + 1}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        {/* <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{internalApproverList?.length + 1}</TableCell> */}
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('own_company.company_name')}</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('approval_flow.internal_authorizer.position')}</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('approval_flow.internal_authorizer.user_name')}</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('approval_flow.internal_authorizer.email')}</TableCell>
                                                    </TableRow>
                                                    {customerApproverList?.map((row: any, index) => (
                                                        <TableRow
                                                            key={internalApproverList?.length + 2 + index}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            {/* <TableCell align="right" sx={getTableCellStyle(row)}>{internalApproverList?.length + 2 + index}</TableCell> */}
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.company_name}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.position}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.user_name}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.email}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow
                                                        // key={index + 1}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        {/* <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{internalApproverList?.length + 3}</TableCell> */}
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('customer_company.company_name')}</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('approval_flow.customer_authorizer.position')}</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('approval_flow.customer_authorizer.user_name')}</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }}>{getValues('approval_flow.customer_authorizer.email')}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '1rem', width: '100%', color: 'darkred', fontWeight: 'bold', marginTop: '10px' }}>
                                            承認依頼は、一覧表に表示されている順番に送信されます。
                                        </Typography>
                                    </Box>
                                    <Box>

                                    </Box>
                                </Box>
                            </Box>
                            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', borderRadius: '4px', border: '1px solid lightgray', marginBottom: '20px' }}>
                                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                        <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                            通知先
                                        </Typography>
                                    </Box>
                                    <Box>
                                        {workFlowNotifierList.length === 0 ? (
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                    通知先が登録されていません
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                        <TableRow>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {internalNotifierList?.map((row: any, index) => (
                                                            <TableRow
                                                                key={index + 1}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row?.company_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row?.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row?.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {customerNotifierList?.map((row: any, index) => (
                                                            <TableRow
                                                                key={index + 1}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row?.company_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row?.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row?.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                );
            case 10: // 修正モード
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            登録内容を修正してください。
                        </Typography>
                        <Box sx={{ width: '100%', marginBottom: '5px' }}>
                            <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', flex: 1 }}>
                                        <Button
                                            onClick={props.handleClose}
                                            color="error"
                                            variant="outlined"
                                            sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightred' } }}
                                        >
                                            キャンセル
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Tabs
                                            value={createNewAgreementValue}
                                            textColor="inherit"
                                            variant="scrollable"
                                            aria-label="Vertical tabs example"
                                            sx={{
                                                '& .MuiTab-root': {
                                                    backgroundColor: (theme) => {
                                                        switch (createNewAgreementValue) {
                                                            case 0: return '#e3f2fd'; // 担当者タブ
                                                            case 1: return '#e8f5e9'; // 代表者タブ
                                                            case 2: return '#fffde7'; // 承認フロータブ
                                                            // case 3: return '#fce4ec'; // 通知先タブ
                                                            default: return 'white';
                                                        }
                                                    },
                                                    color: 'black',
                                                    cursor: 'default',
                                                },
                                                '& .Mui-selected': {
                                                    backgroundColor: (theme) => {
                                                        switch (createNewAgreementValue) {
                                                            case 0: return '#1976d2'; // 担当者タブ
                                                            case 1: return '#388e3c'; // 代表者タブ
                                                            case 2: return '#fbc02d'; // 承認フロータブ
                                                            // case 3: return '#d81b60'; // 通知先タブ
                                                            default: return 'darkblue';
                                                        }
                                                    },
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    cursor: 'default',
                                                },
                                            }}
                                        >
                                            <Tab
                                                label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>企業情報</Typography>}
                                                {...a11yProps(0)}
                                                disabled={createNewAgreementValue === 0 ? false : !isCompanyFormValid}
                                                disableRipple
                                                sx={{
                                                    minWidth: 120,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            />
                                            <Tab
                                                label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>自社ユーザー情報</Typography>}
                                                {...a11yProps(1)}
                                                disabled={createNewAgreementValue === 1 ? false : !isInternalFormValid}
                                                disableRipple
                                                sx={{
                                                    minWidth: 120,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            />
                                            <Tab
                                                label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>相手方ユーザー情報</Typography>}
                                                {...a11yProps(2)}
                                                disabled={createNewAgreementValue === 2 ? false : !isCustomerFormValid}
                                                disableRipple
                                                sx={{
                                                    minWidth: 120,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            />
                                        </Tabs>
                                    </Box>
                                </Box>
                            </AppBar>
                        </Box>
                        <Box sx={{ width: '100%', overflowY: 'auto', height: '720px' }}>
                            <TabPanel value={createNewAgreementValue} index={0} dir={createNewAgreementTheme.direction}>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginBottom: '5px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                自社企業情報
                                            </Typography>
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
                                                        // onBlur={handleBlurForInternalCompanyName}
                                                        // onChange={e => {
                                                        //     field.onChange(e);
                                                        //     handleBlurForInternalCompanyName();
                                                        // }}
                                                        error={!!touched[field.name] && !!errors[field.name]}
                                                        helperText={touched[field.name] ? errors[field.name] : ''}
                                                        onChange={e => {
                                                            field.onChange(e);
                                                            setTouched(prev => ({ ...prev, [field.name]: true }));
                                                            const value = e.target.value;
                                                            let error = '';
                                                            if (!value) {
                                                                error = "企業名は必須です。";
                                                            }
                                                            setErrors(prev => ({
                                                                ...prev,
                                                                [field.name]: error
                                                            }));
                                                            handleBlurForInternalCompanyName();
                                                        }}
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
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginBottom: '5px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                相手方企業情報
                                            </Typography>
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
                                                        // onBlur={handleBlurForCustomerCompanyName}
                                                        // onChange={e => {
                                                        //     field.onChange(e);
                                                        //     handleBlurForCustomerCompanyName();
                                                        // }}
                                                        error={!!touched[field.name] && !!errors[field.name]}
                                                        helperText={touched[field.name] ? errors[field.name] : ''}
                                                        onChange={e => {
                                                            field.onChange(e);
                                                            setTouched(prev => ({ ...prev, [field.name]: true }));
                                                            const value = e.target.value;
                                                            let error = '';
                                                            if (!value) {
                                                                error = "企業名は必須です。";
                                                            }
                                                            setErrors(prev => ({
                                                                ...prev,
                                                                [field.name]: error
                                                            }));
                                                            handleBlurForCustomerCompanyName();
                                                        }}
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
                                                name="customer_company.address_line"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        id="customer_company.address_line"
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
                            </TabPanel>
                            <TabPanel value={createNewAgreementValue} index={1} dir={createNewAgreementTheme.direction}>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '5px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                担当者
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selectedInternalPicValue}
                                                        onChange={handleSelectInternalPicChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                    >
                                                        {internalUserList?.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    {/* <Box sx={{ backgroundColor: isCheckworkFlowInternalPicUser ? 'white' : '#FFF8E1' }}> */}
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "氏名は必須です。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForInternalUserForm();
                                                                }}
                                                            // onChange={(e) => {
                                                            //     handleOnCHangeForInternalUserForm(e);
                                                            //     field.onChange(e);
                                                            // }}
                                                            />
                                                        )}
                                                    />
                                                    {/* </Box> */}
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    {/* <Box sx={{ backgroundColor: isCheckworkFlowInternalPicUser ? 'white' : '#FFF8E1' }}> */}
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "メールアドレスは必須です。";
                                                                    } else if (!validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForInternalUserForm();
                                                                }}
                                                            // InputLabelProps={{ shrink: true }}
                                                            // onChange={(e) => {
                                                            //     handleOnCHangeForInternalUserForm(e);
                                                            //     field.onChange(e);
                                                            // }}
                                                            />
                                                        )}
                                                    />
                                                    {/* </Box> */}
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'start', marginLeft: '31%' }}>
                                            <FormControlLabel
                                                disabled={!isInternalPicInpuTFormValid}
                                                control={
                                                    <Checkbox
                                                        checked={isChecked_internalPic}
                                                        onChange={handleCheckboxChange_internalPic}
                                                    />}
                                                label={
                                                    <Typography sx={{ fontWeight: 'bold' }}>
                                                        本契約の代表者として指定する
                                                    </Typography>
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                代表者
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selectedInternalAuthorizerValue ?? ''}
                                                        onChange={handleSelectedInternalAuthorizerChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                        disabled={!isChecked_internalPic}
                                                    >
                                                        {internalUserList?.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    {/* <Box sx={{ backgroundColor: isCheckworkFlowInternalPicUser ? 'white' : '#FFF8E1' }}> */}
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "氏名は必須です。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForInternalUserForm();
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {/* </Box> */}
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    {/* <Box sx={{ backgroundColor: isCheckworkFlowInternalPicUser ? 'white' : '#FFF8E1' }}> */}
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "メールアドレスは必須です。";
                                                                    } else if (!validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForInternalUserForm();
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {/* </Box> */}
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                代表印
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ width: '50%', minWidth: '200px', marginRight: '20px' }}>
                                                {internalRepresentativeSealList?.length > 0 ? (
                                                    <>
                                                        <Box sx={{ display: 'flex', width: '100%', marginLeft: '5%' }}>
                                                            <FormControl component="fieldset" sx={{ width: '100%' }}>
                                                                <RadioGroup
                                                                    value={selectType_internal}
                                                                    onChange={handleSelectChange_selectType_internal}
                                                                    sx={{ width: '100%' }}
                                                                >
                                                                    {representativeSealSelectType?.map((pref) => (
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
                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                            <InputLabel id='pulldown'></InputLabel>
                                                            <Select
                                                                id='pulldown'
                                                                value={selectedAuthorizerValue ?? ''}
                                                                onChange={handleSelectedRepresentativeSealChange}
                                                                sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                                disabled={isAuthorizerPulldownDisabled}
                                                            >
                                                                {/* {internalRepresentativeSealList?.map((user: any) => (
                                                                    <MenuItem key={user.user_name} value={user.user_name}>
                                                                        {user.user_name}
                                                                    </MenuItem>
                                                                ))} */}
                                                                {Array.from(internalRepresentativeSealMap.keys()).map((key) => (
                                                                    <MenuItem key={key} value={key}>
                                                                        {key}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography>選択可能な代表印が登録されていません</Typography>
                                                    </>
                                                )}
                                                {/* <Button variant="contained" color="info" sx={{ marginTop: '40px', width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handlePreviewStep} >代表印を作成する</Button> */}
                                            </Box>
                                            <Box sx={{ width: '50%', padding: '10px', borderRadius: '4px', justifyContent: 'end', border: '1px solid lightgray' }}>
                                                {/* <Typography>プレビュー</Typography> */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '300px' }}>
                                                    {getValues('internal_seal_temp') ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '300px' }}>
                                                            <img src={`data:image/png;base64,${getValues('internal_seal_temp')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                代表印が選択されていません<br />
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>承認フロー</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                <InputLabel id='pulldown'></InputLabel>
                                                <Select
                                                    id='pulldown'
                                                    value={selecteApproverValue ?? ''}
                                                    onChange={handleSelectApproverChange}
                                                    sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                >
                                                    {internalUserList?.map((user: any) => (
                                                        <MenuItem key={user.user_name} value={user.user_name}>
                                                            {user.user_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ width: '70%' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                                {/* バリデーション（入力規則チェック）を実装する */}
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                                {/* <TextField
                                                    value={getValues('approval_flow.internal_approver_temp.user_name') || ''}
                                                    label="氏名"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    onChange={e => setSelectedApproverUser({ ...selectedApproverUser, user_name: e.target.value })}
                                                />
                                                <TextField
                                                    value={selectedApproverUser?.position || ''}
                                                    label="役職"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    onChange={e => setSelectedApproverUser({ ...selectedApproverUser, position: e.target.value })}
                                                />
                                                <TextField
                                                    value={selectedApproverUser?.email || ''}
                                                    label="メールアドレス"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    onChange={e => setSelectedApproverUser({ ...selectedApproverUser, email: e.target.value })}
                                                /> */}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addInternalApprovers} >追加する</Button>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempInternalApprover} disabled={false}>クリア</Button>
                                </Box>
                                <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                    {workFlowApprovalList?.length == 0 ? (
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                承認フローは登録されていません
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ ...getTableHeaderStyle(), width: '15%' }}>承認順番</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {workFlowApprovalList?.map((row: any, index: any) => (
                                                            <TableRow
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {/* {workFlowApprovalList && (
                                                                <TableRow
                                                                    key="authorizer"
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0, bgcolor: 'lightyellow', height: '40px' } }}
                                                                >
                                                                    <TableCell component="th" scope="row" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{(selectedRow?.internal_approver?.length || 0) + 1}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }} >{selectedRow.internal_authorizer.user_name}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{selectedRow.internal_authorizer.position}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{selectedRow.internal_authorizer.email}</TableCell>
                                                                </TableRow>
                                                            )} */}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>通知先</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                <InputLabel id='pulldown'></InputLabel>
                                                <Select
                                                    id='pulldown'
                                                    value={selecteNotifierValue ?? ''}
                                                    onChange={handleSelectNotifierChange}
                                                    sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                >
                                                    {internalUserList?.map((user: any) => (
                                                        <MenuItem key={user.user_name} value={user.user_name}>
                                                            {user.user_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ width: '70%' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                                {/* バリデーション（入力規則チェック）を実装する */}
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addInternalNotifier} >追加する</Button>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempInternalNotifier} disabled={false}>クリア</Button>
                                </Box>
                                <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                    {workFlowNotifierList?.length == 0 ? (
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                通知先は登録されていません
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                        <TableRow>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {workFlowNotifierList?.map((row: any, index: any) => (
                                                            <TableRow
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {/* {workFlowApprovalList && (
                                                                                                <TableRow
                                                                                                    key="authorizer"
                                                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0, bgcolor: 'lightyellow', height: '40px' } }}
                                                                                                >
                                                                                                    <TableCell component="th" scope="row" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{(selectedRow?.internal_approver?.length || 0) + 1}</TableCell>
                                                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }} >{selectedRow.internal_authorizer.user_name}</TableCell>
                                                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{selectedRow.internal_authorizer.position}</TableCell>
                                                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{selectedRow.internal_authorizer.email}</TableCell>
                                                                                                </TableRow>
                                                                                            )} */}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>
                            <TabPanel value={createNewAgreementValue} index={2} dir={createNewAgreementTheme.direction}>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '5px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                担当者
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selectedCustomerPicValue}
                                                        onChange={handleSelectCustomerPicChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                    >
                                                        {customerUserList?.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "氏名は必須です。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForCustomerUserForm();
                                                                }}
                                                            />
                                                        )}
                                                    />
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "メールアドレスは必須です。";
                                                                    } else if (!validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForCustomerUserForm();
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'start', marginLeft: '31%' }}>
                                            <FormControlLabel
                                                disabled={false}
                                                control={
                                                    <Checkbox
                                                        checked={false}
                                                    // onChange={handleCheckboxChange_internalPic}
                                                    />}
                                                label={
                                                    <Typography sx={{ fontWeight: 'bold' }}>
                                                        本契約の代表者として指定する
                                                    </Typography>
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                代表者
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selectedCustomerAuthorizerValue ?? ''}
                                                        onChange={handleSelectedCustomerAuthorizerChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                    >
                                                        {customerUserList?.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "氏名は必須です。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForCustomerUserForm();
                                                                }}
                                                            />
                                                        )}
                                                    />
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
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
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (!value) {
                                                                        error = "メールアドレスは必須です。";
                                                                    } else if (!validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                    handleOnChangeForCustomerUserForm();
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <Typography sx={{ padding: '8px', borderRadius: '4px', textAlign: 'start', fontSize: '1.2rem', width: '100%', fontWeight: 'bold' }}>
                                                代表印
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ width: '50%', minWidth: '200px', marginRight: '20px' }}>
                                                {customerRepresentativeSealList?.length > 0 ? (
                                                    <>
                                                        <Box sx={{ display: 'flex', width: '100%', marginLeft: '5%' }}>
                                                            <FormControl component="fieldset" sx={{ width: '100%' }}>
                                                                <RadioGroup
                                                                    value={selectType_customer}
                                                                    onChange={handleSelectChange_selectType_customer}
                                                                    sx={{ width: '100%' }}
                                                                >
                                                                    {representativeSealSelectType?.map((pref) => (
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
                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                            <InputLabel id='pulldown'></InputLabel>
                                                            <Select
                                                                id='pulldown'
                                                                value={selectedAuthorizerValue ?? ''}
                                                                onChange={handleSelectedRepresentativeSealChange}
                                                                sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                                disabled={isAuthorizerPulldownDisabled}
                                                            >
                                                                {customerRepresentativeSealList?.map((user: any) => (
                                                                    <MenuItem key={user.user_name} value={user.user_name}>
                                                                        {user.user_name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography>選択可能な代表印が登録されていません</Typography>
                                                    </>
                                                )}
                                                {/* <Button variant="contained" color="info" sx={{ marginTop: '40px', width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handlePreviewStep} >代表印を作成する</Button> */}
                                            </Box>
                                            <Box sx={{ width: '50%', padding: '10px', borderRadius: '4px', justifyContent: 'end', border: '1px solid lightgray' }}>
                                                {/* <Typography>プレビュー</Typography> */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '300px' }}>
                                                    {getValues('customer_seal_temp') ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '300px' }}>
                                                            <img src={`data:image/png;base64,${getValues('customer_seal_temp')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                代表印が選択されていません<br />
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>承認フロー</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                <InputLabel id='pulldown'></InputLabel>
                                                <Select
                                                    id='pulldown'
                                                    value={selecteApproverValue ?? ''}
                                                    onChange={handleSelectApproverChange}
                                                    sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                >
                                                    {customerUserList?.map((user: any) => (
                                                        <MenuItem key={user.user_name} value={user.user_name}>
                                                            {user.user_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ width: '70%' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                                {/* バリデーション（入力規則チェック）を実装する */}
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                                {/* <TextField
                                                    value={getValues('approval_flow.internal_approver_temp.user_name') || ''}
                                                    label="氏名"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    onChange={e => setSelectedApproverUser({ ...selectedApproverUser, user_name: e.target.value })}
                                                />
                                                <TextField
                                                    value={selectedApproverUser?.position || ''}
                                                    label="役職"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    onChange={e => setSelectedApproverUser({ ...selectedApproverUser, position: e.target.value })}
                                                />
                                                <TextField
                                                    value={selectedApproverUser?.email || ''}
                                                    label="メールアドレス"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    onChange={e => setSelectedApproverUser({ ...selectedApproverUser, email: e.target.value })}
                                                /> */}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addCustomerApprovers} >追加する</Button>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempCustomerApprover} disabled={false}>クリア</Button>
                                </Box>
                                <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                    {workFlowApprovalList?.length == 0 ? (
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                承認フローは登録されていません
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ ...getTableHeaderStyle(), width: '15%' }}>承認順番</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {workFlowApprovalList?.map((row: any, index: any) => (
                                                            <TableRow
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {/* {workFlowApprovalList && (
                                                                <TableRow
                                                                    key="authorizer"
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0, bgcolor: 'lightyellow', height: '40px' } }}
                                                                >
                                                                    <TableCell component="th" scope="row" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{(selectedRow?.internal_approver?.length || 0) + 1}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }} >{selectedRow.internal_authorizer.user_name}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{selectedRow.internal_authorizer.position}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>{selectedRow.internal_authorizer.email}</TableCell>
                                                                </TableRow>
                                                            )} */}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>通知先</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                <InputLabel id='pulldown'></InputLabel>
                                                <Select
                                                    id='pulldown'
                                                    value={selecteNotifierValue ?? ''}
                                                    onChange={handleSelectNotifierChange}
                                                    sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                >
                                                    {customerUserList?.map((user: any) => (
                                                        <MenuItem key={user.user_name} value={user.user_name}>
                                                            {user.user_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ width: '70%' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                                {/* バリデーション（入力規則チェック）を実装する */}
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addCustomerNotifiers} >追加する</Button>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempCustomerNotifier} disabled={false}>クリア</Button>
                                </Box>
                                <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                    {workFlowNotifierList?.length == 0 ? (
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                通知先は登録されていません
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                        <TableRow>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {workFlowNotifierList?.map((row: any, index: any) => (
                                                            <TableRow
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>
                        </Box>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '30px' }}>
                            契約書ファイルをアップロードしてください。
                        </Typography>
                        <Box bgcolor='white' sx={{ border: '1px solid lightgray', paddingTop: '20px', paddingBottom: '20px', paddingLeft: '2%', paddingRight: '2%', marginRight: '5px' }}>
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
                            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                                {/* {getValues('title') ? */}
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
                                </Box>
                                {/* : '※ファイルをアップロードしてください。'} */}
                            </Box>
                        </Box>
                    </Box>
                );
            case 3: // 既存情報からコピーを作成した場合の確認画面
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '30px' }}>
                            以下の内容で登録します。よろしいですか？
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
                );
            case 4: // 既存情報を修正した場合の確認画面
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '30px' }}>
                            以下の内容で登録します。よろしいですか？
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
                );
            case 5: // システムへ登録した後のプレビュー画面　内容を確認し、問題がなければ承認フローを開始する事が出来る
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '30px' }}>
                            以下の内容で登録します。よろしいですか？
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
                );
            default:
                return null;
        }
    };
    return (
        <>
            <Box sx={{ ...createNewAgreementRequestDialogStyle }}>
                <Box sx={{ height: '75%', marginBottom: '20px' }}>
                    <Box sx={{ mb: 4 }}>
                        {renderStepContent(activeStep)}
                    </Box>
                </Box>
                {activeStep == 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                        {/* <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleUseInfo} >この情報から作成する</Button>
                                                <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleModifyInfo} >情報を修正する</Button>
                                                <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={closeCreateNewAgreementDialog}>閉じる</Button> */}
                        <Button variant="contained" color="error" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handlePreviewStep} disabled={!fileUploaded}>登録内容を確認する</Button>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={props.handleClose}>キャンセル</Button>
                    </Box>
                )}
                {activeStep == 9 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                        {/* <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleUseInfo} >この情報から作成する</Button>
                                                <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleModifyInfo} >情報を修正する</Button>
                                                <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={closeCreateNewAgreementDialog}>閉じる</Button> */}
                        <Button variant="contained" color="error" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleSubmit(onRegisterAgreement)} >登録する</Button>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleModifyStep}>修正する</Button>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={props.handleClose}>キャンセル</Button>
                    </Box>
                )}
                {activeStep == 10 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                        {/* <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleUseInfo} >この情報から作成する</Button>
                                                <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleModifyInfo} >情報を修正する</Button>
                                                <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={closeCreateNewAgreementDialog}>閉じる</Button> */}
                        {/* <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handlePreviewStep} >修正内容を確認する</Button> */}
                        {/* <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={props.handleClose}>キャンセル</Button> */}
                        {createNewAgreementValue === 0 && (
                            <>
                                <Button
                                    onClick={() => handleTabChange(1)}
                                    color="primary"
                                    variant="contained"
                                    sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                    disabled={!(isSetInternalCompanyName && isSetCustomerCompanyName)}
                                >
                                    次へ
                                </Button>
                            </>
                        )}
                        {createNewAgreementValue === 1 && (
                            <>
                                <Button
                                    onClick={() => handleTabChange(0)}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}
                                >
                                    前へ戻る
                                </Button>
                                <Button
                                    onClick={() => handleTabChange(2)}
                                    color="primary"
                                    variant="contained"
                                    sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                    disabled={!isInternalUserForm}
                                >
                                    次へ
                                </Button>
                            </>
                        )}
                        {createNewAgreementValue === 2 && (
                            <>
                                <Button
                                    onClick={() => handleTabChange(1)}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}
                                >
                                    前へ戻る
                                </Button>
                                <Button
                                    onClick={handlePreviewStep}
                                    color="primary"
                                    variant="contained"
                                    sx={{
                                        marginRight: '10px',
                                        width: '12em',
                                        backgroundColor: '#d81b60',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#ad174a' }
                                    }}
                                    disabled={!isCustomerUserForm}
                                >
                                    修正内容を確認する
                                </Button>
                            </>
                        )}
                    </Box>
                )}
                {/* {activeStep === USEINFO_STEP && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handlePreviewNewAgreementStep} >登録内容の確認</Button>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleTopStep}>戻る</Button>
                    </Box>
                )}
                {activeStep === MODIFYINFO_STEP && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handlePreviewModifyAgreementStep} >修正内容の確認</Button>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleTopStep}>戻る</Button>
                    </Box>
                )}
                {activeStep === PREVIEW_NEWAGREEMENT_STEP && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                        <Button variant="contained" color="error" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleModifyInfo} >登録する</Button>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleTopStep}>戻る</Button>
                    </Box>
                )}
                {activeStep === PREVIEW_MODIFYAGREEMENT_STEP && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                        <Button variant="contained" color="error" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleModifyInfo} >登録する</Button>
                        <Button variant="contained" color="primary" sx={{ width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleTopStep}>戻る</Button>
                    </Box>
                )} */}
            </Box>
            {/* ファイルプレビューダイアログ */}
            <div>
                <Modal
                    open={createNewAgreementPdfPreviewDialogOpen}
                    onClose={handleCreateNewAgreementPdfPreviewDialogClose}
                >
                    <Box sx={pdfPreviewDialogStyle}>
                        <Box
                            sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                            onClick={() => window.open('data:application/pdf;base64,' + createNewAgreementPdfBase64, '_blank')}
                        >
                            {pdfIsLoading ? <CircularProgress sx={{ width: '40px', height: '40px' }} /> :
                                <embed type='application/pdf' src={'data:application/pdf;base64,' + createNewAgreementPdfBase64 + "#zoom=100"} height='100%' width='100%' />
                            }
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                            <Button variant="contained" color="primary" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' }, height: '35px' }} onClick={handleCreateNewAgreementPdfPreviewDialogClose}>プレビュー終了</Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
            {/* メール送信：送信先確認ダイアログ */}
            < div >
                <Modal open={internalRepresentativeSealDialogOpen}>
                    <Box sx={{ ...resendSighUrlDialogStyleConcluded_one, backgroundColor: 'grey.200', position: 'relative', height: '50vh', width: '30vw' }}>
                        {/* <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            自社代表印
                        </Typography> */}
                        <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray', overflow: 'auto', height: '90%', width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '20px', marginBottom: '20px', width: '100%' }}>
                                <img
                                    src={`data:image/png;base64,${internalRepresentativeSeal}`}
                                    alt="user"
                                    style={{
                                        maxWidth: '80%',      // 画像の最大幅を80%に拡大
                                        maxHeight: '70vh',    // 画像の最大高さを60vhに拡大
                                        height: 'auto',
                                        width: 'auto',
                                        objectFit: 'contain', // アスペクト比維持
                                        borderRadius: '10px'
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box sx={{
                            position: 'fixed',
                            left: 0,
                            bottom: 0,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            zIndex: 1300,
                            marginBottom: '10px'
                        }}>
                            <Button variant="contained" color='success' onClick={handleInternalRepresentativeSealDialogClose} sx={{ width: '10em', margin: '5px', '&:hover': { backgroundColor: 'darkgreen' } }}>閉じる</Button>
                        </Box>
                    </Box>
                </Modal>
            </div >
            {/* メール送信：送信先確認ダイアログ */}
            < div >
                <Modal open={customerRepresentativeSealDialogOpen}>
                    <Box sx={{ ...resendSighUrlDialogStyleConcluded_one, backgroundColor: 'grey.200', position: 'relative', height: '50vh', width: '30vw' }}>
                        {/* <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            相手方代表印
                        </Typography> */}
                        <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray', overflow: 'auto', height: '90%', width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '20px', marginBottom: '20px', width: '100%' }}>
                                <img
                                    src={`data:image/png;base64,${customerRepresentativeSeal}`}
                                    alt="user"
                                    style={{
                                        maxWidth: '80%',      // 画像の最大幅を80%に拡大
                                        maxHeight: '70vh',    // 画像の最大高さを60vhに拡大
                                        height: 'auto',
                                        width: 'auto',
                                        objectFit: 'contain', // アスペクト比維持
                                        borderRadius: '10px'
                                    }}
                                />
                            </Box>
                        </Box>
                        {/* <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray', overflow: 'auto', maxHeight: '70vh' }}>
                            <Box sx={{ backgroundColor: 'white', paddingTop: '20px', marginBottom: '20px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                    <img src={`data:image/png;base64,${customerRepresentativeSeal}`} alt="user" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                </Box>
                            </Box>
                        </Box> */}
                        <Box sx={{
                            position: 'fixed',
                            left: 0,
                            bottom: 0,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            zIndex: 1300,
                            marginBottom: '10px'
                        }}>
                            <Button variant="contained" color='success' onClick={handleCustomerRepresentativeSealDialogClose} sx={{ width: '10em', margin: '5px', '&:hover': { backgroundColor: 'darkgreen' } }}>閉じる</Button>
                        </Box>
                    </Box>
                </Modal>
            </div >
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
};

export default RegisterNewAgreementUseExistDataDialog;