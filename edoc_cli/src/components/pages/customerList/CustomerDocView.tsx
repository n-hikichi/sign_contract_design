import { Stack } from "@mui/material";
import { type MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasicTable } from "../../templates/CustomMaterialReactTable";
import CustomChip from '../common/CustomChip';

interface CustomerPic {
    approver_id: string;
    user_name: string;
    company_name: string;
    position: string;
    email: string;
}

// 書類情報一覧の表の列名を示すインタフェース
interface DocumentListColumns {
    // 書類名
    title: string,
    // 取引担当者名
    customer_pic: CustomerPic;
    // ステータス
    status: string;
};

/**
 * 顧客承認中リスト
 * @returns 書類情報一覧の表
 */
const CustomerDocView = (props: any) => {

    // 表の列を定義
    const columns = useMemo<MRT_ColumnDef<DocumentListColumns>[]>(
        () => [
            {
                accessorKey: 'title',
                header: '件名',
                size: 120,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                }
            },
            {
                accessorKey: 'customer_pic.company_name',
                header: '相手方会社名',
                size: 80,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                }
            },
            {
                accessorKey: 'customer_pic.user_name',
                header: '相手方担当者名',
                size: 50,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                }
            },
            {
                accessorKey: 'status',
                header: 'ステータス',
                size: 40,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                },
                Cell: ({ cell }: { cell: any }) => {
                    const value = cell.getValue();
                    let label = '';
                    switch (value) {
                        case 'CUSTOMER_APPROVING':
                            label = '相手方承認中';
                            break;
                        case 'CUSTOMER_REMANDING':
                            label = '相手方差戻し中';
                            break;
                        default:
                            label = "";
                    }
                    return (
                        <Stack direction="row" spacing={1}>
                            <CustomChip value={value} label={label} />
                        </Stack>
                    );
                }
            },
        ],
        []
    );

    const navigate = useNavigate();
    const handleRowClick = (row: any) => {
        if (row.original.status === 'CUSTOMER_APPROVING') {
            navigate('/documentManagement/customerDocument/checkFileDetails', { state: { record: row.original } });
        } else if (row.original.status === 'CUSTOMER_REMANDING') {
            navigate('/documentManagement/customerDocument/remandDetails', { state: { record: row.original } });
        }
    }

    return (
        <BasicTable
            columns={columns}
            data={props.documentList}
            handleRowClick={handleRowClick}
        />
    )
};

export default CustomerDocView;