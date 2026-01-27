import React, { useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, Radio, Typography, IconButton, Tooltip } from '@mui/material';
import { MRT_Localization_JA } from 'material-react-table/locales/ja';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { TableRowProps } from '@mui/material/TableRow';

/**
 * 検索メニュー、ページネーション無し
 */
export const ApproveFlowColumn = ({ data, columns }: { data: any, columns: any }) => (
    <MaterialReactTable
        columns={columns}
        data={data ?? []}
        enableRowSelection={false}
        enableGlobalFilter={false}
        enableFullScreenToggle={false}
        enableDensityToggle={false}
        enableHiding={false}
        enablePagination={false}
        enableFilters={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
    />
);

/**
 * 検索メニュー、ページネーション付き
 */
export const AgreementListColumn = ({ data, columns }: { data: any, columns: any }) => (
    <MaterialReactTable
        columns={columns}
        data={data ?? []}
        enableRowSelection={false}
        enableGlobalFilter={false}
        enableFullScreenToggle={false}
        enableDensityToggle={false}
        enableHiding={false}
        enablePagination={false}
        enableFilters={false}
        enableBottomToolbar={true}
        enableTopToolbar={true}
    />
);

interface BasicTableColumn {
    columns: any[];
    data: any[];
    handleRowClick: (row: any) => void;
}

export const BasicTable: React.FC<BasicTableColumn> = ({ columns, data, handleRowClick }) => {
    return (
        <MaterialReactTable
            columns={columns}
            data={data}
            enableGlobalFilter={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            // enableRowSelection
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: (event) => {
                        handleRowClick(row);
                    },
                    sx: {
                        cursor: 'pointer',
                        height: '50px',
                        minHeight: '50px',
                        padding: '10px 0',
                    }
                })
            }
            muiTableBodyCellProps={{
                sx: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                    padding: '10px',
                    paddingLeft: '15px',
                }
            }}
            muiTableBodyProps={{
                sx: {
                    position: 'relative',
                    height: '40px',
                },
                children: data.length === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            表示するデータがありません
                        </Typography>
                    </Box>
                ) : null, // データがある場合は何も表示しない
            }}
            localization={MRT_Localization_JA}
        />
    )
};

export const BasicTableWithRegistrationDate: React.FC<BasicTableColumn> = ({ columns, data, handleRowClick }) => {
    return (
        <MaterialReactTable
            columns={columns}
            data={data}
            initialState={{
                sorting: [
                    {
                        id: 'registration_date', // ★ 登録日時カラムの accessorKey か id に合わせる
                        desc: true,      // 降順
                    },
                ],
            }}
            enableGlobalFilter={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            // enableRowSelection
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: (event) => {
                        handleRowClick(row);
                    },
                    sx: {
                        cursor: 'pointer',
                        height: '50px',
                        minHeight: '50px',
                        padding: '10px 0',
                    }
                })
            }
            muiTableBodyCellProps={{
                sx: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                    padding: '10px',
                    paddingLeft: '15px',
                }
            }}
            muiTableBodyProps={{
                sx: {
                    position: 'relative',
                    height: '40px',
                },
                children: data.length === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            表示するデータがありません
                        </Typography>
                    </Box>
                ) : null, // データがある場合は何も表示しない
            }}
            localization={MRT_Localization_JA}
        />
    )
};

interface BasicTableWithHighlightColumn {
    columns: any[];
    data: any[];
    handleRowClick: (row: any) => void;
    muiTableBodyRowProps?: (props: { row: any }) => TableRowProps;
}
export const BasicTableWithHighlight: React.FC<BasicTableWithHighlightColumn> = ({ columns, data, handleRowClick, muiTableBodyRowProps }) => {
    return (
        <MaterialReactTable
            columns={columns}
            data={data}
            initialState={{
                sorting: [
                    {
                        id: 'last_modified', // ← ここを修正
                        desc: true,          // 降順
                    },
                ],
            }}
            enableGlobalFilter={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            // enableRowSelection
            // muiTableBodyRowProps={
            //     ({ row }) => ({
            //         onClick: (event) => {
            //             handleRowClick(row);
            //         },
            //         sx: {
            //             cursor: 'pointer',
            //             height: '50px',
            //             minHeight: '50px',
            //             padding: '10px 0',
            //         }
            //     })
            // }
            muiTableBodyRowProps={
                muiTableBodyRowProps
                    ? muiTableBodyRowProps
                    : ({ row }) => ({
                        onClick: (event) => {
                            handleRowClick(row);
                        },
                        sx: {
                            cursor: 'pointer',
                            height: '50px',
                            minHeight: '50px',
                            padding: '10px 0',
                        }
                    })
            }
            muiTableBodyCellProps={{
                sx: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                    padding: '10px',
                    paddingLeft: '15px',
                }
            }}
            muiTableBodyProps={{
                sx: {
                    position: 'relative',
                    height: '40px',
                },
                children: data.length === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            表示するデータがありません
                        </Typography>
                    </Box>
                ) : null, // データがある場合は何も表示しない
            }}
            localization={MRT_Localization_JA}
        />
    )
};

export const BasicTableWithCheckBox: React.FC<BasicTableColumn> = ({ columns, data, handleRowClick }) => {
    return (
        <MaterialReactTable
            columns={columns}
            data={data}
            enableGlobalFilter={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            enableRowSelection
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: (event) => {
                        handleRowClick(row);
                    },
                    sx: {
                        cursor: 'pointer',
                        height: '50px',
                        minHeight: '50px',
                        padding: '10px 0',
                    }
                })
            }
            muiTableBodyCellProps={{
                sx: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                    padding: '10px',
                }
            }}
            muiTableBodyProps={{
                sx: {
                    position: 'relative',
                    height: '40px',
                },
                children: data.length === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            表示するデータがありません
                        </Typography>
                    </Box>
                ) : null, // データがある場合は何も表示しない
            }}
            localization={MRT_Localization_JA}
        />
    )
};

export const BasicTableWithRadio: React.FC<BasicTableColumn> = ({ columns, data, handleRowClick }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    // ラジオボタン用のカラムを先頭に追加
    const columnsWithRadio = [
        {
            id: 'radio',
            header: '',
            size: 30,
            Cell: ({ row }: any) => (
                <Radio
                    checked={selectedRowIndex === row.index}
                    onChange={(e) => {
                        setSelectedRowIndex(row.index);
                        handleRowClick(row);
                    }}
                    value={row.index}
                    inputProps={{ 'aria-label': `select row ${row.index}` }}
                />
            ),
        },
        ...columns,
    ];

    return (
        <MaterialReactTable
            columns={columnsWithRadio}
            data={data}
            initialState={{
                sorting: [
                    {
                        id: 'last_modified', // ← ここを修正
                        desc: true,          // 降順
                    },
                ],
            }}
            enableGlobalFilter={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            // enableRowSelection
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: (event) => {
                        setSelectedRowIndex(row.index);
                        handleRowClick(row);
                    },
                    sx: {
                        cursor: 'pointer',
                        height: '50px',
                        minHeight: '50px',
                        padding: '10px 0',
                        backgroundColor: selectedRowIndex === row.index ? '#E3F2FD' : 'inherit',
                    }
                })
            }
            muiTableBodyCellProps={{
                sx: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                    padding: '10px',
                    backgroundColor: 'white',
                }
            }}
            muiTableBodyProps={{
                sx: {
                    position: 'relative',
                    height: '40px',
                },
                children: data.length === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            表示するデータがありません
                        </Typography>
                    </Box>
                ) : null, // データがある場合は何も表示しない
            }}
            localization={MRT_Localization_JA}
        />
    )
};

interface BasicConcludeUserManagementTableColumn {
    columns: any[];
    data: any[];
    handleRowClick: (row: any) => void;
    handleSendEmailRowClick: (row: any) => void;
    handleDeleteUserRowClick: (row: any) => void;
    // onRowSelectionChange: boolean;
    onRowSelectionChange?: (isMulti: boolean) => void;
}
export const BasicConcludeUserManagementTable: React.FC<BasicConcludeUserManagementTableColumn> = ({
    columns,
    data,
    handleRowClick,
    handleSendEmailRowClick,
    handleDeleteUserRowClick,
    onRowSelectionChange
}) => {
    // 右端アイコン用のカラムを追加
    const columnsWithIcons = [
        ...columns,
        {
            id: 'actions',
            header: '',
            Cell: ({ row }: any) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="URLを発行する">
                        <IconButton
                            size="small"
                            color="success"
                            sx={{
                                backgroundColor: '#FFF8E1', // 淡いオレンジ
                                '&:hover': {
                                    backgroundColor: '#FFE0B2', // ホバー時は少し濃いオレンジ
                                },
                                borderRadius: '8px',
                                marginRight: '10px',
                                padding: '10px',
                            }}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleSendEmailRowClick(row);
                            }}>
                            <SendIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ユーザー情報を削除する">
                        <IconButton
                            size="small"
                            color="error"
                            sx={{
                                backgroundColor: '#FFF8E1', // 淡いオレンジ
                                '&:hover': {
                                    backgroundColor: '#FFE0B2', // ホバー時は少し濃いオレンジ
                                },
                                borderRadius: '8px',
                                marginRight: '30px',
                                padding: '10px',
                            }}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteUserRowClick(row);
                            }}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
            size: 30,
        }
    ];
    return (
        <MaterialReactTable
            columns={columnsWithIcons}
            data={data}
            enableGlobalFilter={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            // enableRowSelection
            // onRowSelectionChange={(selected) => {
            //     setRowSelection(selected); // これがないとチェックが入らない
            //     // 必要なら呼び出し元にも通知
            //     if (typeof onRowSelectionChange === 'function') {
            //         onRowSelectionChange(Object.keys(selected).length > 1);
            //     }
            // }}
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: (event) => {
                        handleRowClick(row);
                    },
                    sx: {
                        cursor: 'pointer',
                        height: '50px',
                        minHeight: '50px',
                        padding: '10px 0',
                    }
                })
            }
            muiTableBodyCellProps={{
                sx: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                    padding: '10px',
                    fontWeight: 'bold',
                    paddingLeft: '20px',
                }
            }}
            muiTableBodyProps={{
                sx: {
                    position: 'relative',
                    height: '40px',
                },
                children: data.length === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            表示するデータがありません
                        </Typography>
                    </Box>
                ) : null, // データがある場合は何も表示しない
            }}
            localization={MRT_Localization_JA}
        />
    )
};

export const BasicTableForConclude: React.FC<BasicTableColumn> = ({ columns, data, handleRowClick }) => {
    return (
        <MaterialReactTable
            columns={columns}
            data={data}
            enableGlobalFilter={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            enableRowSelection
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: (event) => {
                        handleRowClick(row);
                    },
                    sx: {
                        cursor: 'pointer',
                        height: '50px',
                        minHeight: '50px',
                        padding: '10px 0',
                    }
                })
            }
            muiTableBodyCellProps={{
                sx: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                    padding: '10px',
                }
            }}
        />
    )
}

interface SetApproveFlowColumnProps {
    role: string;
    onRowClick: (role: string, row: any) => void;
    userListColumns: any;
    clientList: any;
}

export const SetApproveFlowColumn: React.FC<SetApproveFlowColumnProps> = ({ role, onRowClick, userListColumns, clientList }) => (
    <div style={{ maxHeight: '90%', overflow: 'auto', borderTop: '1px solid black', marginTop: '20px' }}>
        <MaterialReactTable
            columns={userListColumns}
            data={clientList}
            enableRowSelection
            enableGlobalFilter={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableHiding={false}
            enableSelectAll={false}
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: () => onRowClick(role, row)
                })}
        />
    </div>
);

// データの型定義
type MailData = {
    from: string;
    title: string;
    date: string;
    status: string;
};

interface BasicTableColumnForMail {
    columns: any[];
    data: any[];
    handleRowClick: (row: any) => void;
    selectedRowIndex: number | null;
}

export const BasicTableForMail: React.FC<BasicTableColumnForMail> = ({ columns, data, handleRowClick, selectedRowIndex }) => {
    return (
        <MaterialReactTable
            columns={columns}
            data={data}
            enableGlobalFilter={false}
            enableColumnFilters={false}
            enableBottomToolbar={false}
            enableHiding={false}
            enableFullScreenToggle={false}
            enableDensityToggle={false}
            enableColumnResizing
            muiTableBodyRowProps={
                ({ row }) => ({
                    onClick: (event) => {
                        handleRowClick(row);
                    },
                    sx: {
                        cursor: 'pointer',
                        height: '40px',
                        minHeight: '40px',
                        padding: '10px 0',
                        backgroundColor: selectedRowIndex === row.index ? '#0D47A1' : 'inherit',
                        color: selectedRowIndex === row.index ? '#000' : 'inherit',
                        fontWeight: 'bold',
                    }
                })
            }
            muiTableBodyCellProps={
                ({ row }) => ({
                    onClick: (event) => {
                        handleRowClick(row);
                    },
                    sx: {
                        fontSize: '16px',
                        paddingTop: '4px', // ヘッダーセルのパディングを調整
                        paddingBottom: '4px', // ヘッダーセルのパディングを調整
                        paddingLeft: '10px',
                        color: selectedRowIndex === row.index ? 'white' : 'inherit',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap', // テキストを1行に制限
                        overflow: 'hidden', // テキストが溢れた場合に隠す
                        textOverflow: 'ellipsis', // テキストが溢れた場合に省略記号を表示
                    }
                })
            }
            muiToolbarAlertBannerProps={{
                sx: {
                    minHeight: 0, // Toolbarのmin-heightを削除
                }
            }}
            muiTopToolbarProps={{
                sx: {
                    minHeight: 0, // Top Toolbarのmin-heightを削除
                }
            }}
            muiTableHeadCellProps={{
                sx: {
                    fontSize: '16px',
                    backgroundColor: 'grey.200', // ヘッダーの背景色を変更
                    paddingTop: '4px', // ヘッダーセルのパディングを調整
                    paddingBottom: '4px', // ヘッダーセルのパディングを調整
                    paddingLeft: '10px',
                }
            }}
        />
    )
}