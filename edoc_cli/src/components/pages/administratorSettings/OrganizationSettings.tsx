import { Box, Grid, TextField, Tabs, Tab, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { basePageStyle } from '../../../styles/styles';
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import MemberManagementView from './MemberManagementView';

/**
 * 
 * ブロックチェーン電子契約の設定管理が出来るページ
 * 例：新規ユーザーの招待、新規アカウントの発行依頼など
 * 
 */
const AccountSettings = () => {
    // 社内承認中リスト画面で選択した契約書の情報を取得する
    const location = useLocation();
    // const { agreementData } = location.state;

    const navigate = useNavigate();
    const [inviteMail, setInviteMail] = useState("");
    const [inviteRole, setInviteRole] = useState("viewer");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // タブ切り替え用のstateを追加
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // 招待メールを送信する
    const sendInviteMail = () => {
        console.log(`Sending invite to ${inviteMail} with role ${inviteRole}`);
    };

    return (
        <>
            <Box sx={{ ...basePageStyle }}>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '10%', paddingRight: '10%', width: '100%' }} px={4}>
                        <Grid container spacing={3}>
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '30px', marginBottom: '10px' }}>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em' }}>
                                    管理者設定
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, marginBottom: '40px' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '5px', marginLeft: '5px', alignItems: 'center' }}>
                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'end' }}>
                                        <Tabs value={tabValue} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
                                            <Tab label="組織設定" sx={{ fontWeight: 'bold', fontSize: '20px' }} />
                                            <Tab label="メンバー管理" sx={{ fontWeight: 'bold', fontSize: '20px' }} />
                                            <Tab label="料金プラン" sx={{ fontWeight: 'bold', fontSize: '20px' }} />
                                            <Tab label="請求先" sx={{ fontWeight: 'bold', fontSize: '20px' }} />
                                        </Tabs>
                                    </Box>
                                </Box>
                                {tabValue === 0 && (
                                    <>
                                        <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px', display: 'flex', flexDirection: 'row', border: '1px solid lightgray', marginBottom: '10px' }}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="ON/OFFボタンを設置する（多要素認証がOFFの場合はパスワード認証のみ）"
                                                        label="多要素認証を要求するON/OFF"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="Authenticatorアプリ／メール認証（多要素認証がONの時に操作できる）"
                                                        label="認証方式"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                <TextField
                                                    value="最大12か月分の履歴をダウンロードできます → 位置づけを検討する（この場所に実装される項目なのかが疑問です）"
                                                    label="監査ログのダウンロード"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box> */}
                                            </Box>
                                        </Box>
                                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%' }}>
                                            <EdocButton text='更新する' variant='contained' handleClick={() => navigate('/documentManagement/register')} />
                                        </Box>
                                    </>
                                )}
                                {tabValue === 1 && (
                                    <>
                                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'start', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', marginRight: '16px', width: '60%' }}>
                                                    <TextField
                                                        value="10ライセンス利用中（残り10ライセンス利用可能）"
                                                        label="ライセンス利用状況"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', marginRight: '16px', width: '50%' }}>
                                                <TextField
                                                    value={inviteMail}
                                                    // label="ブロックチェーン電子契約への招待を送信する"
                                                    variant="standard"
                                                    placeholder="招待するメールアドレスを入力"
                                                    sx={readOnlyTextFieldStyle}
                                                    InputProps={{
                                                        readOnly: false, // placeholderを表示するためにdisabledではなくreadOnlyを使用
                                                    }}
                                                    onChange={e => setInviteMail(e.target.value)}
                                                />
                                                <FormControl variant="standard" sx={{ minWidth: 120, marginLeft: 2 }}>
                                                    <InputLabel id="invite-role-label">権限</InputLabel>
                                                    <Select
                                                        labelId="invite-role-label"
                                                        value={inviteRole}
                                                        onChange={e => setInviteRole(e.target.value)}
                                                        label="権限"
                                                    >
                                                        <MenuItem value="admin">管理者</MenuItem>
                                                        <MenuItem value="general">一般</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <EdocButton text='招待する' variant='contained' handleClick={sendInviteMail} disabled={false} />
                                        </Box>
                                        <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'end', color: 'darkred' }}>
                                            新しいユーザーを招待する場合は、メールアドレスを入力して「招待する」ボタンを押してしてください。
                                        </Typography>
                                        <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'end', color: 'darkred' }}>
                                            このメールアドレスは既に利用されています。別のメールアドレスを入力するか、先に登録済みのアカウント情報を削除してください。
                                        </Typography>
                                        <MemberManagementView companyInfo="" locationMappedData="" userInfo="" />
                                        {/* {<RegisterNewMemberView companyInfo={companyInfo} locationMappedData={locationDataSet} userInfo={userData} />} */}
                                        {/* <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', marginRight: '16px', width: '40%' }}>
                                                <TextField
                                                    value="10ライセンス利用中（残り10ライセンス利用可能）"
                                                    label="ライセンス利用数"
                                                    variant="standard"
                                                    sx={readOnlyTextFieldStyle}
                                                    disabled={true}
                                                />
                                            </Box>
                                            <EdocButton text='ユーザー登録' variant='contained' handleClick={() => navigate('/documentManagement/register')} disabled={false} />
                                        </Box>
                                        <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px', display: 'flex', flexDirection: 'row', border: '1px solid lightgray' }}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="10ライセンス（20ライセンス利用可能）"
                                                        label="ライセンス利用数"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="利用中メンバーリスト"
                                                        label="利用中メンバーリスト"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="パスワード変更"
                                                        label="契約種別"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="ユーザー招待"
                                                        label="自社担当者"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', marginBottom: '20px' }}>
                                                    <EdocButton text='続けて登録する' variant='contained' handleClick={() => navigate('/documentManagement/register')} disabled={false} />
                                                    <EdocButton text='終了する' variant='contained' handleClick={() => navigate('/documentManagement/registerList')} disabled={false} />
                                                </Box>
                                            </Box>
                                        </Box> */}
                                    </>
                                )}
                                {tabValue === 2 && (
                                    <>
                                        <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px', display: 'flex', flexDirection: 'row', border: '1px solid lightgray', marginBottom: '10px' }}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="スタンダード（他のプランと比較する）"
                                                        label="現在のプラン"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="ON"
                                                        label="生成AIサポート機能（ON/OFF）"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="10,000円"
                                                        label="合計利用金額"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="2025年10月01日"
                                                        label="次回請求日"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%' }}>
                                            <EdocButton text='変更する' variant='contained' handleClick={() => navigate('/documentManagement/register')} />
                                        </Box>
                                    </>
                                )}
                                {tabValue === 3 && (
                                    <>
                                        <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px', display: 'flex', flexDirection: 'row', border: '1px solid lightgray', marginBottom: '10px' }}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="株式会社ミクロスソフトウエア"
                                                        label="請求先（宛先）"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="神奈川県..."
                                                        label="請求先（住所）"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="郵送／メール（PDFファイル）"
                                                        label="請求書送付方法"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                    <TextField
                                                        value="山本和彦"
                                                        label="担当者"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        disabled={true}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%' }}>
                                            <EdocButton text='変更する' variant='contained' handleClick={() => navigate('/documentManagement/register')} />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            </Box >
            <Footer />
        </>
    );
};

export default AccountSettings;