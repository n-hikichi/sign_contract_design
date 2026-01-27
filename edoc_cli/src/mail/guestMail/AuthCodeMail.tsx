import { Box, Typography } from "@mui/material";

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const AuthCodeMail = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '5px', paddingBottom: '5px' }}>
            <Box sx={{ bgcolor: 'grey.200', justifyContent: 'center', paddingLeft: '20px', paddingTop: '20px', paddingRight: '20px', marginLeft: '25%', marginRight: '25%', border: '5px solid #0D47A1' }}>
                <Box bgcolor="white" sx={{ width: '100%', height: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
                    <Box sx={{ width: '100%' }}></Box>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.5em', marginBottom: '10px' }}>
                        認証コードを発行しました。
                    </Typography>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '30px', bgcolor: 'grey.200', padding: '20px 120px' }}>
                        123456
                    </Typography>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '3px solid lightgrey' }}>
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingTop: '30px', paddingBottom: '30px' }}>
                            本メールの認証コードを入力して契約書にアクセスしてください。<br />
                            認証コードのアクセス期限は10分間です。認証コードの有効期限が切れた場合は再発行してください。
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

export default AuthCodeMail;