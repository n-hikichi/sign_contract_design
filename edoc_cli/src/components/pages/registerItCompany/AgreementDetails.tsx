import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, CssBaseline, FormControl, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemText, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
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
import Paper from '@mui/material/Paper';
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from 'react-markdown';

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

interface Message {
    role: "user" | "assistant";
    content: string;
}

const AgreementDetails: React.FC<{}> = () => {
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
    // 初回表示用の情報取得
    const [loading, setLoading] = useState(false);

    // 入力画面・プレビュー画面を切り替えるフラグ
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    // API処理中ダイアログ：エラーダイアログの開閉状態
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);

    // API実行失敗ダイアログ
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);

    // ...既存のstate...
    const [selectedModel, setSelectedModel] = useState<string>('sonnet'); // デフォルトモデル

    // 利用可能なモデル一覧
    const modelOptions = [
        { value: 'sonnet', label: 'Claude Sonnet 4' },
        { value: 'haiku', label: 'Claude 3 Haiku' },
        // 必要に応じて追加
    ];

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

    // サイドメニューの開閉状態を取得
    const isSideMenuOpen = localStorage.getItem('sideMenuIsOpen') === 'true';

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);
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

    const [input, setInput] = useState<string>("");
    const [webInput, setWebInput] = useState<string>("");

    // スクロール用refを追加
    const webMessagesEndRef = useRef<HTMLDivElement | null>(null);

    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "こんにちは！　何かお困りのことはありますか？" },
    ]);

    const [webMessages, setWebMessages] = useState<Message[]>([
        { role: "assistant", content: "こんにちは！　何かお困りのことはありますか？" },
    ]);

    // webMessagesが更新されたら一番下までスクロール
    useEffect(() => {
        if (webMessagesEndRef.current) {
            webMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [webMessages]);

    // const handleSendMessage = async () => {
    //     if (!input.trim()) return;

    //     const userMessage: Message = { role: "user", content: input };
    //     // setMessages((prevMessages) => [...prevMessages, userMessage]);

    //     setMessages((prevMessages) => [...prevMessages, userMessage]);

    //     setInput("");

    //     try {
    //         // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/cf7e4da0-9417-40a2-bbd9-5b3ce55fdce2/messages", {
    //         //     // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
    //         //     method: "GET",
    //         //     headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
    //         //     // body: JSON.stringify({ message: input })
    //         // });

    //         const response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test/generative-ai", {
    //             // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
    //             body: JSON.stringify({
    //                 body: JSON.stringify({ query: input }) // body内にさらにJSON.stringifyを適用
    //             }),
    //         });

    //         const data = await response.json();
    //         const body = JSON.parse(data.body);

    //         // // 一番番号が大きいデータを取得
    //         // const latestMessage = data.messages.reduce((prev: any, current: any) => {
    //         //     return prev.number > current.number ? prev : current;
    //         // });

    //         const assistantMessage: Message = { role: "assistant", content: body.answer };
    //         // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    //         // タブに応じてレスポンスを追加
    //         setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    //         // const assistantMessage: Message = { role: "assistant", content: data.messages[0].content };
    //         // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    //     } catch (error) {
    //         console.error("Error fetching AI response:", error);
    //     } finally {
    //         // setLoading(false);
    //     }
    // };

    // 契約書の削除要求
    const handleSendWebMessage = async () => {
        if (!webInput.trim()) return;

        const userMessage: Message = { role: "user", content: webInput };
        // setMessages((prevMessages) => [...prevMessages, userMessage]);

        setWebMessages((prevMessages) => [...prevMessages, userMessage]); // Web検索用のメッセージリスト

        setWebInput("");

        try {
            // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/cf7e4da0-9417-40a2-bbd9-5b3ce55fdce2/messages", {
            //     // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
            //     method: "GET",
            //     headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
            //     // body: JSON.stringify({ message: input })
            // });

            let response;
            let data;
            let body;

            // const system_prompt = "あなたは契約書テンプレート作成の専門家です。ユーザーが業界に合わせたテンプレート作成依頼をするので、ユーザーが望んでいる業界に即した契約書のテンプレートを作成してください。テンプレートなので、項目はもちろんですが実際の契約書で利用するよう条文を文章で返答してください。";
            // const system_prompt = "あなたは契約書テンプレート作成の専門家です。ユーザーが業界に合わせたテンプレート作成依頼をするので、ユーザーが望んでいる業界に即した契約書のテンプレートを作成してください。作成依頼のある契約書は基本契約書が主になるので、項目を分かりやすく挙げてください。また挙げた項目について、契約の内容を詳しく文章で説明してください。";
            const system_prompt = `あなたは契約書テンプレート作成の専門家です。ユーザーが依頼する業界や用途に応じて、適切な契約書テンプレートを作成してください。

                契約書は主に「基本契約書」形式となるため、以下の要件に従って出力してください。

                1. 契約書は、通常の商取引に用いられる法的整合性のある構成とし、適切に項目（条項）を分けてください。
                2. 各項目は「第○条（○○）」という条番号と表題をつけてください。
                3. 各条項の本文は、箇条書きではなく、日本語契約書として自然な文章形式（条文形式）で記述してください。
                4. 文体は、契約書特有の表現（例：「〜ものとする」「〜を要する」）を使用してください。
                5. ユーザーが業界を指定した場合は、その業界の慣習や業務内容に即した契約内容に調整してください。

                出力例の構造：
                - 第1条（目的）
                - 第2条（定義）
                - 第3条（業務の範囲）
                ...
                （各条文に対応する本文を自然な日本語で続ける）

                この形式で、契約書全体を構成してください。`;

            response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test3-makeAgreementTemplate/make-agreement-template", {
                // const response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test2/chat-v2", {
                // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
                body: JSON.stringify({ user_input: webInput, system_prompt: system_prompt }),
            });
            data = await response.json();
            body = JSON.parse(data.body);

            // // 一番番号が大きいデータを取得
            // const latestMessage = data.messages.reduce((prev: any, current: any) => {
            //     return prev.number > current.number ? prev : current;
            // });

            const assistantMessage: Message = { role: "assistant", content: body.answer };
            // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            // タブに応じてレスポンスを追加
            setWebMessages((prevMessages) => [...prevMessages, assistantMessage]); // Web検索用のメッセージリスト

            // const assistantMessage: Message = { role: "assistant", content: data.messages[0].content };
            // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
        } finally {
            // setLoading(false);
        }
        // }, 3000);
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

    // モデル選択時のハンドラ
    const handleModelChange = (event: SelectChangeEvent<string>) => {
        setSelectedModel(event.target.value as string);
    };

    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newTabValue: number) => {
        setTabValue(newTabValue);
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', paddingLeft: '1%', paddingRight: '1%' }}>
                                    <Paper elevation={3} style={{
                                        position: "fixed", bottom: 60, right: 20, width: isSideMenuOpen ? '75%' : '95%', height: '85%', padding: "10px",
                                        display: "flex", flexDirection: "column", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", backgroundColor: "#f4f4f4",
                                    }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: 'darkblue',
                                                color: 'white',
                                                paddingLeft: '10px',
                                                paddingRight: '10px',
                                                paddingTop: '10px',
                                                paddingBottom: '10px',
                                                borderRadius: '4px',
                                                marginBottom: '10px',
                                                position: "relative",
                                                width: "100%",
                                                textAlign: "center",
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            契約内容確認機能
                                        </Typography>
                                        {/* モデル選択プルダウンを追加 */}
                                        <FormControl fullWidth sx={{ marginBottom: 2 }}>
                                            <InputLabel id="model-select-label">モデル選択</InputLabel>
                                            <Select
                                                labelId="model-select-label"
                                                value={selectedModel}
                                                label="モデル選択"
                                                onChange={handleModelChange}
                                                sx={{ backgroundColor: 'white', width: '30%' }}
                                            >
                                                {modelOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {tabValue === 0 && (
                                            <>
                                                <Box sx={{ width: '100%', flex: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '10px', backgroundColor: 'white' }}>
                                                    <List>
                                                        {webMessages.map((msg, index) => (
                                                            <ListItem key={index} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
                                                                <ListItemText
                                                                    // primary={msg.content}
                                                                    primary={<ReactMarkdown>{msg.content}</ReactMarkdown>}
                                                                    primaryTypographyProps={{
                                                                        style: {
                                                                            backgroundColor: msg.role === "user" ? "#1976d2" : "#e0e0e0",
                                                                            color: msg.role === "user" ? "#fff" : "#000",
                                                                            borderRadius: "10px",
                                                                            paddingLeft: "20px",
                                                                            paddingRight: "20px",
                                                                            display: "inline-block",
                                                                            maxWidth: "80%"
                                                                        }
                                                                    }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                        <div ref={webMessagesEndRef} />
                                                    </List>
                                                </Box>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="質問を入力してください"
                                                    value={webInput}
                                                    onChange={(e) => setWebInput(e.target.value)}
                                                    style={{ marginTop: "10px", backgroundColor: "white" }}
                                                    multiline
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendWebMessage();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleSendWebMessage}
                                                    disabled={loading}
                                                    fullWidth
                                                    style={{ marginTop: "10px" }}
                                                    sx={{ '&:hover': { backgroundColor: 'darkblue' }, width: '40%', marginLeft: '30%', marginRight: '30%', display: 'block' }}
                                                >
                                                    {loading ? <CircularProgress size={24} /> : "送信"}
                                                </Button>
                                            </>
                                        )}
                                        {/* {tabValue === 1 && (
                                            <>
                                                <Box sx={{ width: '100%', flex: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '10px', backgroundColor: 'white' }}>
                                                    <List>
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
                                                </Box>
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
                                            </>
                                        )} */}
                                    </Paper>
                                </Box>
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
export default AgreementDetails;