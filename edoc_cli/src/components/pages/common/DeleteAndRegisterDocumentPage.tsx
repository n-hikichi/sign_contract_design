import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CssBaseline, FormControl, InputAdornment, InputLabel, MenuItem, RadioGroup, Radio, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
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
import CustomPulldownMenu, { contractType, CustomPulldownMenuForPrefecture, CustomPulldownMenuSignTemplate, effectiveDate, representativeSealSelectType } from '../../elements/CustomPulldownMenu';
import { readOnlyTextFieldPaddingLessStyle } from '../../../styles/fontStyles';
import { baseTextFieldStyle, parentTextFieldStyle } from '../../../styles/styles';
import api from '../../../utils/apiAccessor';
import apiExecutor from "../../../utils/apiExecutor";
import apiStatus from "../../../utils/apiStatus";
import converter from "../../../utils/converter";
import validationRules from '../../../utils/validationRules';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import { PreviewApproveFlowForRegister, PreviewApproveFlowForNotifier } from './PreviewApproveFlow';
import PreviewRegisterBasicInfo from './PreviewRegisterBasicInfo';
import ErrorDialog from './ErrorDialog';
import ApiProcessingDialog from "./ApiProcessingDialog";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ApproveFlowTable, { AuthorizerTable } from "../common/ApproveFlowTable";

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

interface FormerSettingsApprover {
    approved: boolean;
    approved_time: string;
    approver_id: string;
    user_name: string;
    email: string;
    position: string;
    company_name: string;
};

// interface User {
//     user_id: string,
//     position: string,
//     user_name: string,
//     company_name: string,
//     email: string,
//     user_attribute: 'INTERNAL' | 'CUSTOMER',
// };

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

// Approver型以外の不要なプロパティを除外する関数
const setApproverData = (obj: any) => {
    if (!obj) return obj;
    const { approver_id, approved, approved_time, ...rest } = obj;
    return rest;
};

const DeleteAndRegisterDocumentPage: React.FC<{}> = () => {
    const navigate = useNavigate();

    // 一覧画面で選択した契約書の情報を取得する
    const location = useLocation();
    const selectedInfo = location.state.selectedInfo;
    const internalCompanyData = location.state.internalCompanyData;
    const customer_id = location.state.selectedValue;
    const customerCompanyData = location.state.customerCompanyData;
    const approveFlow = location.state.approveFlowData;

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

    /***
     *
     * 登録画面で「確認する」、または確認画面で「戻る」を選択した時の処理
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
                    company_id: internalCompanyData.company_id,
                    company_name: internalCompanyData.company_name,
                    postal_code: internalCompanyData.postal_code,
                    state: internalCompanyData.state,
                    city: internalCompanyData.city,
                    address_line: internalCompanyData.address_line,
                    building: internalCompanyData.building,
                },
                customer_company: {
                    company_id: customerCompanyData.company_id,
                    company_name: customerCompanyData.company_name,
                    postal_code: customerCompanyData.postal_code,
                    state: customerCompanyData.state,
                    city: customerCompanyData.city,
                    address_line: customerCompanyData.address_line,
                    building: customerCompanyData.building,
                },
                type: selectedInfo.type,
                deal_amount: selectedInfo.deal_amount,
                conclusion_date: dayjs(), // 契約期間は契約書登録時点の日付を設定
                expiration_date: dayjs().add(1, 'year').subtract(1, 'day'), // 契約期間は契約書登録時点の日付を設定
                template_id: '', // テンプレートは判別が付かないため初期値を設定
                approval_flow: {
                    internal_pic: setApproverData(approveFlow.internal_pic),
                    internal_approver: initialApprovers, // プレビュー表示した際に設定する
                    internal_approver_temp: approveFlow.internal_approver, // 登録リクエストを送信する際に削除する
                    internal_authorizer: setApproverData(approveFlow.internal_authorizer),
                    internal_notifier: initialApprovers, // プレビュー表示した際に設定する
                    internal_notifier_temp: approveFlow.internal_notifier,
                    customer_pic: setApproverData(approveFlow.customer_pic),
                    customer_approver: initialApprovers, // プレビュー表示した際に設定する
                    customer_approver_temp: approveFlow.customer_approver, // 登録リクエストを送信する際に削除する
                    customer_authorizer: setApproverData(approveFlow.customer_authorizer),
                    customer_notifier: initialApprovers, // プレビュー表示した際に設定する
                    customer_notifier_temp: approveFlow.cutomer_notifier,
                    submission_period: approveFlow.submission_period,
                }
            }
        }
    );

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        setIsLoading(true);

        const fetchData = async () => {
            try {
                // 並列実行するAPIを設定
                const requests = [
                    apiExecutor.fetchGetLocationList(internalCompanyData.company_id), // 自社拠点一覧
                    apiExecutor.fetchGetUserData(internalCompanyData.company_id), // 自社承認ユーザー一覧
                    apiExecutor.fetchGetLocationList(customerCompanyData.company_id), // 顧客拠点一覧
                    apiExecutor.fetchGetUserData(customerCompanyData.company_id), // 顧客承認ユーザー一覧
                    // apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id), // 承認フロー情報
                    apiExecutor.fetchGetSignedTemplateList() // 署名テンプレート一覧
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
                const [internalLocation, internalUser, customerLocation, customerUser, signedTemplate] = await Promise.all(responses.map((res: Response) => res.json()));


                if (internalLocation.length > 0) {
                    // 自社拠点一覧を設定
                    setInternalLocationList(internalLocation);

                    // デフォルト値が取得できた場合は企業名設定済み
                    setIsSetInternalCompanyName(true);
                }

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

                // 自社承認ユーザーを設定
                setInternalUserList(internalFalseList);

                // 登録済み代表印がある場合は追加する
                if (internalTrueList.length > 0) {
                    internalTrueList.forEach((user: { user_name: string; file: string }) => {
                        internalRepresentativeSealMap.set(user.user_name, user.file);
                        setInternalRepresentativeSealMap(new Map(internalRepresentativeSealMap));
                    });
                };

                // approveFlowのuser_idと一致するユーザーを検索し、そのfileプロパティを取得
                const matchingUserFile = internalUser.find((user: User) => user.user_name === approveFlow.internal_authorizer.user_name)?.file;
                setValue('internal_seal', matchingUserFile);

                if (customerLocation.length > 0) {
                    // 顧客拠点一覧を設定
                    setCustomerLocationList(customerLocation);

                    // デフォルト値が取得できた場合は企業名設定済み
                    setIsSetCustomerCompanyName(true);
                }

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

                // 登録済み代表印がある場合は追加する
                if (customerTrueList.length > 0) {
                    customerTrueList.forEach((user: { user_name: string; file: string }) => {
                        customerRepresentativeSealMap.set(user.user_name, user.file);
                        setCustomerRepresentativeSealMap(new Map(customerRepresentativeSealMap));
                    });
                };

                // 自社承認ユーザーを設定
                setCustomerUserList(customerFalseList);

                // approveFlowのuser_idと一致するユーザーを検索し、そのfileプロパティを取得
                const matchingCustomerUserFile = customerUser.find((user: User) => user.user_name === approveFlow.customer_authorizer.user_name)?.file;

                setValue('customer_seal', matchingCustomerUserFile);

                // 署名テンプレートリストを設定
                setSignTemplateList(signedTemplate);
                setSelectedValueSignTemplateId(signedTemplate[0].template_id);
                setSelectedValueSignTemplateName(signedTemplate[0].template_name);
                setValue('template_id', signedTemplate[0].template_id);


                initialInternalApproverSettings();
                initialCustomerApproverSettings();

                // 担当者の入力フォームをチェック
                isPicInputComplete();

                // 代表者の入力フォームをチェック
                isAuthorizerInputComplete();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // アップロードしたファイルの情報を保持する
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
                setValue('file', base64String);
            };
            reader.readAsDataURL(file);

            setFileUploaded(true);
        }
    };

    // ドロップされたファイルを処理します。ここでは最初のファイルだけを扱います。
    const onDropPdfFile = useCallback((acceptedFiles: File[]) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        handleFileUpload(acceptedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { getRootProps: getRootPropsPdfFile, getInputProps: getInputPropsPdfFile, isDragActive: isDragActivePdfFile } = useDropzone({ onDrop: onDropPdfFile });

    /***
     *
     * 契約基本情報設定フィールド
     *
     */
    // 契約種別
    const [selectedValue, setSelectedValue] = useState<string>('');
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        setSelectedValue(event.target.value as string);
        setValue('type', event.target.value);
    };

    // 署名テンプレート
    const [selectedValueSignTemplateName, setSelectedValueSignTemplateName] = useState<string>('');
    const [selectedValueSignTemplateId, setSelectedValueSignTemplateId] = useState<string>('');
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
        setSelectedValueUrlExpirationDate(event.target.value);
        // setValue('approval_flow.submission_period', Number(event.target.value));
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

    // 顧客企業名（必須フィールド）チェック
    const [isSetCustomerCompanyName, setIsSetCustomerCompanyName] = useState(false);

    // 顧客情報
    const [selectedCustomerLocation, setSelectedCustomerLocation] = useState('');

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
    // バリデーションフラグ
    const [isInternalPicInpuTFormValid, setIsInternalPicInpuTFormValid] = useState(false);
    const [isCustomerPicInpuTFormValid, setIsCustomerPicInpuTFormValid] = useState(false);

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

    // プルダウンメニューの選択肢
    const [selectedInternalPic, setSelectedInternalPic] = useState('');

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

    // チェックボックスの状態を管理する
    const [isChecked_internalPic, setIsChecked_internalPic] = useState(false);
    const [isChecked_internalSeal, setIsChecked_internalSeal] = useState(false);

    // 承認者情報に関する処理
    // チェックボックスの状態を更新する
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
    const [selectedCustomerPic, setSelectedCustomerPic] = useState('');

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

    // チェックボックスの状態を管理する
    const [isChecked_customerPic, setIsChecked_customerPic] = useState(false);
    const [isChecked_customerSeal, setIsChecked_customerSeal] = useState(false);

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
     * 自社代表者：入力フォーム
     *
     */
    // バリデーションフラグ
    const [isInternalAuthorizerInpuTFormValid, setIsInternalAuthorizerInpuTFormValid] = useState(false);
    const [isCustomerAuthorizerInpuTFormValid, setIsCustomerAuthorizerInpuTFormValid] = useState(false);

    /***
     *
     * フォームの入力チェック
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
    const handleBlurForInternalInputForm = () => {
        // フォームの入力値をチェック
        isAuthorizerInputComplete();
    };

    const [selectedInternalAuthorizer, setSelectedInternalAuthorizer] = useState('');

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

    /***
     *
     * 自社代表者：代表印アップロード
     *
     */
    // ファイルアップロード状況
    const [internalSealFileUploaded, setInternalSealFileUploaded] = useState(false);
    const [selectType_internal, setSelectType_internal] = useState(representativeSealSelectType[0].value);
    const [selectedPdfPreview_internal, setSelectedPdfPreview_internal] = useState<string>('');
    const [selectedRepresentativeSeal_internal, setSelectedRepresentativeSeal_internal] = useState('');

    // ドロップされたファイルを処理します。ここでは最初のファイルだけを扱います。
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

    const [selectedCustomerAuthorizer, setSelectedCustomerAuthorizer] = useState('');
    const [selectType_customer, setSelectType_customer] = useState(representativeSealSelectType[0].value);

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

    /***
     *
     * 相手方代表者：代表印アップロード
     *
     */
    // ファイルアップロード状況
    const [customerSealFileUploaded, setCustomerSealFileUploaded] = useState(false);
    const [selectedPdfPreview_customer, setSelectedPdfPreview_customer] = useState<string>('');
    const [selectedRepresentativeSeal_customer, setSelectedRepresentativeSeal_customer] = useState('');

    // ドロップされたファイルを処理します。ここでは最初のファイルだけを扱います。
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
    const internalTheme = useTheme();
    const [internalThemeValue, setInternalThemeValue] = React.useState(0);

    const handleInternalThemeValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setInternalThemeValue(newValue);
    };

    /***
     *
     * ユーザーロール選択タブ制御（顧客）
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
    const [selectedValuesForInternalApprover, setSelectedValuesForInternalApprover] = useState<any[]>([]);

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

    const [isInternalApproverAdded, setIsInternalApproverAdded] = useState(false);

    // 承認者をリストに追加する（初期値）
    const initialInternalApproverSettings = () => {

        if (approveFlow.internal_approver.length > 0) {

            // approveFlow.internal_approverから不要なプロパティを削除
            const sanitizedInternalApprovers = approveFlow.internal_approver.map(({ approved, approved_time, approver_id, ...rest }: FormerSettingsApprover) => rest);

            // sanitizedInternalApproversを使用してstateを更新
            setSelectedValuesForInternalApprover(sanitizedInternalApprovers);

            setIsInternalApproverAdded(true);
        };

        if (approveFlow.internal_notifier.length > 0) {

            // approveFlow.internal_approverから不要なプロパティを削除
            const sanitizedInternalNotifiers = approveFlow.internal_notifier.map(({ approved, approved_time, approver_id, ...rest }: FormerSettingsApprover) => rest);

            // sanitizedInternalApproversを使用してstateを更新
            setSelectedValuesForInternalNotifier(sanitizedInternalNotifiers);

            setIsInternalNotifierAdded(true);
        };
    };

    // 承認者をリストに追加する
    const addInternalApprovers = () => {
        const user_name = getValues().approval_flow.internal_approver_temp.user_name;
        const email = getValues().approval_flow.internal_approver_temp.email;

        if (!user_name || !email) {
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

        if (!user_name || !email) {
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
    // プルダウンメニューで選択した値
    const [selectedCustomerApprover, setSelectedCustomerApprover] = useState('');

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

    const [customerApprovers, setCustomerApprovers] = useState<any[]>([]);
    const [selectedValuesForCustomerApprover, setSelectedValuesForCustomerApprover] = useState<any[]>([]);

    const [isCustomerApproverAdded, setIsCustomerApproverAdded] = useState(false);

    // 承認者をリストに追加する（初期値）
    const initialCustomerApproverSettings = () => {

        if (approveFlow.customer_approver.length > 0) {

            // approveFlow.customer_approverから不要なプロパティを削除
            const sanitizedCustomerApprovers = approveFlow.customer_approver.map(({ approved, approved_time, approver_id, ...rest }: FormerSettingsApprover) => rest);

            // sanitizedCustomerApproversを使用してstateを更新
            setSelectedValuesForCustomerApprover(sanitizedCustomerApprovers);

            setIsCustomerApproverAdded(true);
        };

        if (approveFlow.customer_notifier.length > 0) {

            // approveFlow.customer_approverから不要なプロパティを削除
            const sanitizedCustomerNotifiers = approveFlow.customer_notifier.map(({ approved, approved_time, approver_id, ...rest }: FormerSettingsApprover) => rest);

            // sanitizedCustomerApproversを使用してstateを更新
            setSelectedValuesForCustomerNotifier(sanitizedCustomerNotifiers);

            setIsCustomerNotifierAdded(true);
        };
    };

    // 承認者をリストに追加する
    const addCustomerApprovers = () => {
        const user_name = getValues().approval_flow.customer_approver_temp.user_name;
        const email = getValues().approval_flow.customer_approver_temp.email;

        if (!user_name || !email) {
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

        if (!user_name || !email) {
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

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor='#eeffee' sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: '80px', width: '100%' }}>
                    <CssBaseline />
                    <Header />
                    <Box sx={{ flexGrow: 1, paddingLeft: '10%', paddingRight: '10%' }}>
                        {!isPreviewVisible && (
                            <>
                                <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
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
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                            <UploadFileIcon style={{ fontSize: 75 }} />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                                                            <br />
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
                                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', color: getValues('title') ? 'inherit' : 'red', fontSize: '1.2em', marginBottom: '20px' }}>
                                                        {getValues('title') ?
                                                            <Box sx={{ ...parentTextFieldStyle }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginRight: '20px' }}>
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
                                                                    <Box sx={{ display: 'flex', width: '50%', marginLeft: '10px' }}>
                                                                        <CustomPulldownMenuSignTemplate
                                                                            label="署名テンプレート名"
                                                                            value={selectedValueSignTemplateId}
                                                                            onChange={handleSelectChangeSignTemplate}
                                                                            items={signTemplateList}
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
                                                                <Box sx={{ display: 'flex', width: '50%', marginBottom: '40px', marginRight: '10px' }}>
                                                                    <CustomPulldownMenu
                                                                        label="署名用URL有効期限（相手方企業用）"
                                                                        value={selectedValueUrlExpirationDate}
                                                                        onChange={handleSelectedValueUrlExpirationDate}
                                                                        items={effectiveDate}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ display: 'flex', width: '100%', marginBottom: '30px' }}>
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
                                                            <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
                                                                本設定の情報は、契約を締結した際に署名欄へ印字されます。<br />
                                                                システムに登録済みの拠点情報をプルダウンメニューから選択、あるいは直接入力する事ができます。
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'row', border: '2px solid lightgray', marginBottom: '10px', padding: '20px' }}>
                                                            <Box sx={{ width: '50%' }}>
                                                                <Box sx={{ marginBottom: '20px' }}>
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
                                                                                sx={{ width: '70%', fontSize: '20px', fontWeight: 'bold' }}
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
                                                                                    sx={{ width: '100%' }}
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
                                                                                    sx={{ width: '100%' }}
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
                                                                                <CustomPulldownMenuForPrefecture
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
                                                                            name="own_company.address_line"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="own_company.address_line"
                                                                                    label="町名番地"
                                                                                    variant="standard"
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
                                                                            name="own_company.building"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="own_company.building"
                                                                                    label="建物名・部屋番号"
                                                                                    variant="standard"
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
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ width: '50%', marginLeft: '20px' }}>
                                                                <Box sx={{ marginBottom: '20px' }}>
                                                                    <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
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
                                                                                sx={{ width: '70%', fontSize: '20px', fontWeight: 'bold' }}
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
                                                                                    sx={{ width: '100%' }}
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
                                                                                    sx={{ width: '100%' }}
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
                                                                                <CustomPulldownMenuForPrefecture
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
                                                                            name="customer_company.building"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <TextField
                                                                                    {...field}
                                                                                    id="customer_company.building"
                                                                                    label="建物名・部屋番号"
                                                                                    variant="standard"
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
                                                            <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
                                                                本契約の担当者（窓口）として設定するユーザーを登録してください。
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'row', border: '2px solid lightgray', marginBottom: '20px', padding: '20px' }}>
                                                            <Box sx={{ width: '50%', marginRight: '20px' }}>
                                                                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
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
                                                                                sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
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
                                                                                    sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
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
                                                                    <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'start', marginLeft: '5%', marginTop: '10px' }}>
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
                                                            <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
                                                                本契約を合意する権限を持っている関係者を登録してください。<br />
                                                                本項目に設定した担当者の情報は、契約書へ各社の代表として署名情報が印字されます。<br />
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'row', border: '2px solid lightgray', marginBottom: '20px', padding: '20px' }}>
                                                            <Box sx={{ width: '50%', marginRight: '20px' }}>
                                                                <Box sx={{ marginBottom: '20px' }}>
                                                                    <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
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
                                                                                    sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
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
                                                                                        {getValues('internal_seal') ? (
                                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%', height: '300px' }}>
                                                                                                <img src={`data:image/png;base64,${getValues('internal_seal')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid gray', borderRadius: '10px' }} />
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
                                                                        {/* <Box sx={{ width: '100%', marginBottom: '20px' }}>
                                                                            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'start', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '5px' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                                                    代表印<br />
                                                                                </Typography>
                                                                            </Box>
                                                                            {getValues('internal_seal') ? (
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                    <img src={`data:image/png;base64,${getValues('internal_seal')}`} alt="Uploaded preview" style={{ maxWidth: '100%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                                        代表印が登録されているユーザーを選択してください<br />
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}
                                                                        </Box> */}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ width: '50%', marginLeft: '20px' }}>
                                                                <Box sx={{ marginBottom: '20px' }}>
                                                                    <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
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
                                                                                    sx={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}
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
                                                                    <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: '20px' }}>
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
                                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%', height: '300px' }}>
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
                                                                                        {getValues('customer_seal') ? (
                                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%', height: '300px' }}>
                                                                                                <img src={`data:image/png;base64,${getValues('customer_seal')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid gray', borderRadius: '10px' }} />
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
                                                                        {/* <Box sx={{ width: '100%', marginBottom: '20px' }}>
                                                                            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'start', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '10px' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                                                                    代表印<br />
                                                                                </Typography>
                                                                            </Box>
                                                                            {getValues('customer_seal') ? (
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                    <img src={`data:image/png;base64,${getValues('customer_seal')}`} alt="Uploaded preview" style={{ maxWidth: '100%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                                        代表印が登録されているユーザーを選択してください<br />
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}
                                                                        </Box> */}
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
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
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
                                                                            <>
                                                                                <Box sx={{ backgroundColor: 'grey.200', border: '1px solid lightgray' }}>
                                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Box sx={{ width: '90%', py: 2, paddingTop: '20px', paddingBottom: '20px' }}>
                                                                                            <ApproveFlowTable
                                                                                                isAuthorizerAdded={isInternalAuthorizerInpuTFormValid}
                                                                                                selectedApproverData={selectedValuesForInternalApprover}
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
                                                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px' }}>
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
                                                                <Box sx={{ marginBottom: '40px' }}>
                                                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginBottom: '40px' }}>
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
                                                                                                isAuthorizerAdded={isCustomerAuthorizerInpuTFormValid}
                                                                                                selectedApproverData={selectedValuesForCustomerApprover}
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
                                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}>
                                        <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                            <Typography>キャンセル</Typography>
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
                                </Box>
                            </>
                        )}
                        {isPreviewVisible && (
                            <>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5em' }}>
                                    こちらの内容で登録します。よろしいですか？
                                </Typography>
                                <Box sx={{ marginTop: '20px' }}>
                                    <PreviewRegisterBasicInfo basicInfo={getValues()} file={file} templateId={selectedValueSignTemplateId} templateName={selectedValueSignTemplateName} />
                                    <PreviewApproveFlowForRegister internalApproveFlow={previewInternal} customerApproveFlow={previewCustomer} internalSeal={getValues('internal_seal')} customerSeal={getValues('customer_seal')} />
                                    <PreviewApproveFlowForNotifier internalNotifier={getValues('approval_flow.internal_notifier')} customerNotifier={getValues('approval_flow.customer_notifier')} />
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
                        )}
                    </Box>
                    <Footer />
                </Box>
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}
export default DeleteAndRegisterDocumentPage;