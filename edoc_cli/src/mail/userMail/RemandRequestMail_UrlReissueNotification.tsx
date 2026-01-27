import { Box, Button, Typography } from "@mui/material";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const RemandRequestMail_UrlReissueNotification = () => {
    const [viewData, setViewData] = useState('acde070d-8c4c-4f0d-9d8a-162843c10333');

    const navigate = useNavigate();

    // 承認フロー開始要求
    const openDocument = () => {
        localStorage.setItem('mailLoginStatus', 'approvalComplete');
        navigate('/login/authentication', { state: viewData })
    };
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '5px', paddingBottom: '5px' }}>
            <Box sx={{ bgcolor: 'grey.200', justifyContent: 'center', padding: '20px', marginLeft: '25%', marginRight: '25%', border: '5px solid #0D47A1' }}>
                <Box bgcolor="white" sx={{ width: '100%', height: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
                    <Box sx={{ width: '100%' }}></Box>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.5em' }}>
                        URLが再発行されました。<br />
                    </Typography>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '30px', color: '#0D47A1' }}>
                        ブロックチェーン電子契約 秘密保持契約書
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', marginBottom: '40px' }}>
                        <Button variant='contained' size='large' onClick={openDocument} style={{ margin: '10px', borderRadius: '20px' }}>書類を確認する</Button>
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '3px solid lightgrey' }}>
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingTop: '30px', paddingBottom: '30px' }}>
                            電子契約アプリケーションへログインし、承認操作を行ってください。<br />
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

export default RemandRequestMail_UrlReissueNotification;