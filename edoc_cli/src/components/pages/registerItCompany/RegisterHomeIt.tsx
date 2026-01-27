import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CssBaseline, FormControl, InputAdornment, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldPaddingLessStyle } from '../../../styles/fontStyles';
import { baseTextFieldStyle, registerHomeInputErrorDialogStyle } from '../../../styles/styles';
import api from '../../../utils/apiAccessor';
import apiExecutor from "../../../utils/apiExecutor";
import apiStatus from "../../../utils/apiStatus";
import converter from "../../../utils/converter";
import CustomPulldownMenu, { contractType, CustomPulldownMenu_ForPrefecture, CustomPulldownMenu_SignTemplate, effectiveDate } from '../../elements/CustomPulldownMenu';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import SideMenuForGenerativeAi from '../../templates/SideMenuForGenerativeAi';
import NowLoading from '../../templates/NowLoading';
import ApiProcessingDialog from "../common/ApiProcessingDialog";
import ErrorDialog from '../common/ErrorDialog';
import PreviewRegisterBasicInfo from '../common/PreviewRegisterBasicInfo';

import awsconfig from '../../../aws-exports';

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

interface CompanyInfo {
    company_id: string;
    company_name: string;
    postal_code: string;
    state: string;
    city: string;
    address_line: string;
    building: string;
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

const RegisterHomeIt: React.FC<{}> = () => {
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
    // 署名テンプレート
    const [selectedValueSignTemplateName, setSelectedValueSignTemplateName] = useState<string>('');
    const [selectedValueSignTemplateId, setSelectedValueSignTemplateId] = useState<string>('');

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        // setIsLoading(true);

        // const fetchData = async () => {
        //     try {
        //         // 並列実行するAPIを設定
        //         const requests: Promise<Response>[] = [
        //             apiExecutor.fetchGetLocationList(internalCompany_data.company_id),
        //             apiExecutor.fetchGetUserData(internalCompany_data.company_id),
        //             apiExecutor.fetchGetLocationList(customer_id),
        //             apiExecutor.fetchGetUserData(customer_id),
        //             apiExecutor.fetchGetSignedTemplateList()
        //         ];

        //         // APIを並列実行
        //         const responses = await Promise.all(requests);

        //         // ステータスコードが200以外の場合の処理
        //         const errorResponse = responses.find((res: Response) => res.status !== 200);
        //         if (errorResponse) {
        //             setErrorCode(errorResponse.status);
        //             setErrorProcess('契約書登録　情報取得処理');
        //             setExecuteFailedApiDialogOpen(true);
        //             return;
        //         }

        //         // 正常に取得できた場合は各APIのレスポンスを取得する
        //         const [internalLocation, internalUser, customerLocation, customerUser, signedTemplate] = await Promise.all(responses.map((res: Response) => res.json()));


        //         if (internalLocation.length > 0) {
        //             // 自社拠点一覧を設定
        //             setInternalLocationList(internalLocation);

        //             // 初期値としてインデックス0の値を設定
        //             setSelectedInternalLocation(internalLocation[0].location_name);
        //             setValue('own_company.company_name', internalLocation[0].company_name);
        //             setValue('own_company.postal_code', internalLocation[0].postal_code);
        //             setValue('own_company.state', internalLocation[0].state);
        //             setValue('own_company.city', internalLocation[0].city);
        //             setValue('own_company.address_line', internalLocation[0].address_line);
        //             setValue('own_company.building', internalLocation[0].building);

        //             // デフォルト値が取得できた場合は企業名設定済み
        //             setIsSetInternalCompanyName(true);
        //         };

        //         // internalUserをisRepresentativeSealがtrue/falseで分割
        //         const { internalTrueList, internalFalseList } = internalUser.reduce(
        //             (userList: { internalTrueList: typeof internalUser; internalFalseList: typeof internalUser }, user: any) => {
        //                 if (user.isRepresentativeSeal) {
        //                     userList.internalTrueList.push(user);
        //                 } else {
        //                     userList.internalFalseList.push(user);
        //                 }
        //                 return userList;
        //             },
        //             { internalTrueList: [], internalFalseList: [] }
        //         );

        //         // 登録済みユーザー情報を追加する
        //         setInternalUserList(internalFalseList);

        //         if (customerLocation.length > 0) {
        //             // 顧客拠点一覧を設定
        //             setCustomerLocationList(customerLocation);

        //             // 初期値としてインデックス0の値を設定
        //             setSelectedCustomerLocation(customerLocation[0].location_name);
        //             setValue('customer_company.company_name', customerLocation[0].company_name);
        //             setValue('customer_company.postal_code', customerLocation[0].postal_code);
        //             setValue('customer_company.state', customerLocation[0].state);
        //             setValue('customer_company.city', customerLocation[0].city);
        //             setValue('customer_company.address_line', customerLocation[0].address_line);
        //             setValue('customer_company.building', customerLocation[0].building);

        //             // デフォルト値が取得できた場合は企業名設定済み
        //             setIsSetCustomerCompanyName(true);
        //         };

        //         // customerUserをisRepresentativeSealがtrue/falseで分割
        //         const { customerTrueList, customerFalseList } = customerUser.reduce(
        //             (userList: { customerTrueList: typeof customerUser; customerFalseList: typeof customerUser }, user: any) => {
        //                 if (user.isRepresentativeSeal) {
        //                     userList.customerTrueList.push(user);
        //                 } else {
        //                     userList.customerFalseList.push(user);
        //                 }
        //                 return userList;
        //             },
        //             { customerTrueList: [], customerFalseList: [] }
        //         );

        //         // 登録済みユーザー情報を追加する
        //         setCustomerUserList(customerFalseList);

        //         // 署名テンプレートリストを設定
        //         setSignTemplateList(signedTemplate);
        //         setSelectedValueSignTemplateId(signedTemplate[0].template_id);
        //         setSelectedValueSignTemplateName(signedTemplate[0].template_name);

        //     } catch (error) {
        //         console.error('Error fetching data:', error);

        //         setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        //         setErrorProcess('契約書登録　情報取得処理');
        //         setExecuteFailedApiDialogOpen(true);
        //     } finally {
        //         setIsLoading(false);
        //     }
        // };

        // fetchData();
    }, []);

    // フォームの入力値
    const { control, watch, setValue, getValues, handleSubmit } = useForm<FormInput>(
        {
            defaultValues: {
                title: '',
                file_name: '',
                file: '',
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
                // template_id: location?.state?.signTemplateList?.[0]?.template_id ?? '',
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

            // // フォームから承認フローを取得
            // const approval_flow = getValues().approval_flow;

            // // 自社承認フローを設定
            // const internalApprovalFlow = {
            //     internal_approver: selectedValuesForInternalApprover,
            //     internal_authorizer: approval_flow.internal_authorizer,
            // };

            // // 相手方承認フローを設定
            // const customerApprovalFlow = {
            //     customer_approver: selectedValuesForCustomerApprover,
            //     customer_authorizer: approval_flow.customer_authorizer,
            // };

            // // 各ユーザーにユーザー権限（担当者、承認者、代表者）を付与
            // const internalList = addUserRole(internalApprovalFlow);
            // const customerList = addUserRole(customerApprovalFlow);

            // // プレビュー画面に表示するデータを設定
            // setPreviewInternal(internalList);
            // setPreviewCustomer(customerList);

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

    // --- 1. 必要なuseStateを追加 ---
    const [type, setTypeId] = useState('');
    const [orderId, setOrderId] = useState('');
    const [projectName, setProjectName] = useState('');
    const [internalCompanyId, setInternalCompanyId] = useState('');
    const [customerCompanyId, setCustomerCompanyId] = useState('');
    const [engineerName, setEngineerName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [price, setPrice] = useState('');

    // --- 2. 柔軟なキー取得関数を追加 ---
    const getValueByCandidates = (obj: any, candidates: string[]) => {
        for (const key of Object.keys(obj)) {
            for (const candidate of candidates) {
                if (key.replace(/\s/g, '') === candidate.replace(/\s/g, '')) {
                    return obj[key];
                }
            }
        }
        return undefined;
    };

    // 契約書の削除要求
    const readingFile = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test3-getPdfFile2/pdffile-textinfo", getRequestOptions());
            const resJson = await response.json();

            // 1. bodyをパース
            const bodyObj = typeof resJson.body === "string" ? JSON.parse(resJson.body) : resJson.body;
            // 2. analysis.contentからJSON部分だけを抽出
            const content = bodyObj.analysis.content;
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            // 3. JSON文字列をパース
            const analysisObj = JSON.parse(jsonString);

            // 4. 「抽出情報」から値を取得
            const info = analysisObj['抽出情報'] || analysisObj['重要な情報'] || analysisObj['important_info'] || {};

            // 5. 各値をセット（候補リストで柔軟に対応）
            setTypeId(getValueByCandidates(info, ['文書の種類']) || '');
            setOrderId(getValueByCandidates(info, ['注文番号', 'order_id', '注文No', '注文NO']) || '');
            setInternalCompanyId(getValueByCandidates(info, ['会社名（甲）']) || '');
            setCustomerCompanyId(getValueByCandidates(info, ['会社名（乙）']) || '');
            setOrderId(getValueByCandidates(info, ['注文番号', 'order_id', '注文No', '注文NO']) || '');
            setProjectName(getValueByCandidates(info, ['プロジェクト名', 'project_name', '案件名']) || '');
            setEngineerName(getValueByCandidates(info, ['氏名', '技術者', '技術者氏名', 'name']) || '');
            setStartDate(getValueByCandidates(info, ['実施期間（開始日時）', '開始日時', 'start_date', '開始日', '契約開始日']) || '');
            setEndDate(getValueByCandidates(info, ['実施期間（終了日時）', '終了日時', 'end_date', '終了日', '契約終了日']) || '');
            setPrice(getValueByCandidates(info, ['基準単価', '精算単価', 'price', '単価']) || '');
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('契約書破棄処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    let authorizationToken: string = '';

    // Authorizationヘッダに付与するアクセストークンを設定する
    function setAuthorizationToken(token: string): void {
        authorizationToken = token;
    };

    // Getリクエストの共通オプション
    const getRequestOptions = () => {
        // アクセストークンが未設定の場合は、ローカルストレージから取得する
        if (`${authorizationToken}` === '') {
            const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
            const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`) || '';

            setAuthorizationToken(token);
        }
        return {
            method: 'GET',
            headers: { ...getAuthorizationHeader() },
        };
    };

    // CognitoのクライアントID
    const clientId = awsconfig.Auth.aws_user_pools_web_client_id;

    // AuthorizationHeaderを設定する共通関数
    const getAuthorizationHeader = () => {
        const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
        const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`) || '';
        const authorizationToken = `Bearer ${token}`;

        return { 'Authorization': `${authorizationToken}` };
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                    <Header />
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <SideMenuForGenerativeAi />
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <Box sx={{ marginLeft: '5%', marginRight: '5%' }}>
                                {!isPreviewVisible && (
                                    <>
                                        {/* <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                            契約書テキスト抽出機能（開発版）
                                        </Typography> */}
                                        <Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Box sx={{ border: '1px solid lightgray', backgroundColor: 'white', padding: '20px', marginBottom: '20px' }}>
                                                    <Box sx={{ backgroundColor: '#1565c0', padding: '10px', marginLeft: '25%', marginRight: '25%', marginBottom: '20px', width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', width: '50%', textAlign: 'center' }}>ファイルアップロード</Typography>
                                                    </Box>
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
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', marginLeft: '5%', marginRight: '5%', marginBottom: '10px' }}>
                                                                    <TextField
                                                                        id="agreement-Subject1"
                                                                        variant="standard"
                                                                        label="アップロードファイル名"
                                                                        value={fileName}
                                                                        disabled={true}
                                                                        sx={{ ...readOnlyTextFieldPaddingLessStyle, width: '100%', marginBottom: '20px' }}
                                                                    />
                                                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                                                        <Button
                                                                            variant="contained"
                                                                            onClick={() => readingFile()}
                                                                            sx={{ width: '20em', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}
                                                                        >
                                                                            アップロード
                                                                        </Button>
                                                                        <Button
                                                                            variant="contained"
                                                                            onClick={() => readingFile()}
                                                                            sx={{ width: '20em', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }}
                                                                        >
                                                                            データを反映する
                                                                        </Button>
                                                                    </Box>
                                                                </Box>
                                                            </Box> : '※ファイルをアップロードしてください。'}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ border: '1px solid lightgray', backgroundColor: 'white', padding: '20px', marginBottom: '20px' }}>
                                                    <Box sx={{ backgroundColor: '#1565c0', padding: '10px', marginLeft: '25%', marginRight: '25%', marginBottom: '20px', width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>契約基本情報設定</Typography>
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Box sx={{ width: '100%', paddingLeft: '5%', paddingRight: '5%' }}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                                                                    <TextField label="文書の種類" value={type} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="注文番号" value={orderId} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="プロジェクト名" value={projectName} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="会社名（甲）" value={internalCompanyId} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="会社名（乙）" value={customerCompanyId} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="技術者氏名" value={engineerName} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="開始日時" value={startDate} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="終了日時" value={endDate} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                    <TextField label="基準単価" value={price} variant="standard" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} sx={{ width: '100%' }} />
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}>
                                                <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} >
                                                    <Typography>戻る</Typography>
                                                </Button>
                                                <Button
                                                    variant="contained"
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
                            </Box>
                        </Box>
                    </Box >
                </Box >
                <Footer />
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}
export default RegisterHomeIt;