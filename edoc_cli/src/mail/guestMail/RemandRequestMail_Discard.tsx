import { Box, Button, Typography } from "@mui/material";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const RemandRequestMail_Discard = () => {
    const [viewData, setViewData] = useState('acde070d-8c4c-4f0d-9d8a-162843c10333');

    const navigate = useNavigate();

    // 承認フロー開始要求
    const openDocument = () => {
        localStorage.setItem('mailLoginStatus', 'approvalRequest');
        navigate('/mail/guestLogin/issuePasscode', { state: viewData })
    };
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '5px', paddingBottom: '5px' }}>
            <Box sx={{ bgcolor: 'grey.200', justifyContent: 'center', paddingLeft: '20px', paddingTop: '20px', paddingRight: '20px', marginLeft: '25%', marginRight: '25%', border: '5px solid #0D47A1' }}>
                <Box bgcolor="white" sx={{ width: '100%', height: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
                    <Box sx={{ width: '100%' }}></Box>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.5em' }}>
                        山本和彦様から差戻し要求が届きました。
                    </Typography>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '30px', color: '#0D47A1' }}>
                        ブロックチェーン電子契約 秘密保持契約書
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', marginBottom: '20px' }}>
                        <Button variant='contained' size='large' onClick={openDocument} style={{ margin: '10px', borderRadius: '20px' }}>書類を確認する</Button>
                    </Box>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', marginBottom: '20px' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                            URL有効期限：2025年4月11日（金）14時30分<br />
                        </Typography>
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '3px solid lightgrey' }}>
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingTop: '30px', paddingBottom: '30px' }}>
                            有効期限が過ぎてしまった場合は送信者に再送信を依頼してください。<br />
                            最終版の契約書は、全ての関係者による承認がなされたらダウンロード可能になります。
                        </Box>
                    </Box>
                    <Box sx={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', borderTop: '3px solid lightgrey' }}>
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingTop: '30px', paddingBottom: '30px' }}>
                            本メールは送信専用ですので、ご返答いただいてもお答えする事は出来ません。
                        </Box>
                    </Box>
                </Box>
                <Typography className="registerTitle" sx={{ fontSize: '0.7em', paddingTop: '2px', paddingBottom: '2px' }}>
                    Copyright © 2025, MICROS SOFTWARE, Inc. All Rights Reserved.
                </Typography>
            </Box>
        </Box >
    );
};

export default RemandRequestMail_Discard;