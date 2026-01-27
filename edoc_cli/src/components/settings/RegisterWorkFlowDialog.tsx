import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import validator from 'validator';
import { readOnlyTextFieldStyle } from '../../styles/fontStyles';
import api from "../../utils/apiAccessor";
import apiExecutor from "../../utils/apiExecutor";
import validationRules from "../../utils/validationRules";
import { representativeSealSelectType } from '../elements/CustomPulldownMenu';
import ApiProcessingDialog, { ApiGetAdditionalDataDialog } from "../pages/common/ApiProcessingDialog";
import ErrorDialog from "../pages/common/ErrorDialog";
import { AutoCloseSuccessDialog } from "../pages/common/SuccessDialog";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';

const getTableHeaderStyle = () => ({
    fontWeight: 'bold',
    fontSize: '16px',
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

/***
 *
 * プレビュー
 *
 */
interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

// ユーザーロール選択タブ制御（自社）
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
};

interface User {
    email: string,
    position: string,
    user_name: string,
};

// 承認者の初期値
const initialUser: User = {
    user_name: '',
    position: '',
    email: '',
};

const initialUsers: User[] = [];

// フォームの入力値
interface FormInput {
    company_id: string,
    workflow_name: string,
    workflow_type: string,
    representative_seal: string, // APIリクエスト送信データ
    representative_seal_temp: string, // 画面表示用一時退避データ（プレビュー表示用）
    internalRepresentativeSeal_temp: string, // 画面表示用一時退避データ（代表印情報利用用）
    selectedUserSeal?: string, // 選択したユーザーの代表印 - 代表者画面
    selectedRepresentativeSeal?: string, // 選択した代表印 - 代表者画面
    approval_flow: {
        internal_pic: User,
        internal_approver: User[],
        internal_approver_temp: User,
        internal_authorizer: User,
        internal_notifier: User[],
        internal_notifier_temp: User,
    }
};

// 契約書新規作成のステップ（定数）
const CREATE_STEP = 0;
const MODIFY_STEP = 1;
const PREVIEW_STEP = 2;

/***
 *
 * 自社承認フロー登録画面
 *
 */
const RegisterWorkFlowDialog = (props: any) => {

    const { control, setValue, getValues, handleSubmit } = useForm<FormInput>(
        {
            defaultValues: {
                company_id: props.companyInfo.company_id,
                workflow_name: '',
                workflow_type: 'INTERNAL',
                representative_seal: '',
                representative_seal_temp: '',
                internalRepresentativeSeal_temp: '',
                selectedUserSeal: '',
                selectedRepresentativeSeal: '',
                approval_flow: {
                    internal_pic: initialUser,
                    internal_approver: initialUsers,
                    internal_approver_temp: initialUser, // 登録リクエストを送信する際に削除する
                    internal_authorizer: initialUser,
                    internal_notifier: initialUsers,
                    internal_notifier_temp: initialUser, // 登録リクエストを送信する際に削除する
                }
            }
        }
    );

    const [isFormValid, setIsFormValid] = useState(false);

    // const [errors, setErrors] = useState({
    //     user_name: ` `,
    //     position: ` `,
    //     email: ` `,
    // });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    const fieldNamesInJapanese: { [key: string]: string } = {
        user_name: 'ユーザー名',
    };

    /***
     *
     * テキストフィールド変更処理
     *
     */
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        // if (name === 'company_name') {
        //     setCompanyDisplayName(value);
        // }

        // if (name === 'user_name') {
        //     setValue(name, value);

        //     const error = validateTextField(name, value);
        //     setErrors({ ...errors, [name]: error });
        // }
    };

    // バリデーションチェック
    const validateTextField = (name: string, value: string) => {
        const fieldName = fieldNamesInJapanese[name] || name;

        if (!value) {
            return `${fieldName}は必須です。${validationRules.TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`;
        }
        return '';
    };

    /***
     *
     * API実行中ダイアログ
     *
     */
    const [executeApiWaitingDialog, setExecuteApiWaitingDialogOpen] = useState(false);
    const handleExecuteApiWaitingDialogClose = () => setExecuteApiWaitingDialogOpen(false);

    /***
     *
     * API実行中ダイアログ
     *
     */
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

    /***
     *
     * API実行成功ダイアログ
     *
     */
    const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
    const handleExecuteSuccessApiDialogClose = () => setExecuteSuccessApiDialogOpen(false);

    /***
     *
     * API実行失敗ダイアログ
     *
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    /***
     *
     * 登録処理
     *
     */
    const onSubmit = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const values = getValues();
            const {
                representative_seal_temp,
                internalRepresentativeSeal_temp,
                selectedUserSeal,
                selectedRepresentativeSeal,
                approval_flow,
                ...rest
            } = values;

            const {
                internal_notifier_temp,
                internal_approver_temp,
                internal_pic,
                internal_authorizer,
                internal_approver,
                internal_notifier,
                ...approvalFlowRest
            } = approval_flow || {};

            // fileプロパティを除外
            const omitFile = (user: any) => {
                if (!user) return undefined;
                const { file, ...restUser } = user;
                return restUser;
            };
            const omitFileFromArray = (arr: any[]) => Array.isArray(arr) ? arr.map(omitFile) : [];

            // emailが空の場合はemailプロパティごと除外
            const omitEmptyEmail = (user: any) => {
                if (!user) return undefined;
                const { email, ...restUser } = user;
                return email ? { ...restUser, email } : restUser;
            };

            const filterEmpty = (obj: any) => {
                if (!obj) return undefined;
                // すべての値が空または未定義ならundefined
                const hasValue = Object.values(obj).some(v => v !== undefined && v !== '');
                return hasValue ? obj : undefined;
            };

            const approvalFlowSanitized = {
                ...approvalFlowRest,
                internal_pic: filterEmpty(omitEmptyEmail(omitFile(internal_pic))),
                internal_authorizer: filterEmpty(omitEmptyEmail(omitFile(internal_authorizer))),
                internal_approver: filterEmpty(omitFileFromArray(internal_approver).filter(filterEmpty)),
                internal_notifier: filterEmpty(omitFileFromArray(internal_notifier).filter(filterEmpty)),
            };

            const requestData = {
                ...rest,
                approval_flow: approvalFlowSanitized,
            };

            const res = await api.postApprovalFlow(requestData);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('承認フロー登録処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            };

            // APIレスポンスのJSONを取得（★API側でレスポンスを実装する → 未実装）
            const agreementData = await res.json();
            setExecuteSuccessApiDialogOpen(true);

            const registerdWorkflowId = agreementData.workflow_id;
            // 親に通知
            if (props.onRegisterSuccessWithId && registerdWorkflowId) {
                await props.onRegisterSuccessWithId(registerdWorkflowId);
            };
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('承認フロー登録処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    /***
     *
     * 承認フロー登録画面を閉じる（キャンセル）
     *
     */
    const onClose = async () => {
        props.setDialogOpen(false);
    };

    /***
     *
     * 承認フロー登録画面を閉じる（登録成功時）
     *
     */
    const closeRegisterUserDialog = async () => {
        if (props.onRegisterSuccess) {
            await props.onRegisterSuccess(); // 最新データ取得
        };

        props.setDialogOpen(false);
    };

    /***
     *
     * 新規ワークロード登録画面の画面遷移
     *
     */
    const [activeStep, setActiveStep] = useState(
        props.workflowInfo && props.workflowInfo.length > 0 ? CREATE_STEP : MODIFY_STEP
    );

    // 承認フローの入力を開始する
    const handleModifyStep = async () => {

        if (isUseRegisteredFlow === 'use' && selectedWorkflow) {
            await getApprovalFlowDetails();
        };

        setActiveStep(MODIFY_STEP);
        setCreateNewAgreementValue(0);
    };

    // 登録済み承認フローを利用する場合に、詳細情報を取得する
    const getApprovalFlowDetails = async () => {

        setExecuteApiWaitingDialogOpen(true);

        try {
            // 選択された承認フローを入力フォームへ設定する
            const requests = [
                apiExecutor.fetchGetApprovalFlow(selectedWorkflow.company_id, selectedWorkflow.workflow_id, selectedWorkflow.workflow_type),
                apiExecutor.fetchGetRepresentativeSealImage(selectedWorkflow.company_id, selectedWorkflow.workflow_id)
            ];

            // APIを並列実行
            const responses = await Promise.all(requests);

            const approvalFlowResponse = responses[0];
            const representativeSealResponse = responses[1];

            // 代表印APIが404の場合は代表印未登録として正常扱い
            if (approvalFlowResponse.status !== 200) {
                setErrorCode(approvalFlowResponse.status);
                setErrorProcess('ユーザー情報取得処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            };

            // 代表印APIが404以外のエラーならエラーダイアログ
            if (representativeSealResponse.status !== 200 && representativeSealResponse.status !== 404) {
                setErrorCode(representativeSealResponse.status);
                setErrorProcess('ユーザー情報取得処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            };

            // APIを並列実行
            const [workflow, representativeSealImage] = await Promise.all(responses.map((res: Response) => res.json()));

            setValue('representative_seal_temp', representativeSealImage.file || '');
            setValue('approval_flow.internal_pic', workflow.internal_pic);
            setValue('approval_flow.internal_authorizer', workflow.internal_authorizer);
            setWorkFlowApprovalList(workflow.internal_approver);
            setWorkFlowNotifierList(workflow.internal_notifier);
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('ユーザー情報取得処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiWaitingDialogOpen(false);
        };
    };

    // 入力内容を確認する
    const handlePreviewStep = () => {
        // 一時退避している値をフォームにセットする
        setValue('representative_seal', getValues('representative_seal_temp'));
        setValue('approval_flow.internal_approver', workFlowApprovalList);
        setValue('approval_flow.internal_notifier', workFlowNotifierList);

        setActiveStep(PREVIEW_STEP);
    };

    /***
     * -------------------------
     * 承認フロー登録名入力ページ
     * -------------------------
     */
    // 「入力を開始する」ボタンが押せる条件かの判定
    const [isCheckworkFlowName, setIsCheckWorkFlowName] = useState<boolean>(false);

    // 登録名（テキストフィールド）
    const handleWorkFlowNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setIsCheckWorkFlowName(value.length > 0);
    };

    // 既存の承認フローを利用する
    const [isUseRegisteredFlow, setIsUseRegisteredFlow] = useState<'notUse' | 'use'>('notUse');

    // 承認フローを利用する／利用しない
    const handleIsUseRegisteredFlowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsUseRegisteredFlow(event.target.value as 'notUse' | 'use');
    };

    const [selectedWorkflow, setSelectedWorkflow] = useState<any>();
    // 選択した承認フローに登録されているユーザー情報をフォームに設定する
    const handleSelectedWorkFlowChange = (event: SelectChangeEvent<string>) => {

        const user = props.workflowInfo.find((u: any) => u.workflow_name === event.target.value);
        if (user) {
            setSelectedWorkflow(user);
        };
    };

    /***
     *-------------------------
     * 自社担当者入力ページ
     *-------------------------
     */
    const [selectedPicValue, setSelectedPicValue] = useState<string>('');
    const [selectedPicUsersSealValue, setSelectedPicUsersSealValue] = useState<string>('');
    const [designateAsRepresentative, setDesignateAsRepresentative] = useState<boolean>(false);

    // 担当者選択（プルダウンメニュー）
    const handleSelectPicChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setSelectedPicValue(value);

        // 選択したユーザー情報をフォームに設定する
        const user = props.userInfo.find((u: any) => u.user_name === value);
        const { user_name, position, email } = user;

        if (user) {
            setValue('approval_flow.internal_pic', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_pic.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };

        if (user.file) {
            // 担当者の代表印を保持する
            setSelectedPicUsersSealValue(user.file);
        };
    };

    // 自社担当者を自社代表者と同一にする
    const handleDesignateAsRepresentative = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setDesignateAsRepresentative(isChecked);

        if (isChecked) {
            // フォームの値を代表者に設定する
            setValue('approval_flow.internal_authorizer', getValues('approval_flow.internal_pic'));
            setValue('selectedUserSeal', selectedPicUsersSealValue); // 選択した代表者の代表印として設定
            setValue('representative_seal_temp', selectedPicUsersSealValue); // 画面表示用の代表印として設定
        } else {
            // 代表者のフォームをリセットする
            setValue('approval_flow.internal_authorizer', initialUser);
            setValue('selectedUserSeal', '');
            setValue('representative_seal_temp', '');
            setValue('internalRepresentativeSeal_temp', '');
            setselectedInternalRepresentativeSealType(representativeSealSelectType[0].value)
        };
    };

    /***
     *-------------------------
     * 自社代表者選択
     *-------------------------
     */
    // 代表者（入力フィールド）
    const [selecteAuthorizerValue, setSelectedAuthorizerValue] = useState<string>('');

    // 代表印
    const [selectedInternalRepresentativeSealType, setselectedInternalRepresentativeSealType] = useState(representativeSealSelectType[0].value);
    const [isAuthorizerPulldownDisabled, setIsAuthorizerPulldownDisabled] = useState(true);

    // 代表者選択（プルダウンメニュー）
    const handleSelectAuthorizerChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedAuthorizerValue(userName);

        // 選択したユーザー情報をフォームに設定する
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        const { user_name, position, email } = user;

        if (user) {
            setValue('approval_flow.internal_authorizer', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_authorizer.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };

        // ユーザー情報を利用する場合は、代表印を設定する
        if (selectedInternalRepresentativeSealType === 'useUserSeal') {
            setValue('representative_seal_temp', user.file || ''); // 画面表示用の代表印として設定
            setValue('selectedUserSeal', user.file); // 選択した代表者の代表印として設定
        };
    };

    // 代表者印選択方法変更（ラジオボタン）
    const handleSelectInternalRepresentativeSealTypeChange = (event: SelectChangeEvent<string>) => {

        const selectedValue = event.target.value;
        setselectedInternalRepresentativeSealType(selectedValue); // ラジオボタンに選択された値をセット

        // 'useRepresentativeSeal'の場合のみプルダウンを有効にする
        setIsAuthorizerPulldownDisabled(selectedValue !== 'useRepresentativeSeal');

        if (selectedValue === 'useUserSeal') {
            const authorizerUserFile = getValues('selectedUserSeal');
            if (authorizerUserFile) {
                setValue('representative_seal_temp', authorizerUserFile || '');
            } else {
                setValue('representative_seal_temp', ''); // ユーザー情報にファイルがない場合は空にする
            };
        };

        if (selectedValue === 'useRepresentativeSeal') {
            setValue('representative_seal_temp', getValues('internalRepresentativeSeal_temp') || '');
        };
    };

    // 登録済み代表印から選択する（プルダウン）
    const handleSelectRepresentativeSealChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedAuthorizerValue(userName);

        // 選択したユーザー情報を取得してstateにセット
        const user = props.representativeInfo.find((u: any) => u.user_name === userName);
        if (user) {
            setValue('representative_seal_temp', user.file || '');
            // 選択した代表印を退避
            setValue('internalRepresentativeSeal_temp', user.file || null);
        };
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
        const { user_name, position, email } = user || {};

        if (user) {
            setValue('approval_flow.internal_approver_temp', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_approver_temp.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };
    };

    // 承認フロー設定
    const [workFlowApprovalList, setWorkFlowApprovalList] = useState<any[]>([]);

    // 承認者をリストに追加する
    const addInternalApprovers = () => {

        if (!getValues('approval_flow.internal_approver_temp.user_name') || !getValues('approval_flow.internal_approver_temp.email')) {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const temp = getValues('approval_flow.internal_approver_temp');
        const approver = {
            user_name: temp.user_name,
            position: temp.position,
            email: temp.email,
        };
        // setWorkFlowApprovalList((prev) => [...prev, approver]);
        setWorkFlowApprovalList((prev) => {
            if (prev.some(user => user.email === approver.email)) {
                alert(`このメールアドレス（${approver.email}）のユーザーは既に承認フローに追加されています。`);
                return prev;
            };
            return [...prev, approver];
        });

        setSelectedApproverValue('');
        setValue('approval_flow.internal_approver_temp', initialUser);
    };

    // 追加した承認者情報をクリアする
    const clearTempInternalApprover = () => {
        setWorkFlowApprovalList([]);
    };

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
        const { user_name, position, email } = user || {};

        if (user) {
            setValue('approval_flow.internal_notifier_temp', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_notifier_temp.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };
    };

    // 通知先設定
    const [workFlowNotifierList, setWorkFlowNotifierList] = useState<any[]>([]);

    // 通知先をリストに追加する
    const addInternalNotifier = () => {

        if (!getValues('approval_flow.internal_notifier_temp.user_name') || !getValues('approval_flow.internal_notifier_temp.email')) {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const temp = getValues('approval_flow.internal_notifier_temp');
        const notifier = {
            user_name: temp.user_name,
            position: temp.position,
            email: temp.email,
        };

        // setWorkFlowNotifierList((prev) => [...prev, notifier]);
        setWorkFlowNotifierList((prev) => {
            if (prev.some(user => user.email === notifier.email)) {
                alert(`このメールアドレス（${notifier.email}）のユーザーは既に通知先に追加されています。`);
                return prev;
            };
            return [...prev, notifier];
        });

        setSelectedNotifierValue('');
        setValue('approval_flow.internal_notifier_temp', initialUser);
    };

    // 追加した承認者情報をクリアする
    const clearTempInternalNotifier = () => {
        setWorkFlowNotifierList([]);
    };

    const getTabBgColor = () => {

        const isValid = true;
        if (isValid) {
            return 'darkgreen'; // 成功時
        } else {
            return 'lightred'; // デフォルト
        }
    };

    // 締結済み契約書から新規契約書を作成する
    const createNewAgreementTheme = useTheme();
    const [createNewAgreementValue, setCreateNewAgreementValue] = useState(0);

    const handleCreateNewAgreementValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setCreateNewAgreementValue(newValue);
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
        setCreateNewAgreementValue(tabIndex);
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', marginBottom: '20px', margin: '20px' }}>
                            承認フローの新規登録
                        </Typography>
                        <Box sx={{ height: '670px', overflowY: 'auto', marginLeft: '20px', marginRight: '20px' }}>
                            {props.workflowInfo && props.workflowInfo.length > 0 && (
                                <>
                                    <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', margin: 0, borderRadius: '4px', border: '1px solid lightgray', marginBottom: '20px' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>作成済みの承認フローが見つかりました。作成済みの承認フローを入力に利用しますか？</Typography>
                                        <RadioGroup
                                            aria-label="approval-policy"
                                            name="approvalPolicy"
                                            sx={{ flexDirection: 'column', marginLeft: 2 }}
                                            value={isUseRegisteredFlow}
                                            onChange={handleIsUseRegisteredFlowChange}
                                        >
                                            <FormControlLabel
                                                value="notUse"
                                                control={<Radio />}
                                                label="利用しない"
                                            />
                                            <FormControlLabel
                                                value="use"
                                                control={<Radio />}
                                                label="利用する"
                                            />
                                        </RadioGroup>
                                    </Box>
                                    {isUseRegisteredFlow === 'use' && (
                                        <Box sx={{ width: '100%', minWidth: '200px', padding: '20px', borderRadius: '4px', border: '1px solid lightgray', backgroundColor: 'white' }}>
                                            <Typography sx={{ fontWeight: 'bold' }}>登録済み承認フロー</Typography>
                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                <InputLabel id='pulldown'></InputLabel>
                                                <Select
                                                    name="selectedPic"
                                                    value={selectedWorkflow}
                                                    onChange={handleSelectedWorkFlowChange}
                                                    sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                >
                                                    {props?.workflowInfo.map((flow: any) => (
                                                        <MenuItem key={flow?.workflow_name} value={flow?.workflow_name}>
                                                            {flow?.workflow_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box >
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', marginBottom: '20px', margin: '20px' }}>
                            新規に登録する承認フロー情報を入力してください。
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: '20px', marginRight: '20px' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: isCheckworkFlowName ? 'black' : 'darkred' }}>登録名</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRadius: '4px', marginBottom: '20px', marginLeft: '20px', marginRight: '20px', border: isCheckworkFlowName ? '0.5px solid lightgray' : '0.5px solid darkred' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: isCheckworkFlowName ? 'white' : '#FFF8E1', borderRadius: '4px' }}>
                                <Controller
                                    name="workflow_name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="workflow_name"
                                            variant="standard"
                                            sx={{ width: '100%' }}
                                            placeholder="承認フローの登録名を入力してください"
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
                                            onChange={e => {
                                                field.onChange(e);
                                                const value = e.target.value;
                                                setIsCheckWorkFlowName(value.length > 0); // 文字列が入っているかチェック
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ marginRight: '20px', marginBottom: '5px' }}>
                            <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', flex: 1 }}>
                                        <Button
                                            onClick={onClose}
                                            color="error"
                                            variant="outlined"
                                            sx={{ width: '12em', marginRight: '10px', marginLeft: '20px', '&:hover': { backgroundColor: 'lightred' } }}
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
                                                            case 3: return '#fce4ec'; // 通知先タブ
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
                                                            case 3: return '#d81b60'; // 通知先タブ
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
                                                label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>担当者</Typography>}
                                                {...a11yProps(0)}
                                                disabled={createNewAgreementValue === 0 ? false : !isFormValid}
                                                disableRipple
                                                sx={{
                                                    minWidth: 120,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            />
                                            <Tab
                                                label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>代表者</Typography>}
                                                {...a11yProps(1)}
                                                disabled={createNewAgreementValue === 1 ? false : !isFormValid}
                                                disableRipple
                                                sx={{
                                                    minWidth: 120,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            />
                                            <Tab
                                                label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>承認フロー</Typography>}
                                                {...a11yProps(2)}
                                                disabled={createNewAgreementValue === 2 ? false : !isFormValid}
                                                disableRipple
                                                sx={{
                                                    minWidth: 120,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            />
                                            <Tab
                                                label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>通知先</Typography>}
                                                {...a11yProps(3)}
                                                disabled={createNewAgreementValue === 3 ? false : !isFormValid}
                                                disableRipple
                                                sx={{
                                                    minWidth: 120,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            />
                                        </Tabs>
                                        {/* <Tabs
                                        value={createNewAgreementValue}
                                        onChange={handleCreateNewAgreementValueChange}
                                        textColor="inherit"
                                        variant="scrollable"
                                        aria-label="Vertical tabs example"
                                        sx={{
                                            '& .MuiTab-root': {
                                                backgroundColor: getTabBgColor(),
                                                color: 'black',
                                            },
                                            '& .Mui-selected': {
                                                backgroundColor: getTabBgColor(),
                                                color: 'white',
                                            },
                                        }}
                                    >
                                        <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>担当者</Typography>}
                                            {...a11yProps(0)}
                                        />
                                        <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>代表者</Typography>}
                                            {...a11yProps(1)}
                                        />
                                        <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>承認フロー</Typography>}
                                            {...a11yProps(2)}
                                        />
                                        <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>通知先</Typography>}
                                            {...a11yProps(3)}
                                        />
                                    </Tabs> */}
                                    </Box>
                                </Box>
                            </AppBar>
                        </Box>
                        <Box sx={{ height: '580px', overflowY: 'auto', border: '1px solid lightgray', marginLeft: '20px', marginRight: '20px', backgroundColor: 'white' }}>
                            <TabPanel value={createNewAgreementValue} index={0} dir={createNewAgreementTheme.direction}>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    {/* <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>担当者</Typography>
                                    </Box> */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                <InputLabel id='pulldown'></InputLabel>
                                                <Select
                                                    name="selectedPic"
                                                    value={selectedPicValue ?? ''}
                                                    onChange={handleSelectPicChange}
                                                    sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                >
                                                    {props.userInfo.map((user: any) => (
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
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                            error={!!touched[field.name] && !!errors[field.name]}
                                                            helperText={touched[field.name] ? errors[field.name] : ''}
                                                            onBlur={e => {
                                                                setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                field.onBlur();
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (value && !validator.isEmail(value)) {
                                                                    error = "メールアドレスの形式が正しくありません。";
                                                                }
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    [field.name]: error
                                                                }));
                                                            }}
                                                            onChange={e => {
                                                                field.onChange(e);
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (touched[field.name]) {
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', borderRadius: '4px' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={designateAsRepresentative}
                                                    onChange={handleDesignateAsRepresentative}
                                                    color="primary"
                                                />
                                            }
                                            label="このユーザーを承認フローの代表者として設定する"
                                            sx={{ mt: 2, fontWeight: 'bold' }}
                                        />
                                    </Box>
                                </Box>
                            </TabPanel>
                            <TabPanel value={createNewAgreementValue} index={1} dir={createNewAgreementTheme.direction}>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    {/* <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>代表者</Typography>
                                    </Box> */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                            <FormControl variant="standard" sx={{ width: '100%' }}>
                                                <InputLabel id='pulldown'></InputLabel>
                                                <Select
                                                    id='pulldown'
                                                    value={selecteAuthorizerValue ?? ''}
                                                    onChange={handleSelectAuthorizerChange}
                                                    sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                    disabled={selectedInternalRepresentativeSealType === 'useRepresentativeSeal'}
                                                >
                                                    {props.userInfo.map((user: any) => (
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
                                                        // onBlur={handleBlurForPicInputForm}
                                                        />
                                                    )}
                                                />
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
                                                                }, inputProps: {
                                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                }
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                            error={!!touched[field.name] && !!errors[field.name]}
                                                            helperText={touched[field.name] ? errors[field.name] : ''}
                                                            onBlur={e => {
                                                                setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                field.onBlur();
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (value && !validator.isEmail(value)) {
                                                                    error = "メールアドレスの形式が正しくありません。";
                                                                }
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    [field.name]: error
                                                                }));
                                                            }}
                                                            onChange={e => {
                                                                field.onChange(e);
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (touched[field.name]) {
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', padding: '10px', borderRadius: '4px' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>代表印</Typography>
                                    </Box>
                                    {(props.userInfo?.length > 0 || props.representativeInfo?.length > 0) ? (
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ width: '50%', minWidth: '200px', marginRight: '20px' }}>
                                                <Box sx={{ display: 'flex', width: '100%', marginLeft: '5%' }}>
                                                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                                                        <RadioGroup
                                                            value={selectedInternalRepresentativeSealType}
                                                            onChange={handleSelectInternalRepresentativeSealTypeChange}
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
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selecteAuthorizerValue ?? ''}
                                                        onChange={handleSelectRepresentativeSealChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                        disabled={isAuthorizerPulldownDisabled}
                                                    >
                                                        {props.representativeInfo.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                {/* <Button variant="contained" color="info" sx={{ marginTop: '40px', width: '13em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handlePreviewStep} >代表印を作成する</Button> */}
                                            </Box>
                                            <Box sx={{ width: '50%', padding: '10px', borderRadius: '4px', justifyContent: 'end', border: '1px solid lightgray' }}>
                                                {/* <Typography>プレビュー</Typography> */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '300px' }}>
                                                    {getValues('representative_seal_temp') ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '300px' }}>
                                                            <img src={`data:image/png;base64,${getValues('representative_seal_temp')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
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
                                    ) : (
                                        <>
                                            <Typography>選択可能な代表印が登録されていません</Typography>
                                        </>
                                    )}
                                </Box>
                            </TabPanel>
                            <TabPanel value={createNewAgreementValue} index={2} dir={createNewAgreementTheme.direction}>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    {/* <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>承認フロー</Typography>
                                    </Box> */}
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
                                                    {props.userInfo.map((user: any) => (
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
                                                            error={!!touched[field.name] && !!errors[field.name]}
                                                            helperText={touched[field.name] ? errors[field.name] : ''}
                                                            onBlur={e => {
                                                                setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                field.onBlur();
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (value && !validator.isEmail(value)) {
                                                                    error = "メールアドレスの形式が正しくありません。";
                                                                }
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    [field.name]: error
                                                                }));
                                                            }}
                                                            onChange={e => {
                                                                field.onChange(e);
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (touched[field.name]) {
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addInternalApprovers} >追加する</Button>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempInternalApprover} disabled={workFlowApprovalList.length === 0}>クリア</Button>
                                </Box>
                                <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                    {(workFlowApprovalList.length === 0 &&
                                        !(
                                            (getValues('approval_flow.internal_authorizer.user_name') || '').trim() ||
                                            (getValues('approval_flow.internal_authorizer.position') || '').trim() ||
                                            (getValues('approval_flow.internal_authorizer.email') || '').trim()
                                        )
                                    ) ? (
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
                                                            {/* <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>承認順番</TableCell> */}
                                                            <TableCell align="left" sx={{ ...getTableHeaderStyle(), width: '10%' }}></TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>役職</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '5%' }}></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {workFlowApprovalList?.map((row: any, index: number) => (
                                                            <TableRow
                                                                key={index}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                {/* <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell> */}
                                                                <TableCell align="center" sx={{ padding: 0 }}>
                                                                    <IconButton
                                                                        size="medium"
                                                                        onClick={() => handleMoveInternalApprover(index, index - 1)}
                                                                        disabled={index === 0}
                                                                        sx={{
                                                                            backgroundColor: '#ffe0b2',
                                                                            marginRight: '10px',
                                                                            '&:hover': { backgroundColor: '#ffb74d' },
                                                                            paddingTop: 0,
                                                                            paddingBottom: 0,
                                                                            minHeight: 0,
                                                                            height: '32px',
                                                                            width: '32px',
                                                                            lineHeight: 1,
                                                                            '& .MuiSvgIcon-root': {
                                                                                padding: 0,
                                                                                margin: 0,
                                                                                minHeight: 0,
                                                                                height: '20px',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ArrowUpwardIcon fontSize="medium" />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="medium"
                                                                        onClick={() => handleMoveInternalApprover(index, index + 1)}
                                                                        disabled={index === workFlowApprovalList.length - 1}
                                                                        sx={{
                                                                            backgroundColor: '#e3f2fd',
                                                                            '&:hover': { backgroundColor: '#90caf9' },
                                                                            paddingTop: 0,
                                                                            paddingBottom: 0,
                                                                            minHeight: 0,
                                                                            height: '32px',
                                                                            width: '32px',
                                                                            lineHeight: 1,
                                                                            '& .MuiSvgIcon-root': {
                                                                                padding: 0,
                                                                                margin: 0,
                                                                                minHeight: 0,
                                                                                height: '20px',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ArrowDownwardIcon fontSize="medium" />
                                                                    </IconButton>
                                                                </TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                <TableCell align="center" sx={{ padding: 0 }}>
                                                                    <IconButton
                                                                        size="medium"
                                                                        onClick={() => handleDeleteApprover(index)}
                                                                        sx={{
                                                                            backgroundColor: '#ffebee',
                                                                            marginLeft: '10px',
                                                                            '&:hover': { backgroundColor: '#ffcdd2' },
                                                                            padding: 0,
                                                                            minHeight: 0,
                                                                            height: '32px',
                                                                            width: '32px',
                                                                            lineHeight: 1,
                                                                            '& .MuiSvgIcon-root': {
                                                                                padding: 0,
                                                                                margin: 0,
                                                                                minHeight: 0,
                                                                                height: '20px',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CloseIcon fontSize="medium" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {(
                                                            getValues('approval_flow.internal_authorizer.user_name') ||
                                                            getValues('approval_flow.internal_authorizer.position') ||
                                                            getValues('approval_flow.internal_authorizer.email')
                                                        ) && (
                                                                <TableRow
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0, backgroundColor: 'yellow' } }}
                                                                >
                                                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} ></TableCell>
                                                                    <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.user_name') || ''}</TableCell>
                                                                    <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.position') || ''}</TableCell>
                                                                    <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.email') || ''}</TableCell>
                                                                </TableRow>
                                                            )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>
                            <TabPanel value={createNewAgreementValue} index={3} dir={createNewAgreementTheme.direction}>
                                <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    {/* <Box sx={{ width: '100%' }}>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>通知先</Typography>
                                    </Box> */}
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
                                                    {props.userInfo.map((user: any) => (
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
                                                            error={!!touched[field.name] && !!errors[field.name]}
                                                            helperText={touched[field.name] ? errors[field.name] : ''}
                                                            onBlur={e => {
                                                                setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                field.onBlur();
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (value && !validator.isEmail(value)) {
                                                                    error = "メールアドレスの形式が正しくありません。";
                                                                }
                                                                setErrors(prev => ({
                                                                    ...prev,
                                                                    [field.name]: error
                                                                }));
                                                            }}
                                                            onChange={e => {
                                                                field.onChange(e);
                                                                const value = e.target.value;
                                                                let error = '';
                                                                if (touched[field.name]) {
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addInternalNotifier} >追加する</Button>
                                    <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempInternalNotifier} disabled={workFlowNotifierList?.length == 0}>クリア</Button>
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
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '5%' }}></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {workFlowNotifierList?.map((row: any, index: any) => (
                                                            <TableRow
                                                                key={index}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                <TableCell align="center" sx={{ padding: 0 }}>
                                                                    <IconButton
                                                                        size="medium"
                                                                        onClick={() => handleDeleteNotifier(index)}
                                                                        sx={{
                                                                            backgroundColor: '#ffebee',
                                                                            marginLeft: '10px',
                                                                            '&:hover': { backgroundColor: '#ffcdd2' },
                                                                            padding: 0,
                                                                            minHeight: 0,
                                                                            height: '32px',
                                                                            width: '32px',
                                                                            lineHeight: 1,
                                                                            '& .MuiSvgIcon-root': {
                                                                                padding: 0,
                                                                                margin: 0,
                                                                                minHeight: 0,
                                                                                height: '20px',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CloseIcon fontSize="medium" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>
                        </Box >
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            {createNewAgreementValue === 0 && (
                                <>
                                    {/* <Button
                                        onClick={onClose}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}
                                    >
                                        キャンセル
                                    </Button> */}
                                    <Button
                                        onClick={() => handleTabChange(1)}
                                        color="primary"
                                        variant="contained"
                                        sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                        disabled={!isFormValid}
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
                                        disabled={!isFormValid}
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
                                        onClick={() => handleTabChange(3)}
                                        color="primary"
                                        variant="contained"
                                        sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                        disabled={!isFormValid}
                                    >
                                        次へ
                                    </Button>
                                </>
                            )}
                            {createNewAgreementValue === 3 && (
                                <>
                                    <Button
                                        onClick={() => handleTabChange(2)}
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
                                        disabled={!isCheckworkFlowName}
                                    >
                                        入力内容を確認する
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', margin: '20px' }}>
                            以下の内容で登録します。よろしいですか？
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', flex: 1, marginBottom: '5px' }}>
                            <Button
                                onClick={onClose}
                                color="error"
                                variant="outlined"
                                sx={{ width: '12em', marginRight: '10px', marginLeft: '20px', '&:hover': { backgroundColor: 'lightred' } }}
                            >
                                キャンセル
                            </Button>
                        </Box>
                        <Box sx={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', marginLeft: '20px', marginRight: '20px', height: '680px', overflowY: 'auto' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>登録名</Typography>
                            <Box sx={{ width: '100%', backgroundColor: 'white', padding: '20px', borderRadius: '4px', marginBottom: '10px' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            color: 'black !important',
                                            WebkitTextFillColor: 'black !important',
                                        }
                                    }}
                                >
                                    <TextField
                                        value={getValues('workflow_name')}
                                        variant="standard"
                                        sx={{
                                            width: '100%',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: 'red',
                                        }}
                                        InputProps={{
                                            style: {
                                                color: 'black',
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                            },
                                            inputProps: {
                                                style: {
                                                    color: 'black',
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                }
                                            }
                                        }}
                                        InputLabelProps={{
                                            style: {
                                                color: 'black',
                                                fontSize: '20px'
                                            }
                                        }}
                                        disabled={true}
                                    />
                                </Box>
                            </Box>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>担当者（氏名／役職／メールアドレス）</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', width: '100%', backgroundColor: 'white', padding: '20px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                    <TextField
                                        value={
                                            [
                                                getValues('approval_flow.internal_pic.user_name') || '---',
                                                getValues('approval_flow.internal_pic.position') || '---',
                                                getValues('approval_flow.internal_pic.email') || '---'
                                            ].filter(Boolean).join('／') || ' '
                                        }
                                        // label="氏名／役職／メールアドレス"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                            </Box>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>代表者（氏名／役職／メールアドレス）</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px', width: '100%', backgroundColor: 'white', padding: '20px' }}>
                                <Box sx={{ width: '70%' }}>
                                    <TextField
                                        value={
                                            [
                                                getValues('approval_flow.internal_authorizer.user_name') || '---',
                                                getValues('approval_flow.internal_authorizer.position') || '---',
                                                getValues('approval_flow.internal_authorizer.email') || '---'
                                            ].filter(Boolean).join('／') || ' '
                                        }
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        width: '30%',
                                        minWidth: '180px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '10px',
                                        border: '1px solid lightgray',
                                        borderRadius: '8px',
                                        marginLeft: '20px',
                                        backgroundColor: '#fafafa',
                                        height: '100%'
                                    }}
                                >
                                    {getValues('representative_seal') ? (
                                        <img
                                            src={`data:image/png;base64,${getValues('representative_seal')}`}
                                            alt="代表印"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <Typography sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>
                                            代表印は選択されていません
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            {/* <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>代表印</Typography>
                            {getValues('representative_seal') ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '300px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '300px' }}>
                                        <img src={`data:image/png;base64,${getValues('representative_seal')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '70px' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                        代表印は選択されていません<br />
                                    </Typography>
                                </Box>
                            )} */}
                            {/* 承認フロー */}
                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>承認フロー</Typography>
                            <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                {(workFlowApprovalList.length === 0 &&
                                    !(
                                        (getValues('approval_flow.internal_authorizer.user_name') || '').trim() ||
                                        (getValues('approval_flow.internal_authorizer.position') || '').trim() ||
                                        (getValues('approval_flow.internal_authorizer.email') || '').trim()
                                    )
                                ) ? (
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
                                                        <TableCell sx={{ ...getTableHeaderStyle(), width: '15%' }}></TableCell>
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
                                                            <TableCell component="th" scope="row" sx={getTableCellStyle(row)}></TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.user_name}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.position}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.email}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(
                                                        getValues('approval_flow.internal_authorizer.user_name') ||
                                                        getValues('approval_flow.internal_authorizer.position') ||
                                                        getValues('approval_flow.internal_authorizer.email')
                                                    ) && (
                                                            <TableRow
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0, backgroundColor: 'yellow' } }}
                                                            >
                                                                <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} ></TableCell>
                                                                <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.user_name') || ''}</TableCell>
                                                                <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.position') || ''}</TableCell>
                                                                <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.email') || ''}</TableCell>
                                                            </TableRow>
                                                        )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </Box>
                            {/* 通知先 */}
                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>通知先</Typography>
                            <Box bgcolor='white'>
                                {workFlowNotifierList.length === 0 ? (
                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                            通知先は登録されていません
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {workFlowNotifierList?.map((row: any, index: any) => (
                                                        <TableRow
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.user_name}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.position}</TableCell>
                                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row?.email}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box >
                );
            default:
                return null;
        }
    };
    return (
        <>
            {/* 新規ワークロード作成ダイアログ */}
            <Dialog open={true} fullWidth maxWidth='xl'>
                <Box sx={{ bgcolor: 'grey.200', height: '100vh' }}>
                    <DialogContent sx={{ bgcolor: 'grey.200', padding: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', '& .Mui-disabled': { color: 'black' } }}>
                            <Box sx={{ height: '75%', marginBottom: '20px' }}>
                                <Box sx={{ mb: 4, padding: 0 }}>
                                    {renderStepContent(activeStep)}
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        {activeStep === 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                                {/* <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleBack} disabled={false}>戻る</Button> */}
                                {/* <Button variant="contained" color="error" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleModifyStep} disabled={!isCheckworkFlowName} >入力を開始する</Button> */}
                                <Button variant="contained" color="error" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleModifyStep} >入力を開始する</Button>
                                <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={onClose} disabled={false}>キャンセル</Button>
                            </Box>
                        )}
                        {activeStep === 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%' }}>
                                {/* <Button variant="contained" color="primary" sx={{ width: '10em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleBack} disabled={false}>戻る</Button>
                                <Button variant="contained" color="error" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handlePreviewStep} disabled={!isCheckworkFlowName} >入力内容を確認する</Button>
                                <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={onClose} disabled={false}>キャンセル</Button> */}
                            </Box>
                        )}
                        {activeStep === 2 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '20px', width: '100%' }}>
                                <Button variant="contained" color="error" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleSubmit(onSubmit)} >登録する</Button>
                                <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={handleModifyStep}>戻る</Button>
                                {/* <Button variant="contained" color="primary" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={onClose}>キャンセル</Button> */}
                            </Box>
                        )}
                    </DialogActions>
                </Box>
            </Dialog>
            <ApiGetAdditionalDataDialog open={executeApiWaitingDialog} handleClose={handleExecuteApiWaitingDialogClose} />
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            {/* <SettingsSuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} handleCloseModalDialog={closeRegisterUserDialog} /> */}
            <AutoCloseSuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} handleCloseModalDialog={closeRegisterUserDialog} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
}

export default RegisterWorkFlowDialog;