import { Chip } from "@mui/material";

interface ApproverInfoForUserProps {
    value: string;
    label: string;
}

// 色の定義
const chipColors = [
    { status: 'CUSTOMER_APPROVING', color: 'primary' },
    { status: 'CUSTOMER_REMANDING', color: 'error' },
    { status: 'INTERNAL_APPROVING', color: 'primary' },
    { status: 'INTERNAL_REMANDING', color: 'error' },
    { status: 'INTERNAL_APPROVED', color: 'success' },
    { status: 'UPLOAD_COMPLETED', color: 'success' },
    { status: 'NOT_UPLOAD', color: 'error' },
]

/**
 * 
 * 現在の契約書のステータスを表示する
 * 
 */
const CustomChip: React.FC<ApproverInfoForUserProps> = ({ value, label }) => {

    const chipColor = chipColors.find(chip => chip.status === value);
    const color = chipColor ? chipColor.color : 'default';

    return (
        <Chip label={label} color={color as "primary" | "error" | "success"} />
    );
};

export default CustomChip;