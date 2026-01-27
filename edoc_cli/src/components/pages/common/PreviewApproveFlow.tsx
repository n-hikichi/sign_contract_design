import { Box, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as React from 'react';
import StarIcon from '@mui/icons-material/Star';

// 書類情報一覧の表の列名を示すインタフェース
interface ApproveFlowListColumns {
    // 役割
    role: string,
    // 会社名
    company_name: string,
    // ユーザー名
    user_name: string,
    // メールアドレス
    email: string,
    // 役職
    position: string,
};

// 書類情報一覧の表の列名を示すインタフェース
interface NotifierListColumns {
    // 会社名
    company_name: string,
    // ユーザー名
    user_name: string,
    // メールアドレス
    email: string,
    // 役職
    position: string,
};

interface PreviewApproveFlowProps {
    internalApproveFlow: ApproveFlowListColumns[];
    customerApproveFlow: ApproveFlowListColumns[];
}

interface PreviewNotifierListProps {
    internalNotifier: NotifierListColumns[];
    customerNotifier: NotifierListColumns[];
}

// interface PreviewNotifierList {
//     notifier: NotifierListColumns[];
// }

interface PreviewApproveFlowForRegisterProps {
    internalApproveFlow: ApproveFlowListColumns[];
    customerApproveFlow: ApproveFlowListColumns[];
    internalSeal: string;
    customerSeal: string;
}

const getTableHeaderStyle = () => ({
    fontWeight: 'bold',
    fontSize: '20px',
    paddingTop: '10px',
    paddingBottom: '10px'
});

const getTableCellStyle = (row: any) => ({
    fontSize: '16px',
    fontWeight: 'bold',
    color: row.role === '代表者' ? 'darkred' : 'brack',
    paddingTop: '10px',
    paddingBottom: '10px',
});

const PreviewApproveFlow: React.FC<PreviewApproveFlowProps> = ({ internalApproveFlow, customerApproveFlow }) => {

    const internalFlowLength = internalApproveFlow.length;

    return (
        <Box bgcolor='white' sx={{ flexGrow: 1, padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
            <Box>
                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>承認フロー</Typography>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>
                        以下の承認順番に従って各ユーザーに承認依頼を送信します。
                    </Typography>
                </Box>
                <Box>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>承認順番</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '10%' }}>役割</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {internalApproveFlow.map((row: any, index) => (
                                    <TableRow
                                        key={index + internalFlowLength}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                        <TableCell align="right" component="th" scope="row" sx={getTableCellStyle(row)}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {row.role === '代表者' && <StarIcon sx={{ color: 'darkred' }} />}
                                                {`　${row.role}`}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                    </TableRow>
                                ))}
                                {customerApproveFlow.map((row: any, index) => (
                                    <TableRow
                                        key={row.role}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalFlowLength}</TableCell>
                                        <TableCell align="right" component="th" scope="row" sx={getTableCellStyle(row)}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {row.role === '代表者' && <StarIcon sx={{ color: 'darkred' }} />}
                                                {`　${row.role}`}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box sx={{ color: 'darkred', width: '100%', display: 'flex', marginTop: '20px' }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1em' }}>
                        ※各企業の「代表者」による承認もって本契約書は締結となります。
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export const PreviewBeforeStartApproveFlowNotifier: React.FC<PreviewNotifierListProps> = ({ internalNotifier, customerNotifier }) => {

    const internalNotifierLength = internalNotifier.length;
    const customerNotifierLength = customerNotifier.length;

    return (
        <Box bgcolor='white' sx={{ flexGrow: 1, padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
            <Box>
                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '10px' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>本契約の通知先</Typography>
                </Box>
                {(internalNotifierLength == 0 && customerNotifierLength == 0) ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                            登録なし
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                        <TableRow>
                                            <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>No.</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {internalNotifier.map((row: any, index) => (
                                            <TableRow
                                                key={index + internalNotifierLength}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                            </TableRow>
                                        ))}
                                        {customerNotifier.map((row: any, index) => (
                                            <TableRow
                                                key={row.role}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalNotifierLength}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        <Box sx={{ color: 'darkred', width: '100%', display: 'flex', marginTop: '20px' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '1em' }}>
                                ※通知先に登録したユーザーには「自社代表者の承認完了（※自社関係者のみ）」と「相手方代表者の承認完了」の際にメールが送付されます
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export const PreviewApproveFlowWithTab: React.FC<PreviewApproveFlowProps> = ({ internalApproveFlow, customerApproveFlow }) => {

    const internalFlowLength = internalApproveFlow.length;

    return (
        <Box sx={{ width: '90%', marginLeft: '5%', marginRight: '5%' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>
                    以下の承認順番に従って各ユーザーに承認依頼を送信します。
                </Typography>
            </Box>
            <Box>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableRow>
                                <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>承認順番</TableCell>
                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '10%' }}>役割</TableCell>
                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {internalApproveFlow.map((row: any, index) => (
                                <TableRow
                                    key={index + internalFlowLength}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                    <TableCell align="right" component="th" scope="row" sx={getTableCellStyle(row)}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            {row.role === '代表者' && <StarIcon sx={{ color: 'darkred' }} />}
                                            {`　${row.role}`}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                </TableRow>
                            ))}
                            {customerApproveFlow.map((row: any, index) => (
                                <TableRow
                                    key={row.role}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalFlowLength}</TableCell>
                                    <TableCell align="right" component="th" scope="row" sx={getTableCellStyle(row)}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            {row.role === '代表者' && <StarIcon sx={{ color: 'darkred' }} />}
                                            {`　${row.role}`}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Box sx={{ color: 'darkred', width: '100%', display: 'flex', marginTop: '20px' }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1em' }}>
                    ※各企業の「代表者」による承認もって本契約書は締結となります。
                </Typography>
            </Box>
        </Box>
    );
}

export const PreviewBeforeStartApproveFlowNotifierWithTab: React.FC<PreviewNotifierListProps> = ({ internalNotifier, customerNotifier }) => {

    const internalNotifierLength = internalNotifier.length;
    const customerNotifierLength = customerNotifier.length;

    return (
        <Box sx={{ width: '90%', marginLeft: '5%', marginRight: '5%' }}>
            {(internalNotifierLength == 0 && customerNotifierLength == 0) ? (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                        登録なし
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>
                                通知先として登録したユーザーには、「自社代表者」と「相手方代表者」が承認した際にメールが送付されます。
                            </Typography>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                    <TableRow>
                                        <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>No.</TableCell>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {internalNotifier.map((row: any, index) => (
                                        <TableRow
                                            key={index + internalNotifierLength}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                        </TableRow>
                                    ))}
                                    {customerNotifier.map((row: any, index) => (
                                        <TableRow
                                            key={row.role}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalNotifierLength}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            )}
        </Box>
    );
}

export const PreviewApproveFlowForRegister: React.FC<PreviewApproveFlowForRegisterProps> = ({ internalApproveFlow, customerApproveFlow, internalSeal, customerSeal }) => {

    const internalFlowLength = internalApproveFlow.length;

    return (
        <Box bgcolor='white' sx={{ flexGrow: 1, padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
            <Box>
                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>承認フロー</Typography>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>
                        以下の承認順番に従って各ユーザーに承認依頼を送信します。
                    </Typography>
                </Box>
                <Box sx={{ marginBottom: '20px' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>承認順番</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '10%' }}>役割</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                    <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {internalApproveFlow.map((row: any, index) => (
                                    <TableRow
                                        key={index + internalFlowLength}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                        <TableCell align="right" component="th" scope="row" sx={getTableCellStyle(row)}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {row.role === '代表者' && <StarIcon sx={{ color: 'darkred' }} />}
                                                {`　${row.role}`}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                    </TableRow>
                                ))}
                                {customerApproveFlow.map((row: any, index) => (
                                    <TableRow
                                        key={row.role}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalFlowLength}</TableCell>
                                        <TableCell align="right" component="th" scope="row" sx={getTableCellStyle(row)}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {row.role === '代表者' && <StarIcon sx={{ color: 'darkred' }} />}
                                                {`　${row.role}`}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                        <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
                    <Box sx={{ marginRight: '10px', width: '50%' }}>
                        <Box sx={{ bgcolor: 'lightgreen', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px', border: '0.5px solid lightgray' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>自社代表印</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', height: '300px' }}>
                            <img src={`data:image/png;base64,${internalSeal}`} alt="Uploaded preview" style={{ maxWidth: '100%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                        </Box>
                    </Box>
                    <Box sx={{ marginLeft: '10px', width: '50%' }}>
                        <Box sx={{ bgcolor: 'lightyellow', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '5px', border: '0.5px solid lightgray' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>相手方代表印</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', height: '300px' }}>
                            <img src={`data:image/png;base64,${customerSeal}`} alt="Uploaded preview" style={{ maxWidth: '100%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export const PreviewApproveFlow_forNotifier: React.FC<PreviewNotifierListProps> = ({ internalNotifier, customerNotifier }) => {

    const internalNotifierLength = internalNotifier.length;
    const customerNotifierLength = customerNotifier.length;

    return (
        <Box bgcolor='white' sx={{ flexGrow: 1, padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
            <Box>
                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '10px' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>本契約の通知先</Typography>
                </Box>
                {(internalNotifierLength == 0 && customerNotifierLength == 0) ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                            登録なし
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                        <TableRow>
                                            <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>No.</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {internalNotifier.map((row: any, index) => (
                                            <TableRow
                                                key={index + internalNotifierLength}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                            </TableRow>
                                        ))}
                                        {customerNotifier.map((row: any, index) => (
                                            <TableRow
                                                key={row.role}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalNotifierLength}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        <Box sx={{ color: 'darkred', width: '100%', display: 'flex', marginTop: '20px' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '1em' }}>
                                ※通知先に登録したユーザーには「自社代表者の承認完了（※自社関係者のみ）」と「相手方代表者の承認完了」の際にメールが送付されます
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export const ApproveFlowNotifier: React.FC<PreviewNotifierListProps> = ({ internalNotifier, customerNotifier }) => {

    const internalNotifierLength = internalNotifier.length;
    const customerNotifierLength = customerNotifier.length;

    return (
        <Box sx={{ width: '100%' }}>
            {(internalNotifierLength == 0 && customerNotifierLength == 0) ? (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                        登録なし
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                    <TableRow>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '5%' }}>番号</TableCell>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>会社名</TableCell>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                        <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '30%' }}>メールアドレス</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {internalNotifier.map((row: any, index) => (
                                        <TableRow
                                            key={index + internalNotifierLength}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                        </TableRow>
                                    ))}
                                    {customerNotifier.map((row: any, index) => (
                                        <TableRow
                                            key={row.role}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalNotifierLength}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                            <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            )}
        </Box>
    );
};

export const PreviewApproveFlowNotifier: React.FC<PreviewNotifierListProps> = ({ internalNotifier, customerNotifier }) => {

    const internalNotifierLength = internalNotifier.length;
    const customerNotifierLength = customerNotifier.length;

    return (
        <Box bgcolor='white' sx={{ flexGrow: 1, padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
            <Box>
                {(internalNotifierLength == 0 && customerNotifierLength == 0) ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                            登録なし
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 1000, border: '1px solid lightgray' }} aria-label="simple table">
                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                        <TableRow>
                                            <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>No.</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>会社名</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {internalNotifier.map((row: any, index) => (
                                            <TableRow
                                                key={index + internalNotifierLength}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                            </TableRow>
                                        ))}
                                        {customerNotifier.map((row: any, index) => (
                                            <TableRow
                                                key={row.role}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1 + internalNotifierLength}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.company_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        <Box sx={{ color: 'darkred', width: '100%', display: 'flex', marginTop: '20px' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '1em' }}>
                                ※本設定に登録した関係者には「自社代表者の承認完了（※自社関係者のみ）」と「相手方代表者の承認完了」の際にメールが送付されます
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default PreviewApproveFlow;