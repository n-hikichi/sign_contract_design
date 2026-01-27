import { Box, Button, CssBaseline, TextField, Typography, IconButton, InputAdornment } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import TopFooter from '../components/templates/TopFooter';
import TopHeader from '../components/templates/TopHeader';
import login from './login';
import { signIn, confirmSignIn } from '@aws-amplify/auth';
import awsconfig from '../aws-exports';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const UserLogin: React.FC<{}> = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [newPasswordRequired, setNewPasswordRequired] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signInResult, setSignInResult] = useState(false);

    // 初回レンダー時の処理
    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

    }, []);

    const { control, handleSubmit, watch, reset, getValues, setValue } = useForm({
        defaultValues: {
            user_name: '',
            password: '',
            old_password: '',
            new_password: '',
            confirm_password: ''
        }
    });

    // 新しいパスワードと確認用パスワードを監視
    const newPassword = watch('new_password');
    const confirmPassword = watch('confirm_password');

    /***
     * 
     * 「確認する」を選択した時の処理
     * 
     */
    // フォームの登録内容を整理し、登録内容確認画面へ遷移する。
    const onSubmit = async (data: any) => {
        try {

            // Cognito認証を行う
            const result = await signIn({
                username: data.user_name,
                password: data.password,
            });

            setValue('password', data.password);

            console.log('ログインに失敗しました。ユーザー名またはパスワードが正しくありません。');
            console.log(result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED');
            setNewPasswordRequired(true);
            // パスワード変更が必要な場合
            if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
                setNewPasswordRequired(true);
                reset({ new_password: '', confirm_password: '' });
            } else {
                // ブラウザのlocalStorageにログイン情報を保存する
                localStorage.setItem('loginInfo', JSON.stringify({ user_name: data.user_name, mail_address: "yamamoto@micros.com" })); // 開発用のテストデータ

                navigate('/');
            }
        } catch (err) {
            console.log('ログインに失敗しました。ユーザー名またはパスワードが正しくありません。');
        }
    }

    const onSubmitNewPassword = async (data: any) => {
        try {
            if (data) {
                // oldPasswordとnewPasswordを一つのオブジェクトにまとめる
                const passwordData = {
                    oldPassword: data.old_password,
                    newPassword: data.new_password
                };

                await confirmSignIn({ 
                    challengeResponse: newPassword 
                  });
                // ブラウザのlocalStorageにログイン情報を保存する
                // localStorage.setItem('loginInfo', JSON.stringify({ user_name: 'test', mail_address: "yamamoto@micros.com" }));

                navigate('/');
            }
        } catch (err) {
            setError('新しいパスワードの設定に失敗しました。');
        }
    };

    const handleClickShowOldPassword = () => setShowOldPassword(!showOldPassword);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <>
            <Box bgcolor='grey.200' sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: '13%', minHeight: 'calc(100vh - 35px)', width: '100%' }}>
                <CssBaseline />
                <TopHeader />
                <Box sx={{ flexGrow: 1, paddingLeft: '25%', paddingRight: '25%' }}>
                    <Box>
                        <Box sx={{ bgcolor: 'white', border: '5px solid #002060', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row' }}>
                                <Box sx={{ width: '100%', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '60px', paddingRight: '60px' }}>
                                    {!newPasswordRequired ? (
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '60px' }}>
                                                <Controller
                                                    name="user_name"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            id="user_name"
                                                            label="ユーザー名"
                                                            variant="standard"
                                                            InputProps={{
                                                                style: { fontWeight: 'bold' }
                                                            }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px', marginTop: '60px' }}>
                                                <Controller
                                                    name="password"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            id="password"
                                                            label="パスワード"
                                                            variant="standard"
                                                            InputProps={{
                                                                style: { fontWeight: 'bold' }
                                                            }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                                                <Button type="submit" variant="contained" color="primary" sx={{ width: '10em', height: '50px', '&:hover': { backgroundColor: 'darkblue' } }}>
                                                    ログイン
                                                </Button>
                                            </Box>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleSubmit(onSubmitNewPassword)}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '60px', marginBottom: '20px' }}>
                                                <Controller
                                                    name="old_password"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            id="old_password"
                                                            label="古いパスワード"
                                                            type={showPassword ? 'text' : 'password'}
                                                            variant="standard"
                                                            InputProps={{
                                                                style: { fontWeight: 'bold' },
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleClickShowPassword}
                                                                            edge="end"
                                                                        >
                                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '60px', marginBottom: '20px' }}>
                                                <Controller
                                                    name="new_password"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            id="new_password"
                                                            label="新しいパスワード"
                                                            type={showPassword ? 'text' : 'password'}
                                                            variant="standard"
                                                            InputProps={{
                                                                style: { fontWeight: 'bold' },
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleClickShowPassword}
                                                                            edge="end"
                                                                        >
                                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px', marginBottom: '20px' }}>
                                                <Controller
                                                    name="confirm_password"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            id="confirm_password"
                                                            label="新しいパスワード（確認用）"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            variant="standard"
                                                            InputProps={{
                                                                style: { fontWeight: 'bold' },
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleClickShowConfirmPassword}
                                                                            edge="end"
                                                                        >
                                                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            {newPassword !== confirmPassword && (
                                                <Typography color="error" sx={{ marginTop: '20px' }}>
                                                    パスワードが一致しません。
                                                </Typography>
                                            )}
                                            {error && <Typography color="error" sx={{ marginBottom: '20px' }}>{error}</Typography>}
                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                                                <Button type="submit" variant="contained" color="primary" sx={{ width: '12em', height: '50px', '&:hover': { backgroundColor: 'darkblue' } }}>
                                                    パスワードを変更
                                                </Button>
                                            </Box>
                                        </form>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <TopFooter />
        </>
    );
}

export default UserLogin;