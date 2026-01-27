import AppBar from '@mui/material/AppBar';
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Fab, IconButton, List, ListItem, ListItemText, TextField, Typography, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React, { useEffect, useRef, useState } from "react";
import { basePageStyle } from '../../styles/styles';
import Footer from '../templates/Footer';
import Header from '../templates/Header';
import NowLoading from '../templates/NowLoading';
import SideMenu from '../templates/SideMenu';
import { useLocation, useNavigate } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';

import awsconfig_generativeai from '../../aws-exports';

interface Message {
    role: "user" | "assistant";
    content: string;
}

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // ...既存のstate...
    const [selectedModel, setSelectedModel] = useState<string>('sonnet'); // デフォルトモデル

    // 利用可能なモデル一覧
    const modelOptions = [
        { value: 'sonnet', label: 'Claude Sonnet 4' },
        { value: 'haiku', label: 'Claude 3 Haiku' },
        // 必要に応じて追加
    ];

    // 初回表示用の情報取得
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "こんにちは！　何かお困りのことはありますか？" },
        // { role: "user", content: "建築業界向けの機密保持契約書作成にあたり、IT業界と異なる点を教えてください。" },
        // { role: "assistant", content: "建築業界は図面や現場写真など視覚的・物理的な資料が多く、IT業界はソースコード、仕様書など電子データが多いです。" },
    ]);
    const [webMessages, setWebMessages] = useState<Message[]>([
        { role: "assistant", content: "こんにちは！　何かお困りのことはありますか？" },
        // { role: "user", content: "建築業界向けの機密保持契約書作成にあたり、IT業界と異なる点を教えてください。" },
        // { role: "assistant", content: "建築業界は図面や現場写真など視覚的・物理的な資料が多く、IT業界はソースコード、仕様書など電子データが多いです。" },
    ]);
    // const [messages, setMessages] = useState<Message[]>([
    //     { role: "assistant", content: "こんにちは！　何かお困りのことはありますか？" },
    //     { role: "user", content: "建築業界向けの機密保持契約書作成にあたり、IT業界と異なる点を教えてください。" },
    //     { role: "assistant", content: "建築業界は図面や現場写真など視覚的・物理的な資料が多く、IT業界はソースコード、仕様書など電子データが多いです。" },
    // ]);
    const [input, setInput] = useState<string>("");
    const [webInput, setWebInput] = useState<string>("");
    const [loadingChat, setLoadingChat] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);

    // スクロール用refを追加
    const webMessagesEndRef = useRef<HTMLDivElement | null>(null);

    // webMessagesが更新されたら一番下までスクロール
    useEffect(() => {
        if (webMessagesEndRef.current) {
            webMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [webMessages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        // setMessages((prevMessages) => [...prevMessages, userMessage]);

        setMessages((prevMessages) => [...prevMessages, userMessage]);

        setInput("");
        // setLoading(true);

        // try {
        //     const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/97c48ad8-c001-7032-d61f-16e38626e74c/messages", {
        //         // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
        //         body: JSON.stringify({ message: 'こんにちは' })
        //     });

        //     const data = await response.json();

        //     // 一番番号が大きいデータを取得
        //     const latestMessage = data.messages.reduce((prev: any, current: any) => {
        //         return prev.number > current.number ? prev : current;
        //     });

        //     const assistantMessage: Message = { role: "assistant", content: latestMessage.content };
        //     setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        //     // const assistantMessage: Message = { role: "assistant", content: data.messages[0].content };
        //     // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        // } catch (error) {
        //     console.error("Error fetching AI response:", error);
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(async () => {
            try {
                // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/cf7e4da0-9417-40a2-bbd9-5b3ce55fdce2/messages", {
                //     // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
                //     method: "GET",
                //     headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
                //     // body: JSON.stringify({ message: input })
                // });

                const response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test/generative-ai", {
                    // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
                    body: JSON.stringify({
                        body: JSON.stringify({ query: input }) // body内にさらにJSON.stringifyを適用
                    }),
                });

                const data = await response.json();
                const body = JSON.parse(data.body);

                // // 一番番号が大きいデータを取得
                // const latestMessage = data.messages.reduce((prev: any, current: any) => {
                //     return prev.number > current.number ? prev : current;
                // });

                const assistantMessage: Message = { role: "assistant", content: body.answer };
                // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
                // タブに応じてレスポンスを追加
                setMessages((prevMessages) => [...prevMessages, assistantMessage]);

                // const assistantMessage: Message = { role: "assistant", content: data.messages[0].content };
                // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            } catch (error) {
                console.error("Error fetching AI response:", error);
            } finally {
                // setLoading(false);
            }
        }, 3000);
    };

    const handleSendWebMessage = async () => {
        if (!webInput.trim()) return;

        const userMessage: Message = { role: "user", content: webInput };
        // setMessages((prevMessages) => [...prevMessages, userMessage]);

        setWebMessages((prevMessages) => [...prevMessages, userMessage]); // Web検索用のメッセージリスト

        setWebInput("");
        // setLoading(true);

        // try {
        //     const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/97c48ad8-c001-7032-d61f-16e38626e74c/messages", {
        //         // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
        //         body: JSON.stringify({ message: 'こんにちは' })
        //     });

        //     const data = await response.json();

        //     // 一番番号が大きいデータを取得
        //     const latestMessage = data.messages.reduce((prev: any, current: any) => {
        //         return prev.number > current.number ? prev : current;
        //     });

        //     const assistantMessage: Message = { role: "assistant", content: latestMessage.content };
        //     setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        //     // const assistantMessage: Message = { role: "assistant", content: data.messages[0].content };
        //     // setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        // } catch (error) {
        //     console.error("Error fetching AI response:", error);
        // } finally {
        //     setLoading(false);
        // }
        // setTimeout(async () => {
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

            console.log("selectedModel:", selectedModel);
            if (selectedModel === 'haiku') {
                response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test3-sonnetv4/chat-v2-haiku", {
                    // const response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test2/chat-v2", {
                    // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
                    body: JSON.stringify({ user_input: webInput }),
                });
                data = await response.json();
                body = JSON.parse(data.body);
            }

            if (selectedModel === 'sonnet') {
                response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test3-sonnetv4/chat-v2", {
                    // const response = await fetch("https://dv1vxqef7b.execute-api.ap-northeast-1.amazonaws.com/test2/chat-v2", {
                    // const response = await fetch("https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...getAuthorizationHeader() },
                    // body: JSON.stringify({
                    //     body: JSON.stringify({ user_input: webInput }) // body内にさらにJSON.stringifyを適用
                    // }),
                    body: JSON.stringify({ user_input: webInput }),
                    // body: JSON.stringify({ user_input: webInput }) // body内にさらにJSON.stringifyを適用
                });
                data = await response.json();
                body = JSON.parse(data.body);
            }

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

    // CognitoのクライアントID
    const clientId = awsconfig_generativeai.Auth.aws_user_pools_web_client_id;

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

    // AuthorizationHeaderを設定する共通関数
    const getAuthorizationHeader = () => {
        const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
        const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`) || '';
        const authorizationToken = `Bearer ${token}`;

        return { 'Authorization': `${authorizationToken}` };
        // return { 'Authorization': `eyJraWQiOiJhMTQ1bWplb0hoSnl3cnErY095OFwvUGtDQkNMakRDSUVMRzlQb2lhWGthaz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5N2M0OGFkOC1jMDAxLTcwMzItZDYxZi0xNmUzODYyNmU3NGMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtbm9ydGhlYXN0LTFfUEF4QWlJTXJCIiwiY29nbml0bzp1c2VybmFtZSI6Ijk3YzQ4YWQ4LWMwMDEtNzAzMi1kNjFmLTE2ZTM4NjI2ZTc0YyIsIm9yaWdpbl9qdGkiOiJlOThjMGU2My1iN2Y5LTQyMjItYmZhYS01NmNkNWE5MmRjMDkiLCJhdWQiOiI2ZzlhaTgxZjJ2cmoxdTJkYWpzb2JuN2plbiIsImV2ZW50X2lkIjoiZDJhZjE0MTgtNmY2Ny00MGRiLWFjN2MtZDE0ZmI5Y2YxZDEyIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NDE2NTMxMjcsImV4cCI6MTc0MjQ0MzE0NywiaWF0IjoxNzQyMzU2NzQ3LCJqdGkiOiIyZjYyMmRlYi02YWQxLTRjYTUtOWFkYS01YWMxYWE0YTBlYjMiLCJlbWFpbCI6ImQuYXJhaUBtaWNyb3MuY28uanAifQ.P7aQ8FBU2tZoJzETC73oLLqsPFy8Y1tu66eSiolZ3JEga-Al1A1Xo30rrrnCIVfeCvw817U5-lui6HztSRYHL8jShSLgcjNQ_JwU72cAJywnJ9zNsF9LyHbE_JRkMXittOOqx0rgAB5hjNekzeBjsHP56s2niAoNRKWaey8X2-KjHGMfhmhWdRysVyZoZ0LM_Fj2FyG7WlW1hR1FuItXVoUaiUydGjuc3T_n9QehgV41XEXQqqmGkZxTNF7Z47JaB4RzHtc4O2bb1quo2hIkT0AQzqvIJLokYlQyJv5sLLiCMnSlcrHU1xXv683X1-wXbzq8T_ofUlhAS5K2oF0uKA` };
        // return { 'Authorization': `eyJraWQiOiJFSWpGaFwvRzVrM1J3SUQ0ZnFvdWVaUUJSdkEwazNUaStacXVianQxQ0djOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhNzk0ZWEwOC05MGYxLTcwYTMtMjEzMS1jN2E2YTNmYjg3OGIiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1ub3J0aGVhc3QtMV9WNzcxenU4aVciLCJjb2duaXRvOnVzZXJuYW1lIjoidXNlciIsIm9yaWdpbl9qdGkiOiI2ZmUwMTJjNi1jZmFmLTQ2NjAtOTU3Ni1kNmYwYTExYWE0YmQiLCJhdWQiOiI2a2sxaWg5cGk3M2lxZ202NWE2cjEzNjYzbiIsImV2ZW50X2lkIjoiODg3ZmI1Y2UtYTliNi00YmIxLWJmNTQtOWI5NDYwNjdjMDIzIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NDQwNzg5MDYsImV4cCI6MTc0NDA4MjUwNiwiaWF0IjoxNzQ0MDc4OTA2LCJqdGkiOiI1Yzk2YjQxZi1mNTVmLTRjOGMtYTFhOC03YzQ5NDY5ZDE3MjkiLCJlbWFpbCI6Im5vcmVwbHlAbWljcm9zLXNvZnR3YXJlLmNvbSJ9.WBswLIEN--P_ohoNAfdniriwk6aE37QMYBngC1EhMTXmW4GiLNzPidIPoJRurR0o1P-pujZyhDV1Y6rzJJz-H2QfCKO8WPzl_TwiFi3O6fGHujlR9htVace2o2qKoN3fP-jJdITE_r6YeqdL_wcvXDafYmXayHbMxSzjKXhKf77Rq7h_i_gRAg2FqlAaeunQPR8JRpzD9E80hFjQDxrqCvbB-VLXaD1fr_idxNIOd5S-Sb_weB852-LmwAjhtgDCAJYo-c2K3UZk2VrvWFW0Je0V6yEVukC4i2tAFP4J2fxhWbYY2xObMiJxiDHjS54qsvHp8vUVT73cx56wfgzxxQ` };
        // return { 'Authorization': `eyJraWQiOiJFSWpGaFwvRzVrM1J3SUQ0ZnFvdWVaUUJSdkEwazNUaStacXVianQxQ0djOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0N2I0N2EzOC0zMGQxLTcwNWUtODU1My0zZDYxOTAzODU4ZTYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1ub3J0aGVhc3QtMV9WNzcxenU4aVciLCJjb2duaXRvOnVzZXJuYW1lIjoidGVzdCIsIm9yaWdpbl9qdGkiOiJjM2UzMTUwNy0zMTc0LTRlNWUtODRiZS1iNTY4Yjc0NGI5YzAiLCJhdWQiOiI2a2sxaWg5cGk3M2lxZ202NWE2cjEzNjYzbiIsImV2ZW50X2lkIjoiMTVmNGE3MTEtOTIyZC00NjQxLWJhZmMtM2UxN2RkYmQ5M2Q1IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NDQwODYwNzcsImV4cCI6MTc0NDA4OTY3NywiaWF0IjoxNzQ0MDg2MDc3LCJqdGkiOiJjNmNiOTg4Ni03ODNmLTRkZDktYjM1Zi1lM2JlMmU4MTVkYjkiLCJlbWFpbCI6ImQuYXJhaUBtaWNyb3MuY28uanAifQ.yUJaMgxS3IsNh-KOnihG4lNMvIEw9MhC797AhdibQaB4Rdgut79mdkTGL9hIRrYyOfTu1PU0N4o14ANzmLLwqxM860ucZYx_9ab4IbwnkKnCilUAp-Y0eWP55XjrXBHhITeg-MbXxLX1L7lsYivgspgaOJCdDKdPmyJnH3Ns80QHAJOGEjcOkOTMoJ3hX6C9_lQaAzEfduj7wYEN6N-E8ggYaMsvhfiYTif85jSw5KGg3ocz3o8XNWYQ3HCJTu--3ELPytt9ZyP-90znq5Zp_WkDGxcb26jR1KUjMSpEcRLQU1TC6BAhkNCwZRM7ZTD93063kGgAe0PJ4WVcOpuaJQ` };
    };

    // 初回レンダー時の処理
    useEffect(() => {
        setLoading(true);

        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        setLoading(false);
    }, []);

    function createData(
        company: string,
        title: string,
        status: string,
        date: string,
    ) {
        return { company, title, status, date };
    }

    const documentInfo = [
        createData('特になし', '', '', ''),
    ];

    function createInfomationData(
        notificationNumber: string,
        level: string,
        note: string,
        startdate: string,
        enddate: string,

    ) {
        return { notificationNumber, level, note, startdate, enddate };
    }

    const infomation = [
        createInfomationData('1', 'インフォメーション', '社内運用開始', '2024年12月', ''),
        createInfomationData('2', 'インフォメーション', '機能アップデート', '2025年05月', ''),
        createInfomationData('3', 'インフォメーション', '正式サービス開始', '2025年09月', ''),
    ];

    // ダイアログを開く関数
    const openDeleteDialog = () => {
        navigate('/documentManagement/register');
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

    const isSideMenuOpen = localStorage.getItem('sideMenuIsOpen') === 'true';

    // モデル選択時のハンドラ
    const handleModelChange = (event: SelectChangeEvent<string>) => {
        setSelectedModel(event.target.value as string);
    };

    return (
        <>
            <Box sx={{ ...basePageStyle }}>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
                    <CssBaseline />
                    <SideMenu />
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }} px={4}>
                            {loading ? (
                                <Box sx={{ position: 'absolute', width: '100%', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1 }}>
                                    <NowLoading />
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', paddingLeft: '1%', paddingRight: '1%' }}>
                                    {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%', height: 'auto' }}>
                                            <img src="/page1.png" alt="Info" style={{ height: 'auto' }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%', height: 'auto' }}>
                                            <img src="/page2.png" alt="Info" style={{ height: 'auto' }} />
                                        </Box>
                                    </Box> */}
                                    {/* <Button variant="contained" color="primary" sx={{ width: '15em', height: '100px', fontWeight: 'bold', fontSize: '1.5em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={openDeleteDialog} >契約書を登録する</Button> */}
                                    {/* <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '40px', marginTop: '50px' }}>
                                        <img src="/info.png" alt="Info" style={{ height: 'auto', marginRight: '10px' }} />
                                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', width: '100%' }}>
                                            契約書に関するお知らせ
                                        </Typography>
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 650, border: '1px solid lightgray' }} aria-label="simple table">
                                                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '30%', paddingTop: '10px', paddingBottom: '10px' }}>相手方企業名</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '35%', paddingTop: '10px', paddingBottom: '10px' }}>契約書名</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '20%', paddingTop: '10px', paddingBottom: '10px' }}>ステータス</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '15%', paddingTop: '10px', paddingBottom: '10px' }}>対応期日</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {documentInfo.map((row) => (
                                                        <TableRow key={row.company} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell component="th" scope="row" sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.company}</TableCell>
                                                            <TableCell sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.title}</TableCell>
                                                            <TableCell sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.status}</TableCell>
                                                            <TableCell sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.date}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box> */}
                                    {/* <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '20px' }}>
                                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', width: '100%' }}>
                                            ブロックチェーン電子契約からのお知らせ
                                        </Typography>
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 650, border: '1px solid lightgray' }} aria-label="simple table">
                                                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '5%', paddingTop: '10px', paddingBottom: '10px' }}>No</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '15%', paddingTop: '10px', paddingBottom: '10px' }}>通知レベル</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '40%', paddingTop: '10px', paddingBottom: '10px' }}>お知らせ内容</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '20%', paddingTop: '10px', paddingBottom: '10px' }}>開始日時</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '20px', width: '20%', paddingTop: '10px', paddingBottom: '10px' }}>終了日時</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {infomation.map((row) => (
                                                        <TableRow key={row.notificationNumber} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell component="th" scope="row" sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.notificationNumber}</TableCell>
                                                            <TableCell sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.level}</TableCell>
                                                            <TableCell sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.note}</TableCell>
                                                            <TableCell sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.startdate}</TableCell>
                                                            <TableCell sx={{ fontSize: '16px', paddingTop: '15px', paddingBottom: '15px' }}>{row.enddate}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box> */}
                                    {/* 生成AI機能（チャット） */}
                                    <Fab
                                        color="primary"
                                        ria-label="chat"
                                        onClick={() => setOpen(prev => !prev)} // クリックでトグル
                                        style={{ position: "fixed", bottom: 40, right: 20 }}
                                    >
                                        <ChatIcon />
                                    </Fab>
                                    {open && (
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
                                                契約業務支援AIチャット
                                                <IconButton
                                                    onClick={() => setOpen(false)}
                                                    sx={{
                                                        position: "absolute",
                                                        right: 8,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        backgroundColor: 'transparent',
                                                        '&:hover': { backgroundColor: 'transparent' },
                                                    }}
                                                >
                                                    <CloseIcon sx={{ color: 'white' }} />
                                                </IconButton>
                                            </Typography>
                                            {/* <Typography variant="h6" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: 'darkblue', color: 'white', paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                                                契約業務支援AIチャット
                                                <IconButton
                                                    onClick={() => setOpen(false)}
                                                    sx={{
                                                        backgroundColor: 'transparent', // 背景を透明に設定
                                                        '&:hover': {
                                                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                                                        },
                                                    }}
                                                >
                                                    <CloseIcon sx={{ color: 'white' }} />
                                                </IconButton>
                                            </Typography> */}
                                            {/* <Box sx={{ width: '100%', justifyContent: 'flex-end', display: 'flex' }}>
                                                <Box sx={{ width: '30%', justifyContent: 'flex-end', display: 'flex' }}>
                                                    <AppBar position="static">
                                                        <Tabs
                                                            value={tabValue}
                                                            onChange={handleChange}
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
                                                            <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Web検索</Typography>}
                                                                {...a11yProps(0)}
                                                            />
                                                            <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>社内文書検索(RAG)</Typography>}
                                                                {...a11yProps(1)}
                                                            />
                                                            <Tab label={<Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>専門的な情報</Typography>}
                                                                {...a11yProps(2)}
                                                            />
                                                        </Tabs>
                                                    </AppBar>
                                                </Box>
                                            </Box> */}
                                            {/* ▼ モデル選択プルダウンを追加 */}
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
                                                            {/* <List style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", borderRadius: "4px", padding: "10px", backgroundColor: "white" }}> */}
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
                                            {tabValue === 1 && (
                                                <>
                                                    <Box sx={{ width: '100%', flex: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '10px', backgroundColor: 'white' }}>
                                                        <List>
                                                            {/* <List style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", borderRadius: "4px", padding: "10px", backgroundColor: "white" }}> */}
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
                                            )}
                                        </Paper>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Footer />
        </>
    );
}

export default HomePage;