import { Box, Button, DialogTitle } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import "amazon-cognito-passwordless-auth/passwordless.css";
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Footer from './components/guest/common/Footer';
import Header from './components/guest/common/Header';
import ApproveCompleteDialogForGuest from './components/guest/ApproveCompleteDialogForGuest';
import ApproveDocumentPageForGuest from './components/guest/ApproveDocumentPageForGuest';
import ConcludeDocumentPageForGuest from './components/guest/ConcludeDocumentPageForGuest';
import RemandRequestCompleteDialog from './components/guest/RemandRequestCompleteDialog';
import GuestTopPage from './components/guest/GuestTopPage';
import LogoutPage from './components/guest/LogoutPage';
import TermsOfUseForGuest from './components/guest/TermsOfUseForGuest';
import awsconfig from './aws-exports';
import axios from 'axios';
import api from './utils/apiAccessor';

const region = awsconfig.GuestPassWordLessAuth.region;
const userPoolId = awsconfig.GuestPassWordLessAuth.aws_user_pools_id;
const clientId = awsconfig.GuestPassWordLessAuth.aws_user_pools_web_client_id;
const secretKey = awsconfig.GuestPassWordLessAuth.secret_key;

const LOGIN_STATE_LOADING = 'loading';

/***
 * 
 * ゲストユーザー向け MagicLinkリクエストページ
 * ユーザーがリクエストしたMagicLinkから資格情報をチェックする
 * ※有効期限：１時間（TODO：社内リリース版対応のため、製品リリース版では修正する）
 * 
 */
const AppGuest: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState(LOGIN_STATE_LOADING);

    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);

    // 検証結果を保持
    const [isInValidLogin, setIsInValidLogin] = useState(false);

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');

    useEffect(() => {
        // URLのクエリパラメータを取得
        const queryParams = new URLSearchParams(location.search);

        // 各クエリパラメータに変換
        const token = queryParams.get('token');
        const username = queryParams.get('username');
        const userid = queryParams.get('userid');
        const registerdata = queryParams.get('registerdata');
        const expirationtime = queryParams.get('expirationtime');
        const documentId = queryParams.get('document');

        // パラメータが不足している場合はエラー
        if (!token || !username || !userid || !registerdata || !expirationtime) {
            setErrorProcess('リクエストが無効です');
            setIsInValidLogin(true);
            setIsLoading(false);
            return;
        }

        // registerdataをBase64でデコード
        const decodedRegisterData = atob(registerdata);

        // デコードしたデータをsecretKeyと比較
        if (decodedRegisterData !== secretKey) {
            setErrorProcess('認証情報が無効です');
            setIsInValidLogin(true);
            setIsLoading(false);
            return;
        }

        // 有効期限をチェック
        // 現在時刻を超過していた場合はエラーとする
        const expirationTime = new Date(parseInt(expirationtime, 10) * 1000);
        const currentTime = new Date();
        if (currentTime > expirationTime) {
            setErrorProcess('リクエストの有効期限が切れています');
            setIsInValidLogin(true);
            setIsLoading(false);
            return;
        }

        const fetchSession = async () => {
            try {
                // カスタム認証開始
                const session = await initiateCustomAuth(username);
                if (session.status !== 200) {
                    setErrorProcess('認証処理が失敗しました');
                    setIsInValidLogin(true);
                    setIsLoading(false);
                    return;
                }

                // カスタム認証のチャレンジ応答送信
                const authResult = await sendCustomChallengeAnswer(username, session.data.Session, registerdata);
                if (authResult.status !== 200) {
                    setErrorProcess('認証処理が失敗しました');
                    setIsInValidLogin(true);
                    setIsLoading(false);
                    return;
                }

                const { AuthenticationResult } = authResult.data;
                const { AccessToken, IdToken, RefreshToken } = AuthenticationResult;

                // トークンをlocalStorageに保存
                localStorage.setItem('accessToken', AccessToken);
                localStorage.setItem('idToken', IdToken);
                localStorage.setItem('refreshToken', RefreshToken);

                // idTokenをAPIの認証情報に設定
                api.setAuthorizationToken(IdToken);

                console.log('Custom challenge successful');

                // 認証成功：契約書IDを次のページに渡す
                navigate('/guest/termsofuse', { state: { documentId } });
            } catch (error) {
                setErrorProcess('認証処理が失敗しました');
                setIsInValidLogin(true);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, []);

    const initiateCustomAuth = async (username: string) => {
        const url = `https://cognito-idp.${region}.amazonaws.com/`;
        const params = {
            AuthFlow: 'CUSTOM_AUTH',
            ClientId: clientId,
            AuthParameters: {
                USERNAME: username,
            },
        };

        const headers = {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        };

        // Cognitoへリクエストを送信
        const response = await axios.post(url, params, { headers });
        return response;
    }

    const sendCustomChallengeAnswer = async (username: string, session: string, challengeAnswer: string) => {
        const url = `https://cognito-idp.${region}.amazonaws.com/`;
        const params = {
            ChallengeName: 'CUSTOM_CHALLENGE',
            ClientId: clientId,
            ChallengeResponses: {
                USERNAME: username,
                ANSWER: challengeAnswer,
            },
            Session: session,
        };

        const headers = {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
        };

        // Cognitoへリクエストを送信
        const response = await axios.post(url, params, { headers });
        return response;
    };

    useEffect(() => {
        // プログラムの外からパスを指定した場合にLogoutPageへ遷移する
        if (!location.pathname.startsWith('/guest')) {
            setIsInValidLogin(false);
        }
    }, [location.pathname]);

    if (isLoading) {
        return (
            <>
                <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                    <Header />
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx={{ width: '70%', paddingBottom: '15%', paddingTop: '15%' }}>
                                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <DialogTitle className="registerTitle" bgcolor="white" sx={{ padding: '40px', fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', marginBottom: '10px' }}>
                                        資格情報を確認しています。<br />
                                        確認が終了するまで、今しばらくお待ちください。
                                    </DialogTitle>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
            </>
        );
    } else {
        if (isInValidLogin) {
            return (
                <>
                    <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                        <Header />
                        <Box sx={{ display: 'flex' }}>
                            <CssBaseline />
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box sx={{ width: '70%', paddingBottom: '15%', paddingTop: '15%' }}>
                                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <DialogTitle className="registerTitle" bgcolor="white" sx={{ padding: '40px', fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', marginBottom: '10px' }}>
                                            認証処理中に予期せぬエラーが発生しました。<br />
                                            {/* エラーコード: {errorCode}<br />
                                        処理: {errorProcess} */}
                                        </DialogTitle>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Footer />
                </>
            );
        } else {
            return (
                <Routes>
                    <Route path='/guest/login' element={<GuestTopPage />} />
                    <Route path='/guest/termsofuse' element={<TermsOfUseForGuest />} />
                    <Route path='/guest/agreement/approvePage' element={<ApproveDocumentPageForGuest />} />
                    <Route path='/guest/agreement/remandComplete' element={<RemandRequestCompleteDialog />} />
                    <Route path='/guest/agreement/approveCompletePage' element={<ApproveCompleteDialogForGuest />} />
                    <Route path='/guest/agreement/concludePage' element={<ConcludeDocumentPageForGuest />} />
                    <Route path='/guest/logout' element={<LogoutPage />} />
                </Routes>
            );
        };
    };
}

export default AppGuest;
