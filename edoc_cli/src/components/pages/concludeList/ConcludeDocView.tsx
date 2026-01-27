import { type MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasicTable, BasicTableForConclude } from "../../templates/CustomMaterialReactTable";

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
    // 契約種別
    type: string,
    // 取引担当者名
    customer_pic: CustomerPic;
    // 契約締結日
    conclusion_date: string,
    // 契約期限
    expiration_date: string,
};

/**
 * 書類表示画面(Organism)
 * storeにある書類情報を表形式で表示する
 * @returns 書類情報一覧の表
 */
const ConcludeDocView = (props: any) => {

    // 表の列を定義
    const columns = useMemo<MRT_ColumnDef<DocumentListColumns>[]>(
        () => [
            {
                accessorKey: 'title',
                header: '件名',
                size: 80,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '20px',

                    }
                }
            },
            {
                accessorKey: 'type',
                header: '契約種別',
                size: 40,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '20px',
                    }
                }
            },
            {
                accessorKey: 'customer_pic.company_name',
                header: '契約会社名',
                size: 70,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '20px',
                    }
                }
            },
            {
                accessorKey: 'customer_pic.user_name',
                header: '契約担当者名',
                size: 50,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '20px',
                    }
                }
            },
            {
                accessorKey: 'conclusion_date',
                header: '契約締結日',
                size: 10,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '20px',
                    }
                }
            },
            {
                accessorKey: 'expiration_date',
                header: '契約期限',
                size: 10,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '20px',
                    }
                }
            },
        ],
        []
    );

    const navigate = useNavigate();
    const handleRowClick = (row: any) => {

        if (props.agreementType === 'CONCLUDED') {
            navigate('/documentManagement/conclusionDocument/checkFileDetails', { state: { record: row.original } });
        }
        if (props.agreementType === 'DISCARDED') {
            navigate('/documentManagement/discardDocument/checkFileDetails', { state: { record: row.original } });
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

export default ConcludeDocView;