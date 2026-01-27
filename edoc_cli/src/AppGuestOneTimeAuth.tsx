import { Box, DialogTitle } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import "amazon-cognito-passwordless-auth/passwordless.css";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';
import Footer from './components/guest/common/Footer';
import Header from './components/guest/common/Header';
import awsconfig from './aws-exports';

const region = awsconfig.GuestOneTimeAuth.region;
const userPoolId = awsconfig.GuestOneTimeAuth.aws_user_pools_id;
const clientId = awsconfig.GuestOneTimeAuth.aws_user_pools_web_client_id;
const secretKey = awsconfig.GuestOneTimeAuth.secret_key;

const LOGIN_STATE_LOADING = 'loading';

/***
 * 
 * ゲストユーザー向け MagicLinkリクエストページ
 * 最初に送信されたメールから資格情報をチェックする
 * ※有効期限：10日間（TODO：社内リリース版対応のため、製品リリース版では修正する）
 * 
 */
const AppGuestOneTimeAuth: React.FC = () => {
    const location = useLocation();
    const [status, setStatus] = useState(LOGIN_STATE_LOADING);

    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(false);

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

        // パラメータが不足している場合はエラー
        if (!token || !username || !userid || !registerdata || !expirationtime) {
            setErrorProcess('リクエストが無効です');
            setIsInValidLogin(true);
            setIsLoading(true);
            return;
        }

        // registerdataをBase64でデコード
        const decodedRegisterData = atob(registerdata);

        // デコードしたデータをsecretKeyと比較
        if (decodedRegisterData !== secretKey) {
            setErrorProcess('認証情報が無効です');
            setIsInValidLogin(true);
            setIsLoading(true);
            return;
        }

        // 有効期限をチェック
        // 現在時刻を超過していた場合はエラーとする
        const expirationTime = new Date(parseInt(expirationtime, 10) * 1000);
        const currentTime = new Date();
        if (currentTime > expirationTime) {
            setErrorProcess('リクエストの有効期限が切れています');
            setIsInValidLogin(true);
            setIsLoading(true);
            return;
        }

        // 認証処理を行う
        const fetchSession = async () => {
            try {
                const session = await initiateCustomAuth(username);
                if (session.status !== 200) {
                    setErrorProcess('認証処理が失敗しました');
                    setIsInValidLogin(true);
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
            } catch (error) {
                setErrorProcess('認証処理が失敗しました');
                setIsInValidLogin(true);
            } finally {
                setIsLoading(true);
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
                USERNAME: username
            },
        };

        const headers = {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        };

        // Cognitoユーザープールにリクエストを送信


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

    if (!isLoading) {
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
        if (!isInValidLogin) {
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
                                            契約書へのアクセスリンクを送信しました。<br />
                                            メールをご確認ください。
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
                                            エラーコード: {errorCode}<br />
                                            処理: {errorProcess}
                                        </DialogTitle>

                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Footer />
                </>
            );
        }
    };
}

export default AppGuestOneTimeAuth;
