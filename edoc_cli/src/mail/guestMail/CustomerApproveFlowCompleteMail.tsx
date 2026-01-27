import { Box, Button, Typography } from "@mui/material";

const senderName = '山本和彦';
const receiverName = '鈴木浩';
const documentName = 'ブロックチェーン電子契約 秘密保持契約書';
// const dosumentLink = 'https://sign-app.micros-software.site/documentManagement/internalDocument/acde070d-8c4c-4f0d-9d8a-162843c10333';
const dosumentLink = 'http://localhost:3000/documentManagement/internalDocument';
const expiredDate = '2025年5月31日（金）14時30分';

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const CustomerApproveFlowCompleteMail = () => {

    // 承認フロー開始要求
    const openDocument = () => {
        localStorage.setItem('mailLoginStatus', 'approvalRequest');
        window.open(dosumentLink, '_blank');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingTop: '5px', paddingBottom: '5px' }}>
            <Box sx={{ bgcolor: 'grey.200', margin: '0 auto', minHeight: '500px', justifyContent: 'center', paddingLeft: '20px', paddingTop: '20px', paddingRight: '20px', width: '600px', border: '5px solid #0D47A1' }}>
                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px', paddingRight: '20px', marginBottom: '20px' }}>
                    <Box sx={{ width: '100%', marginTop: '40px', marginBottom: '60px' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em' }}>
                            ブロックチェーン電子契約
                        </Typography>
                    </Box>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.5em' }}>
                        すべての関係者による承認が完了しました。
                    </Typography>
                    <Typography className="registerTitle" sx={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '30px', color: '#0D47A1' }}>
                        {documentName}
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', marginBottom: '5px' }}>
                        <Button variant='contained' size='large' onClick={openDocument} style={{ margin: '10px', borderRadius: '20px' }}>書類を確認する</Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', marginBottom: '30px' }}>
                        閲覧期限：{expiredDate}
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', borderTop: '3px solid lightgrey' }}>
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingTop: '30px', paddingBottom: '5px', width: '100%' }}>
                            本書は、以下の関係者間による契約書です。
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingBottom: '30px', width: '100%', pl: 2 }}>
                            ・{senderName}<br />
                            ・{receiverName}<br />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingBottom: '30px', width: '100%' }}>
                            上記の「書類を確認する」をクリックしていただき、最終版契約書の確認をお願いします。
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', flexDirection: 'column', marginBottom: '60px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', paddingBottom: '10px' }}>
                        本メールは送信専用です。ご返答いただいてもお答えする事は出来ません。
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between' }}>
                        リンクの閲覧期限が切れている場合は本書の担当者へご連絡ください。
                    </Box>
                </Box>
                <Typography className="registerTitle" sx={{ fontSize: '0.7em', paddingTop: '2px', paddingBottom: '2px', textAlign: 'right', width: '100%', display: 'block' }}>
                    Copyright © 2025, MICROS SOFTWARE, Inc. All Rights Reserved.
                </Typography>
            </Box>
        </Box >
    );
};

export default CustomerApproveFlowCompleteMail;