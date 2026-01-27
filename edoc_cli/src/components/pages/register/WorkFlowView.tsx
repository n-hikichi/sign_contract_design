import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { resendSighUrlDialogStyleConcluded_one } from '../../../styles/styles';
import api from '../../../utils/apiAccessor';
import ApiProcessingDialog, { ApiGetAdditionalDataDialog } from "../../pages/common/ApiProcessingDialog";
import ErrorDialog from '../../pages/common/ErrorDialog';
import SuccessDialog from "../../pages/common/SuccessDialog";
import { BasicTableWithRadio } from "../../templates/CustomMaterialReactTable";

const getTabBgColor = () => {
    return 'darkblue';
};

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

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

// ユーザーロール選択タブ制御（自社）
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
};

// 書類情報一覧の表の列名を示すインタフェース
interface DocumentListColumns {
    // 書類名
    workflow_name: string,
    // 担当者
    pic: string,
    // 代表者
    authorizer: string,
    // 登録日
    // registration_date: string,
    // // 更新日
    // update_date: string,
    // 最終更新日
    last_modified: string,
};

/**
 * 社内承認中リスト
 * @returns 書類情報一覧の表
 */
const WorkFlowView = (props: any) => {

    const [approvalFlowList, setApprovalFlowList] = useState<any[]>(props.approveFlowList || []);

    // 表の列を定義
    const columns = useMemo<MRT_ColumnDef<DocumentListColumns>[]>(
        () => [
            {
                accessorKey: 'workflow_name',
                header: '承認フロー名',
                size: 400,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                }
            },
            {
                accessorKey: 'pic',
                header: '担当者',
                size: 100,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                },
                Cell: ({ cell }: { cell: any }) => cell.getValue()?.user_name || ''
            },
            {
                accessorKey: 'authorizer',
                header: '代表者',
                size: 100,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                },
                Cell: ({ cell }: { cell: any }) => cell.getValue()?.user_name || ''
            },
            // {
            //     accessorKey: 'registration_date',
            //     header: '登録日',
            //     size: 100,
            //     muiTableHeadCellProps: {
            //         sx: {
            //             fontSize: '18px',
            //         }
            //     }
            // },
            // {
            //     accessorKey: 'update_date',
            //     header: '更新日',
            //     size: 100,
            //     muiTableHeadCellProps: {
            //         sx: {
            //             fontSize: '18px',
            //         }
            //     }
            // },
            {
                accessorKey: 'last_modified',
                header: '最終更新日',
                size: 140,
                muiTableHeadCellProps: {
                    sx: { fontSize: '18px' }
                },
                Cell: ({ row }: { row: any }) => {
                    const reg = row.original.registration_date;
                    const upd = row.original.update_date;
                    if (!reg && !upd) return '';
                    const regDate = reg ? new Date(reg) : null;
                    const updDate = upd ? new Date(upd) : null;
                    let latest = regDate;
                    if (updDate && (!regDate || regDate < updDate)) latest = updDate;
                    if (!latest) return '';
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    return `${latest.getFullYear()}-${pad(latest.getMonth() + 1)}-${pad(latest.getDate())} ${pad(latest.getHours())}:${pad(latest.getMinutes())}`;
                },
                sortingFn: (rowA, rowB) => {
                    const getLatest = (row: any) => {
                        const reg = row.original.registration_date;
                        const upd = row.original.update_date;
                        const regDate = reg ? new Date(reg) : null;
                        const updDate = upd ? new Date(upd) : null;
                        // 比較用にタイムスタンプ（number型）を返す
                        if (regDate && updDate) return Math.max(regDate.getTime(), updDate.getTime());
                        if (regDate) return regDate.getTime();
                        if (updDate) return updDate.getTime();
                        return 0;
                    };
                    return getLatest(rowA) - getLatest(rowB); // 降順
                }
            }
        ],
        []
    );

    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [representativeSealImage, setRepresentativeSealImage] = useState<string>('');
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');

    const [approveFlowEditDialogOpen, setApproveFlowEditDialogOpen] = useState(false);

    const [executeApiWaitingDialog, setExecuteApiWaitingDialogOpen] = useState(false);
    const handleExecuteApiWaitingDialogClose = () => setExecuteApiWaitingDialogOpen(false);

    const handleRowClick = async (row: any) => {
        // setSelectedRow(row.original);

        setViewMode('DETAIL');

        await fetchGetApprovalFlowData(row.original);

        setApproveFlowEditDialogOpen(true);
    };



    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);
        // fetchGetApprovalFlowList();

    }, []);

    async function fetchGetApprovalFlowData(selectedRow: any) {

        let workflowListJson;
        let representativeSealJson;

        setExecuteApiWaitingDialogOpen(true);

        try {
            const workflowList = await api.getApprovalFlow(selectedRow.company_id, selectedRow.workflow_id, selectedRow.workflow_type);
            if (workflowList.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + workflowList.status);
            };

            // 取得したユーザー情報を設定する
            workflowListJson = await workflowList.json();
            setSelectedRow(workflowListJson);

            const representativeSeal = await api.getRepresentativeSealImage(selectedRow.company_id, selectedRow.workflow_id);
            if (workflowList.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + workflowList.status);
            };

            representativeSealJson = await representativeSeal.json();
            setRepresentativeSealImage(representativeSealJson.file);
            // console.log('representativeSealJson:' + representativeSealJson);
            // const seal_image = selectedRow.workflow_type;

        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('承認フロー更新処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiWaitingDialogOpen(false);
        };
    };

    /***
     * 
     * API実行中ダイアログ
     * 
     */
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

    /***
     * 
     * API実行成功ダイアログ
     * 
     */
    const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
    const handleExecuteSuccessApiDialogClose = () => setExecuteSuccessApiDialogOpen(false);

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    // 締結済み契約書から新規契約書を作成する
    const createNewAgreementTheme = useTheme();
    const [createNewAgreementValue, setCreateNewAgreementValue] = useState(0);

    const handleCreateNewAgreementValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setCreateNewAgreementValue(newValue);
    };

    // 自社代表印表示ダイアログの開閉状態
    const [representativeSealDialogOpen, setRepresentativeSealDialogOpen] = useState(false);
    const handleRepresentativeSealDialogClose = () => setRepresentativeSealDialogOpen(false);

    const handleSelect = () => {
        props.onSelect({
            ...selectedRow,
            representativeSealImage,
        });
        props.onClose();
    };

    const handleClose = () => {
        props.onClose();
    };

    const handleClosePreviDialog = () => {
        setApproveFlowEditDialogOpen(false);
    };

    return (
        <>
            <Typography sx={{ backgroundColor: 'darkblue', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                {props.companyType === 'INTERNAL' ? '自社承認フロー選択' : '相手方承認フロー選択'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', maxHeight: '700px', marginBottom: '10px', overflowY: 'auto', backgroundColor: 'white' }}>
                    <BasicTableWithRadio
                        columns={columns}
                        data={approvalFlowList || []}
                        handleRowClick={handleRowClick}
                    />
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
                    <Typography sx={{ borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1em', color: 'darkred' }}>
                        承認フローの担当者名と代表者名を表示しています。
                    </Typography>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" onClick={handleClose} sx={{ mt: 1, mr: 1, width: '9em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} >
                        <Typography>閉じる</Typography>
                    </Button>
                </Box>
            </Box>
            {/* 承認フロー選択ダイアログ */}
            <Modal open={approveFlowEditDialogOpen}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh', marginTop: '2.5vh' }}>
                    <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '100%', maxWidth: 'xl', height: '100%' }}>
                        <Box sx={{ marginBottom: '20px' }}>
                            <Typography sx={{ backgroundColor: 'darkblue', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                                この承認フローを利用しますか？
                            </Typography>
                            <Box sx={{ width: '100%', overflowY: 'auto', maxHeight: '750px',borderRadius: '4px' }}>
                                <Box bgcolor="white" sx={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', width: '100%', padding: '20px' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        担当者
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <TextField
                                            value={
                                                selectedRow?.workflow_type === 'INTERNAL'
                                                    ? selectedRow?.internal_pic?.user_name || ' '
                                                    : selectedRow?.workflow_type === 'CUSTOMER'
                                                        ? selectedRow?.customer_pic?.user_name || ' '
                                                        : ' '
                                            }
                                            label="氏名"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                        <TextField
                                            value={
                                                selectedRow?.workflow_type === 'INTERNAL'
                                                    ? selectedRow?.internal_pic?.position || ' '
                                                    : selectedRow?.workflow_type === 'CUSTOMER'
                                                        ? selectedRow?.customer_pic?.position || ' '
                                                        : ' '
                                            }
                                            label="役職"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                        <TextField
                                            value={
                                                selectedRow?.workflow_type === 'INTERNAL'
                                                    ? selectedRow?.internal_pic?.email || ' '
                                                    : selectedRow?.workflow_type === 'CUSTOMER'
                                                        ? selectedRow?.customer_pic?.email || ' '
                                                        : ' '
                                            }
                                            label="メールアドレス"
                                            variant="standard"
                                            sx={readOnlyTextFieldStyle}
                                            disabled={true}
                                        />
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', width: '100%', padding: '20px' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        代表者
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'row', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '70%' }}>
                                            <TextField
                                                value={
                                                    selectedRow?.workflow_type === 'INTERNAL'
                                                        ? selectedRow?.internal_authorizer?.user_name || ' '
                                                        : selectedRow?.workflow_type === 'CUSTOMER'
                                                            ? selectedRow?.customer_authorizer?.user_name || ' '
                                                            : ' '
                                                }
                                                label="氏名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                            <TextField
                                                value={
                                                    selectedRow?.workflow_type === 'INTERNAL'
                                                        ? selectedRow?.internal_authorizer?.position || ' '
                                                        : selectedRow?.workflow_type === 'CUSTOMER'
                                                            ? selectedRow?.customer_authorizer?.position || ' '
                                                            : ' '
                                                }
                                                label="役職"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                            <TextField
                                                value={
                                                    selectedRow?.workflow_type === 'INTERNAL'
                                                        ? selectedRow?.internal_authorizer?.email || ' '
                                                        : selectedRow?.workflow_type === 'CUSTOMER'
                                                            ? selectedRow?.customer_authorizer?.email || ' '
                                                            : ' '
                                                }
                                                label="メールアドレス"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                width: '30%',
                                                minWidth: '180px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '10px',
                                                border: '1px solid lightgray',
                                                borderRadius: '8px',
                                                marginLeft: '20px',
                                                backgroundColor: '#fafafa',
                                                height: '100%'
                                            }}
                                        >
                                            {(selectedRow?.workflow_type === 'INTERNAL'
                                                ? representativeSealImage
                                                : selectedRow?.workflow_type === 'CUSTOMER'
                                                    ? representativeSealImage
                                                    : null) ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '300px' }}>
                                                    <img
                                                        src={
                                                            selectedRow?.workflow_type === 'INTERNAL'
                                                                ? `data:image/png;base64,${representativeSealImage}`
                                                                : selectedRow?.workflow_type === 'CUSTOMER'
                                                                    ? `data:image/png;base64,${representativeSealImage}`
                                                                    : ''
                                                        }
                                                        alt="Uploaded preview"
                                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '5%', width: '90%' }}>
                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                        代表印が登録されていません<br />
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor='white' sx={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', width: '100%', padding: '20px' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        承認フロー
                                    </Typography>
                                    {(selectedRow?.workflow_type === 'INTERNAL'
                                        ? selectedRow?.internal_approver?.length === 0
                                        : selectedRow?.workflow_type === 'CUSTOMER'
                                            ? selectedRow?.customer_approver?.length === 0
                                            : true) ? (
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                承認フローが登録されていません
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ ...getTableHeaderStyle(), width: '15%' }}>承認順番</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {(selectedRow?.workflow_type === 'INTERNAL'
                                                            ? selectedRow?.internal_approver
                                                            : selectedRow?.workflow_type === 'CUSTOMER'
                                                                ? selectedRow?.customer_approver
                                                                : []
                                                        )?.map((row: any, index: any) => (
                                                            <TableRow
                                                                key={index}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {(selectedRow?.workflow_type === 'INTERNAL'
                                                            ? selectedRow?.internal_authorizer
                                                            : selectedRow?.workflow_type === 'CUSTOMER'
                                                                ? selectedRow?.customer_authorizer
                                                                : null
                                                        ) && (
                                                                <TableRow
                                                                    key="authorizer"
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0, bgcolor: 'lightyellow', height: '40px' } }}
                                                                >
                                                                    <TableCell component="th" scope="row" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>
                                                                        {((selectedRow?.workflow_type === 'INTERNAL'
                                                                            ? selectedRow?.internal_approver?.length
                                                                            : selectedRow?.workflow_type === 'CUSTOMER'
                                                                                ? selectedRow?.customer_approver?.length
                                                                                : 0) || 0) + 1}
                                                                    </TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>
                                                                        {(selectedRow?.workflow_type === 'INTERNAL'
                                                                            ? selectedRow?.internal_authorizer?.user_name
                                                                            : selectedRow?.workflow_type === 'CUSTOMER'
                                                                                ? selectedRow?.customer_authorizer?.user_name
                                                                                : '')}
                                                                    </TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>
                                                                        {(selectedRow?.workflow_type === 'INTERNAL'
                                                                            ? selectedRow?.internal_authorizer?.position
                                                                            : selectedRow?.workflow_type === 'CUSTOMER'
                                                                                ? selectedRow?.customer_authorizer?.position
                                                                                : '')}
                                                                    </TableCell>
                                                                    <TableCell align="right" sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>
                                                                        {(selectedRow?.workflow_type === 'INTERNAL'
                                                                            ? selectedRow?.internal_authorizer?.email
                                                                            : selectedRow?.workflow_type === 'CUSTOMER'
                                                                                ? selectedRow?.customer_authorizer?.email
                                                                                : '')}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                                {/* </TabPanel>
                                <TabPanel value={createNewAgreementValue} index={3} dir={createNewAgreementTheme.direction}> */}
                                <Box bgcolor='white' sx={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', width: '100%', padding: '20px' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        通知先
                                    </Typography>
                                    {(selectedRow?.workflow_type === 'INTERNAL'
                                        ? selectedRow?.internal_notifier?.length === 0
                                        : selectedRow?.workflow_type === 'CUSTOMER'
                                            ? selectedRow?.customer_notifier?.length === 0
                                            : true) ? (
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                通知先が登録されていません
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                        <TableRow>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>氏名</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '15%' }}>役職</TableCell>
                                                            <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>メールアドレス</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {(selectedRow?.workflow_type === 'INTERNAL'
                                                            ? selectedRow?.internal_notifier
                                                            : selectedRow?.workflow_type === 'CUSTOMER'
                                                                ? selectedRow?.customer_notifier
                                                                : []
                                                        )?.map((row: any, index: any) => (
                                                            <TableRow
                                                                key={index}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                                {/* </TabPanel> */}
                            </Box>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    bottom: 20,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '20px',
                                }}
                            >
                                <Button onClick={handleClosePreviDialog} color="primary" variant="outlined" sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}>キャンセル</Button>
                                <Button onClick={handleSelect} color="primary" variant="contained" sx={{ width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}>利用する</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>
            {/* 代表印表示ダイアログ */}
            <div>
                <Modal open={representativeSealDialogOpen}>
                    <Box sx={{ ...resendSighUrlDialogStyleConcluded_one, backgroundColor: 'grey.200', position: 'relative', height: '52vh' }}>
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            {selectedRow?.workflow_type === 'INTERNAL' ? '自社代表印' : '相手方代表印'}
                        </Typography>
                        <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray', overflow: 'auto', maxHeight: '70vh' }}>
                            <Box sx={{ backgroundColor: 'white', paddingTop: '20px', marginBottom: '20px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                    <img
                                        src={
                                            selectedRow?.workflow_type === 'INTERNAL'
                                                ? `data:image/png;base64,${selectedRow?.internal_authorizer?.file || ''}`
                                                : selectedRow?.workflow_type === 'CUSTOMER'
                                                    ? `data:image/png;base64,${selectedRow?.customer_authorizer?.file || ''}`
                                                    : ''
                                        }
                                        alt="user"
                                        style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{
                            position: 'fixed',
                            left: 0,
                            bottom: 0,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            zIndex: 1300,
                            marginBottom: '10px'
                        }}>
                            <Button variant="contained" color='success' onClick={handleRepresentativeSealDialogClose} sx={{ width: '10em', margin: '5px', '&:hover': { backgroundColor: 'darkgreen' } }}>閉じる</Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
            <ApiGetAdditionalDataDialog open={executeApiWaitingDialog} handleClose={handleExecuteApiWaitingDialogClose} />
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    )
};

export default WorkFlowView;