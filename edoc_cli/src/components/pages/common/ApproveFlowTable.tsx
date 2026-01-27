import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface ApproverInfoForUserProps {
    isAuthorizerAdded: boolean;
    selectedApproverData?: any[];
    user_name?: string;
    position?: string;
    email?: string;
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
const ApproveFlowTable: React.FC<ApproverInfoForUserProps> = ({ isAuthorizerAdded, selectedApproverData, user_name, position, email, }) => {

    const [internalApproverList, setInternalApproverList] = useState<any[]>(selectedApproverData || []);

    useEffect(() => {
        setInternalApproverList(selectedApproverData || []);
    }, [selectedApproverData]);

    const handleMoveInternalApprover = (from: number, to: number) => {
        if (to < 0 || to >= internalApproverList.length) return;
        const updated = [...internalApproverList];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setInternalApproverList(updated);
    };

    const handleDeleteApprover = (index: number) => {
        setInternalApproverList(prev => prev.filter((_, i) => i !== index));
    };

    // 削除
    // const handleDeleteApprover = (index: number) => {
    //     setInternalApproverList(prev => prev.filter((_, i) => i !== index));
    // };

    return (
        <>
            {/* テーブルタイトル */}
            <Paper
                elevation={2}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    backgroundColor: '#f0f0f0',
                    border: '1px solid lightgray',
                    fontWeight: 'bold',
                    mb: 0
                }}
            >
                <Box sx={{ width: 80 }} /> {/* 矢印用スペース */}
                <Box sx={{ flex: 1, textAlign: 'right' }}>氏名</Box>
                <Box sx={{ flex: 1, textAlign: 'right' }}>役職</Box>
                <Box sx={{ flex: 2, textAlign: 'right' }}>メールアドレス</Box>
                <Box sx={{ width: 80 }} />
            </Paper>
            {internalApproverList.map((row, index) => (
                <Paper
                    key={row.email}
                    elevation={1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        backgroundColor: 'white',
                        border: '1px solid lightgray',
                        fontWeight: 'bold',
                        mb: 0
                    }}
                >
                    {/* 上下矢印 */}
                    <Box sx={{ width: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                            size="medium"
                            onClick={() => handleMoveInternalApprover(index, index - 1)}
                            disabled={index === 0}
                            sx={{ backgroundColor: '#ffe0b2', '&:hover': { backgroundColor: '#ffb74d' }, marginRight: '5px', padding: 0 }}
                        >
                            <ArrowUpwardIcon fontSize="medium" />
                        </IconButton>
                        <IconButton
                            size="medium"
                            onClick={() => handleMoveInternalApprover(index, index + 1)}
                            disabled={index === internalApproverList.length - 1}
                            sx={{ backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#90caf9' }, marginRight: '5px', padding: 0 }}
                        >
                            <ArrowDownwardIcon fontSize="medium" />
                        </IconButton>
                        {/* <IconButton
                            size="medium"
                            onClick={() => handleDeleteApprover(index)}
                            sx={{ backgroundColor: '#ffebee', '&:hover': { backgroundColor: '#ffcdd2' }, padding: 0 }}
                        >
                            <DeleteIcon fontSize="medium" />
                        </IconButton> */}
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{row.user_name}</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{row.position}</Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}>{row.email}</Box>
                    <Box sx={{ width: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                            size="medium"
                            onClick={() => handleDeleteApprover(index)}
                            sx={{
                                backgroundColor: '#ffebee',
                                marginLeft: '10px',
                                '&:hover': { backgroundColor: '#ffcdd2' },
                                padding: 0,
                                minHeight: 0,
                                height: '32px',
                                width: '32px',
                                lineHeight: 1,
                                '& .MuiSvgIcon-root': {
                                    padding: 0,
                                    margin: 0,
                                    minHeight: 0,
                                    height: '20px',
                                }
                            }}
                        >
                            <CloseIcon fontSize="medium" />
                        </IconButton>
                    </Box>
                </Paper>
            ))}
            {/* 代表者行 */}
            {isAuthorizerAdded ? (
                <Paper
                    elevation={1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        backgroundColor: '#fffde7',
                        border: '1px solid orange',
                        fontWeight: 'bold',
                        mb: 0,
                    }}
                >
                    <Box sx={{ width: 80, textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>代表者</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{user_name}</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{position}</Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}>{email}</Box>
                    <Box sx={{ width: 80 }} />
                </Paper>
            ) : (
                <Paper
                    elevation={1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 2,
                        backgroundColor: '#fffde7',
                        border: '1px solid orange',
                        fontWeight: 'bold',
                        mb: 0,
                    }}
                >
                    <Box sx={{ width: 80, textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>代表者</Box>
                    <Box sx={{ flex: 1, textAlign: 'center', color: 'red' }} >
                        登録されていません
                    </Box>
                </Paper>
            )}
        </>
    );
};

interface ApproverInfoForUserWithDeleteButtonProps {
    isAuthorizerAdded: boolean;
    selectedApproverData?: any[];
    user_name?: string;
    position?: string;
    email?: string;
    onChangeApproverList: (list: any[]) => void;
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
export const ApproveFlowTableWithDeleteButton: React.FC<ApproverInfoForUserWithDeleteButtonProps> = ({ isAuthorizerAdded, selectedApproverData = [], user_name, position, email, onChangeApproverList}) => {

    const [internalApproverList, setInternalApproverList] = useState<any[]>(selectedApproverData);

    useEffect(() => {
        setInternalApproverList(selectedApproverData || []);
    }, [selectedApproverData]);

    const handleMoveInternalApprover = (from: number, to: number) => {
        if (to < 0 || to >= internalApproverList.length) return;
        const updated = [...internalApproverList];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        onChangeApproverList(updated);
    };

    const handleDeleteApprover = (index: number) => {
        const updated = selectedApproverData.filter((_, i) => i !== index);
        onChangeApproverList(updated);
    };

    return (
        <>
            {/* テーブルタイトル */}
            <Paper
                elevation={2}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    backgroundColor: '#f0f0f0',
                    border: '1px solid lightgray',
                    fontWeight: 'bold',
                    mb: 0
                }}
            >
                <Box sx={{ width: 80 }} /> {/* 矢印用スペース */}
                <Box sx={{ flex: 1, textAlign: 'right' }}>氏名</Box>
                <Box sx={{ flex: 1, textAlign: 'right' }}>役職</Box>
                <Box sx={{ flex: 2, textAlign: 'right' }}>メールアドレス</Box>
                <Box sx={{ width: 80 }} />
            </Paper>
            {internalApproverList.map((row, index) => (
                <Paper
                    key={row.email}
                    elevation={1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        backgroundColor: 'white',
                        border: '1px solid lightgray',
                        fontWeight: 'bold',
                        mb: 0
                    }}
                >
                    {/* 上下矢印 */}
                    <Box sx={{ width: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                            size="medium"
                            onClick={() => handleMoveInternalApprover(index, index - 1)}
                            disabled={index === 0}
                            sx={{ backgroundColor: '#ffe0b2', '&:hover': { backgroundColor: '#ffb74d' }, marginRight: '5px', padding: 0 }}
                        >
                            <ArrowUpwardIcon fontSize="medium" />
                        </IconButton>
                        <IconButton
                            size="medium"
                            onClick={() => handleMoveInternalApprover(index, index + 1)}
                            disabled={index === internalApproverList.length - 1}
                            sx={{ backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#90caf9' }, marginRight: '5px', padding: 0 }}
                        >
                            <ArrowDownwardIcon fontSize="medium" />
                        </IconButton>
                        {/* <IconButton
                            size="medium"
                            onClick={() => handleDeleteApprover(index)}
                            sx={{ backgroundColor: '#ffebee', '&:hover': { backgroundColor: '#ffcdd2' }, padding: 0 }}
                        >
                            <DeleteIcon fontSize="medium" />
                        </IconButton> */}
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{row.user_name}</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{row.position}</Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}>{row.email}</Box>
                    <Box sx={{ width: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                            size="medium"
                            onClick={() => handleDeleteApprover(index)}
                            sx={{
                                backgroundColor: '#ffebee',
                                marginLeft: '10px',
                                '&:hover': { backgroundColor: '#ffcdd2' },
                                padding: 0,
                                minHeight: 0,
                                height: '32px',
                                width: '32px',
                                lineHeight: 1,
                                '& .MuiSvgIcon-root': {
                                    padding: 0,
                                    margin: 0,
                                    minHeight: 0,
                                    height: '20px',
                                }
                            }}
                        >
                            <CloseIcon fontSize="medium" />
                        </IconButton>
                    </Box>
                </Paper>
            ))}
            {/* 代表者行 */}
            {isAuthorizerAdded ? (
                <Paper
                    elevation={1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        backgroundColor: '#fffde7',
                        border: '1px solid orange',
                        fontWeight: 'bold',
                        mb: 0,
                    }}
                >
                    <Box sx={{ width: 80, textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>代表者</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{user_name}</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{position}</Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}>{email}</Box>
                    <Box sx={{ width: 80 }} />
                </Paper>
            ) : (
                <Paper
                    elevation={1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 2,
                        backgroundColor: '#fffde7',
                        border: '1px solid orange',
                        fontWeight: 'bold',
                        mb: 0,
                    }}
                >
                    <Box sx={{ width: 80, textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>代表者</Box>
                    <Box sx={{ flex: 1, textAlign: 'center', color: 'red' }} >
                        登録されていません
                    </Box>
                </Paper>
            )}
        </>
    );
};

interface AuthorizerTableProps {
    isAuthorizerAdded: boolean;
    user_name?: string;
    position?: string;
    email?: string;
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
export const AuthorizerTable: React.FC<AuthorizerTableProps> = ({ isAuthorizerAdded, user_name, position, email }) => {
    return (
        <>
            <Paper
                elevation={2}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    backgroundColor: '#f0f0f0',
                    border: '1px solid lightgray',
                    fontWeight: 'bold',
                    mb: 0
                }}
            >
                <Box sx={{ width: 80 }} /> {/* 矢印用スペース */}
                <Box sx={{ flex: 1, textAlign: 'right' }}>氏名</Box>
                <Box sx={{ flex: 1, textAlign: 'right' }}>役職</Box>
                <Box sx={{ flex: 2, textAlign: 'right' }}>メールアドレス</Box>
                <Box sx={{ width: 80 }} />
            </Paper>
            {isAuthorizerAdded ? (
                <Paper
                    elevation={1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        backgroundColor: '#fffde7',
                        border: '1px solid orange',
                        fontWeight: 'bold',
                        mb: 0,
                    }}
                >
                    <Box sx={{ width: 80, textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>代表者</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{user_name}</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>{position}</Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}>{email}</Box>
                </Paper>
            ) : (
                <>
                    <Paper
                        elevation={1}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: 2,
                            backgroundColor: '#fffde7',
                            border: '1px solid orange',
                            fontWeight: 'bold',
                            mb: 0,
                        }}
                    >
                        <Box sx={{ width: 80, textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>代表者</Box>
                        <Box sx={{ flex: 1, textAlign: 'center', color: 'red' }} >
                            登録されていません
                        </Box>
                    </Paper>
                </>
            )}
        </>
    );
};

interface WorkFlowProps {
    isApprovalFlow: boolean;
    selectedApproverData?: any[];
    user_name?: string;
    position?: string;
    email?: string;
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
export const WorlFlowTable: React.FC<WorkFlowProps> = ({ isApprovalFlow, selectedApproverData, user_name, position, email }) => {

    const [selectedValuesForInternalApprover, setSelectedValuesForInternalApprover] = useState(selectedApproverData || []);

    const handleMoveInternalApprover = (from: number, to: number) => {
        if (to < 0 || to >= selectedValuesForInternalApprover.length) return;
        const updated = [...selectedValuesForInternalApprover];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setSelectedValuesForInternalApprover(updated);
    };

    useEffect(() => {
        setSelectedValuesForInternalApprover(selectedApproverData || []);
    }, [selectedApproverData]);

    return (
        isApprovalFlow ? (
            <>
                {/* テーブルタイトル */}
                <Paper
                    elevation={2}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        backgroundColor: '#f0f0f0',
                        border: '1px solid lightgray',
                        fontWeight: 'bold',
                        mb: 0
                    }}
                >
                    <Box sx={{ width: 80 }} /> {/* 矢印用スペース */}
                    <Box sx={{ flex: 1, textAlign: 'right' }}>氏名</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>役職</Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}>メールアドレス</Box>
                </Paper>
                {selectedValuesForInternalApprover.map((row, index) => (
                    <Paper
                        key={row.email}
                        elevation={1}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: 0.5,
                            backgroundColor: 'white',
                            border: '1px solid lightgray',
                            fontWeight: 'bold',
                            mb: 0
                        }}
                    >
                        {/* 上下矢印 */}
                        <Box sx={{ width: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton
                                size="medium"
                                onClick={() => index > 0 && handleMoveInternalApprover(index, index - 1)}
                                disabled={index === 0}
                                sx={{ backgroundColor: '#ffe0b2', '&:hover': { backgroundColor: '#ffb74d' }, marginRight: '5px' }}
                            >
                                <ArrowUpwardIcon fontSize="medium" />
                            </IconButton>
                            <IconButton
                                size="medium"
                                onClick={() => index < selectedValuesForInternalApprover.length - 1 && handleMoveInternalApprover(index, index + 1)}
                                disabled={index === selectedValuesForInternalApprover.length - 1}
                                sx={{ backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#90caf9' } }}
                            >
                                <ArrowDownwardIcon fontSize="medium" />
                            </IconButton>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{row.user_name}</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{row.position}</Box>
                        <Box sx={{ flex: 2, textAlign: 'right' }}>{row.email}</Box>
                    </Paper>
                ))}
                {/* 代表者行 */}
                {isApprovalFlow ? (
                    <Paper
                        elevation={1}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: 1.5,
                            backgroundColor: '#fffde7',
                            border: '1px solid orange',
                            fontWeight: 'bold',
                            mb: 0,
                        }}
                    >
                        <Box sx={{ width: 80, textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>代表者</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{user_name}</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{position}</Box>
                        <Box sx={{ flex: 2, textAlign: 'right' }}>{email}</Box>
                    </Paper>
                ) : (
                    <></>
                )}
            </>
        ) : (
            selectedValuesForInternalApprover.length === 0 ? (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: '100px' }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.5em', color: 'darkred' }}>
                        通知先は登録されていません
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* テーブルタイトル */}
                    <Paper
                        elevation={2}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: 1,
                            backgroundColor: '#f0f0f0',
                            border: '1px solid lightgray',
                            fontWeight: 'bold',
                            mb: 0
                        }}
                    >
                        <Box sx={{ flex: 1, textAlign: 'right' }}>氏名</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>役職</Box>
                        <Box sx={{ flex: 2, textAlign: 'right' }}>メールアドレス</Box>
                    </Paper>
                    {selectedValuesForInternalApprover.map((row, index) => (
                        <Paper
                            key={row.email}
                            elevation={1}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 2,
                                py: 0.5,
                                backgroundColor: 'white',
                                border: '1px solid lightgray',
                                fontWeight: 'bold',
                                mb: 0
                            }}
                        >
                            <Box sx={{ flex: 1, textAlign: 'right' }}>{row.user_name}</Box>
                            <Box sx={{ flex: 1, textAlign: 'right' }}>{row.position}</Box>
                            <Box sx={{ flex: 2, textAlign: 'right' }}>{row.email}</Box>
                        </Paper>
                    ))}
                </>
            )
        )
    );
};

interface PreviewWorkFlowProps {
    isApprovalFlow: boolean;
    selectedPreviewData?: any[];
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
export const PreviewWorlFlowTable: React.FC<PreviewWorkFlowProps> = ({ isApprovalFlow, selectedPreviewData }) => {

    return (
        isApprovalFlow ? (
            <>
                {/* テーブルタイトル */}
                <Paper
                    elevation={2}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        backgroundColor: '#f0f0f0',
                        border: '1px solid lightgray',
                        fontWeight: 'bold',
                        mb: 0
                    }}
                >
                    <Box sx={{ flex: 1, textAlign: 'right' }}>承認順番</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>氏名</Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>役職</Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}>メールアドレス</Box>
                </Paper>
                {selectedPreviewData?.map((row, index) => (
                    <Paper
                        key={row.email}
                        elevation={1}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: 0.5,
                            backgroundColor: 'white',
                            border: '1px solid lightgray',
                            fontWeight: 'bold',
                            mb: 0
                        }}
                    >
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{index}</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{row.user_name}</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{row.position}</Box>
                        <Box sx={{ flex: 2, textAlign: 'right' }}>{row.email}</Box>
                    </Paper>
                ))}
            </>
        ) : (
            <>
                {selectedPreviewData?.map((row, index) => (
                    <Paper
                        key={row.email}
                        elevation={1}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            py: 0.5,
                            backgroundColor: 'white',
                            border: '1px solid lightgray',
                            fontWeight: 'bold',
                            mb: 0
                        }}
                    >
                        <Box sx={{ flex: 1, textAlign: 'right' }}>---</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{row.user_name}</Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>{row.position}</Box>
                        <Box sx={{ flex: 2, textAlign: 'right' }}>{row.email}</Box>
                    </Paper>
                ))}
            </>
        )
    );
};

export default ApproveFlowTable;