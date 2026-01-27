import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from 'react';
import { BasicTableForMail } from "../components/templates/CustomMaterialReactTable";
import CustomerApproveFlowCompleteMail from './userMail/CustomerApproveFlowCompleteMail';
import CustomerApproveFlowCompleteMail_guest from './guestMail/CustomerApproveFlowCompleteMail';
import ApproveRequestMail from './guestMail/ApproveRequestMail';
import AuthCodeMail from './guestMail/AuthCodeMail';
import RemandRequestMail_Discard from './guestMail/RemandRequestMail_Discard';
import RemandRequestMail_UrlReissue from './guestMail/RemandRequestMail_UrlReissue';
import RemandRequestMail_UrlReissueNotification from './guestMail/RemandRequestMail_UrlReissueNotification';
import ApproveCompleteMail from './guestMail/ApproveCompleteMail';
import Header from './template/Header';
import SideMenu from './template/SideMenu';

// データの型定義
type MailData = {
    from: string;
    title: string;
    date: string;
    status: string;
};

const MailBoxGuest: React.FC = () => {

    // 初回レンダー時の処理
    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);
    }, []);

    const columns = [
        {
            accessorKey: 'from',
            header: '差出人',
            size: 160,
        },
        {
            accessorKey: 'title',
            header: '件名',
            size: 160,
        },
        {
            accessorKey: 'date',
            header: '日時',
            size: 40,
        },
    ];

    function createData(
        from: string,
        title: string,
        date: string,
        status: string,
    ): MailData {
        return { from, title, date, status };
    }

    const rows = [
        createData('ブロックチェーン電子契約（送信者：株式会社ミクロスソフトウエア　山本和彦）', '【承認依頼】ブロックチェーン電子契約 秘密保持契約書', '2025/04/01 16:00', 'customerApprovalRequest'),
        // createData('ブロックチェーン電子契約（送信者：システム管理者）', '【認証パスコード】ブロックチェーン電子契約 秘密保持契約書', '2024/10/18 14:00', 'customerApprovalRequest_authCode'),
        // createData('ブロックチェーン電子契約（送信者：株式会社ブロックチェーン電子契約　山崎大輔）', '【差戻依頼：破棄】ブロックチェーン電子契約 秘密保持契約書', '2024/10/18 15:00', 'customerRemandRequest_discard'),
        // createData('ブロックチェーン電子契約（送信者：株式会社ブロックチェーン電子契約　山崎大輔）', '【差戻依頼：URL再発行依頼】ブロックチェーン電子契約 秘密保持契約書', '2024/10/18 16:00', 'customerRemandRequest_urlReissue'),
        // createData('ブロックチェーン電子契約（送信者：株式会社ブロックチェーン電子契約　鈴木浩）', '【差戻依頼：URL再発行通知】ブロックチェーン電子契約 秘密保持契約書', '2024/10/18 17:00', 'customerRemandRequest_urlReissueNotification'),
        // createData('ブロックチェーン電子契約（送信者：システム管理者）', '【締結通知】ブロックチェーン電子契約 秘密保持契約書', '2025/04/01 17:00', 'agreementConclude'),
        createData('ブロックチェーン電子契約（送信者：システム管理者）', '【契約書ダウンロードリンク通知】ブロックチェーン電子契約 秘密保持契約書', '2025/04/01 18:00', 'agreementConclude_downloadLink'),
        // createData('ブロックチェーン電子契約（送信者：システム管理者）', '【契約書ダウンロード　認証パスコード】ブロックチェーン電子契約 秘密保持契約書', '2024/10/21 11:00', 'agreementConclude_downloadLink_authCode'),
    ];

    const [selectedMail, setSelectedMail] = useState<MailData | null>(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    const handleRowClick = (row: any) => {
        setSelectedMail(row.original);
        setSelectedRowIndex(row.index);
    };

    return (
        <Box sx={{ bgcolor: 'grey.200', minHeight: '100vh', paddingTop: '80px', paddingBottom: '10px' }}>
            <Header />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CssBaseline />
                <SideMenu />
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '90vh' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }} px={4}>
                        <Typography sx={{ backgroundColor: '#0D47A1', paddingLeft: '10px', paddingTop: '4px', color: 'white', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', width: '100%' }}>
                            受信トレイ
                        </Typography>
                        <Box sx={{ border: '1px solid #0D47A1', width: '100%', marginBottom: '2px', overflowY: 'auto', minHeight: '250px', maxHeight: '250px' }}>
                            <BasicTableForMail
                                columns={columns}
                                data={rows}
                                handleRowClick={handleRowClick}
                                selectedRowIndex={selectedRowIndex}
                            />
                        </Box>
                        <Box sx={{ border: '1px solid #0D47A1', width: '100%', marginBottom: '2px', overflowY: 'auto', height: '80%' }}>
                            {selectedMail !== null ? (
                                selectedMail.status === 'customerApprovalRequest' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <ApproveRequestMail />
                                        </Box>
                                    </Box>
                                ) : selectedMail.status === 'customerApprovalRequest_authCode' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <AuthCodeMail />
                                        </Box>
                                    </Box>
                                ) : selectedMail.status === 'customerRemandRequest_discard' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <RemandRequestMail_Discard />
                                        </Box>
                                    </Box>
                                ) : selectedMail.status === 'customerRemandRequest_urlReissue' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <RemandRequestMail_UrlReissue />
                                        </Box>
                                    </Box>
                                ) : selectedMail.status === 'customerRemandRequest_urlReissueNotification' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <RemandRequestMail_UrlReissueNotification />
                                        </Box>
                                    </Box>
                                ) : selectedMail.status === 'agreementConclude' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <ApproveCompleteMail />
                                        </Box>
                                    </Box>
                                ) : selectedMail.status === 'agreementConclude_downloadLink' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <CustomerApproveFlowCompleteMail_guest />
                                        </Box>
                                    </Box>
                                ) : selectedMail.status === 'agreementConclude_downloadLink_authCode' ? (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                        <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <CustomerApproveFlowCompleteMail />
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                    </Box>
                                )
                            ) : (
                                <Box sx={{ bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', border: '1px solid #0D47A1' }} px={4}>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default MailBoxGuest;