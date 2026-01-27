import { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasicTable } from "../../templates/CustomMaterialReactTable";

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
};

/**
 * 契約書一覧表の表示画面
 * @returns 契約書一覧表
 */
const BeforeDocView = (props: any) => {
    const [viewData, setViewData] = useState([]);

    useEffect(() => {
        setViewData(props.documentList);
    }, [props.documentList]);

    // 表の列を定義
    const columns = useMemo<MRT_ColumnDef<DocumentListColumns>[]>(
        () => [
            {
                accessorKey: 'title',
                header: '件名',
                size: 200,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '16px',
                    }
                }
            },
            {
                accessorKey: 'customer_pic.company_name',
                header: '相手方会社名',
                size: 120,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '16px',
                    }
                }
            },
            {
                accessorKey: 'customer_pic.user_name',
                header: '相手方担当者名',
                size: 80,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '16px',
                    }
                }
            },
        ],
        []
    );

    // 詳細画面への画面遷移
    const navigate = useNavigate();
    const handleRowClick = (row: any) => {
        navigate('/documentManagement/registerList/checkFileDetails', { state: row.original });
    }

    return (
        <BasicTable
            columns={columns}
            data={viewData}
            handleRowClick={handleRowClick}
        />
    )
};

export default BeforeDocView;