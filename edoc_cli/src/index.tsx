import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import "amazon-cognito-passwordless-auth/passwordless.css";
import { Amplify } from 'aws-amplify';
import { I18n } from '@aws-amplify/core';
import { ThemeProvider, defaultTheme } from '@aws-amplify/ui-react';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import AppGuest from './AppGuest';
import AppGuestOneTimeAuth from './AppGuestOneTimeAuth';
import awsconfig from './aws-exports';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { store } from './store/store';
import { Box, Typography } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import { TextSizeProvider } from './contexts/TextSizeContext';
// import backgloundImage from './backgloundImage.png';

// MSW起動用の非同期関数
async function enableMocking(): Promise<void> {
    if (process.env.REACT_APP_SKIP_AUTH !== 'true') {
        return;
    }
    const { worker } = require('./mocks/browser');
    await worker.start({
        onUnhandledRequest: 'bypass', // モック未定義のリクエストはそのまま通す
    });
    console.log('[MSW] Mock Service Worker started for auth-skip mode');
}

// Amplify UIの日本語化
I18n.putVocabulariesForLanguage('ja', {
    'Sign In': 'サインイン',
    'Sign in': 'サインイン',
    'Sign Out': 'サインアウト',
    'Username': 'ユーザー名',
    'Password': 'パスワード',
    'Enter your Username': 'ユーザー名を入力してください',
    'Enter your Password': 'パスワードを入力してください',
    'Enter your username': 'ユーザー名を入力',
    'Enter your password': 'パスワードを入力',
    'Forgot your password?': 'パスワードをお忘れですか？',
    'Reset Password': 'パスワードをリセット',
    'Send code': 'コードを送信',
    'Back to Sign In': 'サインインに戻る',
    'Confirmation Code': '認証コード',
    'Enter your code': '認証コードを入力してください',
    'Confirm': '確認',
    'Submit': '送信',
    'New password': '新しいパスワード',
    'Enter your new password': '新しいパスワードを入力してください',
    'Confirm TOTP Code': 'TOTPコードの入力',
    'Code': 'コード',
    'Code *': ' ',
    'Change Password': 'パスワード変更',
    'Password must have at least 8 characters': 'パスワードは8文字以上である必要があります',
    'Confirm Password': 'パスワードの確認',
    'Please confirm your Password': 'パスワードを確認してください',
    'Passwords must match': 'パスワードが一致しません',
    'Confirm Email Code': 'メール確認コード',
    'Account recovery requires verified contact information': 'アカウントの回復には確認済みの連絡先情報が必要です',
    // 必要に応じて他の語句も追加
});
I18n.setLanguage('ja');

const backgroundStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // background: `url(${backgloundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
    backgroundColor: '#f0f4f8', // 画像が読み込まれない場合の背景色
};


const RootComponent: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === 'logout') {
                // ログアウト処理
                window.location.href = '/login';
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // const { route } = useAuthenticator((context) => [context.route]);

    // function BackgroundIfSignIn() {
    //     const { route } = useAuthenticator((c) => ({ route: c.route }));
    //     return route === 'signIn' ? <div style={backgroundStyle} /> : <></>;
    //   }

    /**
     * 
     * ゲストユーザー向けアプリケーション
     *  
     */
    if (location.pathname.includes('guest')) {
        // ワンタイムパスワード発行
        if (location.pathname.includes('onetimeauth')) {
            return (
                <AppGuestOneTimeAuth />
            );
        }
        // ゲストユーザーログイン
        return (
            <AppGuest />
        );
    }

    /**
     *
     * 正規ユーザー向けアプリケーション
     *
     */
    Amplify.configure(awsconfig.Auth);

    // 認証スキップモード（開発用）
    // .env に REACT_APP_SKIP_AUTH=true を設定すると認証をスキップ
    if (process.env.REACT_APP_SKIP_AUTH === 'true') {
        return <App />;
    }

    return (
        <ThemeProvider
            theme={{
                ...defaultTheme,
                name: 'custom-theme',
                tokens: {
                    colors: {
                        background: { primary: { value: '#f0f4f8' } }
                    }
                }
            }}
        >
            {/* <div style={backgroundStyle}> */}
            <Authenticator
                hideSignUp
                components={{
                    Header() {
                        return (

                            // <div style={{ textAlign: 'center' }}>
                            <>
                                <Box sx={{ textAlign: 'center', marginBottom: '100px' }}>
                                    <Box sx={{ position: 'absolute', right: 0, left: 0, backgroundColor: '#002060', marginBottom: '100px' }}>
                                        <Typography
                                            variant="h5"
                                            noWrap
                                            sx={{ flexGrow: 1, color: 'white', paddingTop: '10px', paddingBottom: '10px' }}
                                            component="div"
                                            align='center'
                                            fontSize='1.5rem'
                                            fontWeight='bold'
                                        >
                                            ブロックチェーン電子契約
                                        </Typography>
                                    </Box>
                                    {/* <Box sx={{ position: 'absolute', right: 0, left: 0, marginTop: '100px', marginBottom: '100px' }}>
                                        <Typography
                                            variant="h5"
                                            noWrap
                                            sx={{ flexGrow: 1, paddingTop: '10px', paddingBottom: '10px' }}
                                            component="div"
                                            align='center'
                                            fontSize='1.5rem'
                                            fontWeight='bold'
                                        >
                                            ログインアカウントをお持ちではない場合は、管理者にお問い合わせください。
                                        </Typography>
                                    </Box> */}
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <Typography
                                        variant="h5"
                                        noWrap
                                        sx={{ flexGrow: 1, marginBottom: '100px', width: '100%' }}
                                        component="div"
                                        align='center'
                                        fontSize='1.5rem'
                                        fontWeight='bold'
                                    >
                                    </Typography>
                                    <div style={{ textAlign: 'center' }}>

                                        {/* <img src="/logo.png" alt="ロゴ" style={{ width: 120 }} /> */}
                                    </div>
                                </Box>
                            </>
                        );
                    },
                    Footer() {
                        return (
                            <Box sx={{ position: 'fixed', right: 0, left: 0, width: '100%', backgroundColor: 'darkblue', bottom: 0 }}>
                                <footer style={{
                                    color: 'white',
                                    backgroundColor: '#002060',
                                    position: 'relative',
                                    bottom: 0,
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Typography sx={{ fontSize: '11px' }}>
                                        Copyright © 2025, MICROS SOFTWARE, Inc. All Rights Reserved.
                                    </Typography>
                                </footer>
                            </Box>
                        );
                    }
                }}
            formFields={{
                confirmSignIn: {
                    confirmation_code: {
                        label: '認証コードを入力してください',
                        placeholder: '認証コード',
                        isRequired: true,
                        type: 'code',
                    }
                }
            }}
            >
                {/* {({ user }) => (
                    // 認証済みのときだけアプリを描画。未認証のときは何も返さない
                    user ? <App /> : <></>
                )} */}
                {({ signOut, user }) => {
                    // 認証済みかどうかは user の有無で判定
                    // return user ? <App /> : <div style={backgroundStyle} />;
                    return user ? <App /> : <div style={backgroundStyle} />;
                }}
                {/* {({ signOut, user }) => {
                    // デバッグ用: 認証状態をコンソールに出力
                    console.log('Authenticator user:', user);
                    if (user) {
                        // challengeNameがMFA関連かどうかを確認
                        // 例: 'SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'CUSTOM_CHALLENGE', 'MFA_SETUP'
                        console.log('challengeName:');
                    }

                    // 画面に状態を表示（デバッグ用）
                    return (
                        <App />
                    );
                }} */}
            </Authenticator>
            {/* </div> */}
        </ThemeProvider>
    );
};

// MSWの起動を待ってからアプリをレンダリング
enableMocking().then(() => {
    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
    );
    root.render(
        <Provider store={store}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                <TextSizeProvider>
                    <BrowserRouter>
                        <RootComponent />
                    </BrowserRouter>
                </TextSizeProvider>
            </MuiThemeProvider>
        </Provider>
    );
    reportWebVitals();
});
