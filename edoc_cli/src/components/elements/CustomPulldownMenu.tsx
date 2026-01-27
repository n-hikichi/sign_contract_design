import React from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Box, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export const contractType = [
    { value: '基本契約（業務委託）', label: '基本契約（業務委託）' },
    { value: '基本契約（派遣）', label: '基本契約（派遣）' },
    { value: '個別契約（個人事業主）', label: '個別契約（個人事業主）' },
    { value: '覚書（テレワーク）', label: '覚書（テレワーク）' },
];

export const documentType = [
    { value: 'CONCLUDED', label: '締結' },
    { value: 'DISCARDED', label: '破棄' },
    // { value: 'EXPIRATION', label: '失効' },
];

export const effectiveDate = [
    { value: '1', label: '１日' },
    { value: '2', label: '２日' },
    { value: '3', label: '３日' },
    { value: '4', label: '４日' },
    { value: '5', label: '５日' },
    { value: '6', label: '６日' },
    { value: '7', label: '７日' },
    { value: '8', label: '８日' },
    { value: '9', label: '９日' },
    { value: '10', label: '１０日' },
];

export const prefecture = [
    { value: 'default', label: "-- 都道府県を選択 --" },
    { value: '北海道', label: "北海道" },
    { value: '青森県', label: "青森県" },
    { value: '岩手県', label: "岩手県" },
    { value: '宮城県', label: "宮城県" },
    { value: '秋田県', label: "秋田県" },
    { value: '山形県', label: "山形県" },
    { value: '福島県', label: "福島県" },
    { value: '茨城県', label: "茨城県" },
    { value: '栃木県', label: "栃木県" },
    { value: '群馬県', label: "群馬県" },
    { value: '埼玉県', label: "埼玉県" },
    { value: '千葉県', label: "千葉県" },
    { value: '東京都', label: "東京都" },
    { value: '神奈川県', label: "神奈川県" },
    { value: '新潟県', label: "新潟県" },
    { value: '富山県', label: "富山県" },
    { value: '石川県', label: "石川県" },
    { value: '福井県', label: "福井県" },
    { value: '山梨県', label: "山梨県" },
    { value: '長野県', label: "長野県" },
    { value: '岐阜県', label: "岐阜県" },
    { value: '静岡県', label: "静岡県" },
    { value: '愛知県', label: "愛知県" },
    { value: '三重県', label: "三重県" },
    { value: '滋賀県', label: "滋賀県" },
    { value: '京都府', label: "京都府" },
    { value: '大阪府', label: "大阪府" },
    { value: '兵庫県', label: "兵庫県" },
    { value: '奈良県', label: "奈良県" },
    { value: '和歌山県', label: "和歌山県" },
    { value: '鳥取県', label: "鳥取県" },
    { value: '島根県', label: "島根県" },
    { value: '岡山県', label: "岡山県" },
    { value: '広島県', label: "広島県" },
    { value: '山口県', label: "山口県" },
    { value: '徳島県', label: "徳島県" },
    { value: '香川県', label: "香川県" },
    { value: '愛媛県', label: "愛媛県" },
    { value: '高知県', label: "高知県" },
    { value: '福岡県', label: "福岡県" },
    { value: '佐賀県', label: "佐賀県" },
    { value: '長崎県', label: "長崎県" },
    { value: '熊本県', label: "熊本県" },
    { value: '大分県', label: "大分県" },
    { value: '宮崎県', label: "宮崎県" },
    { value: '鹿児島県', label: "鹿児島県" },
    { value: '沖縄県', label: "沖縄県" },
];

// export const prefecture = [
//     { value: '1', label: "北海道" },
//     { value: '2', label: "青森県" },
//     { value: '3', label: "岩手県" },
//     { value: '4', label: "宮城県" },
//     { value: '5', label: "秋田県" },
//     { value: '6', label: "山形県" },
//     { value: '7', label: "福島県" },
//     { value: '8', label: "茨城県" },
//     { value: '9', label: "栃木県" },
//     { value: '10', label: "群馬県" },
//     { value: '11', label: "埼玉県" },
//     { value: '12', label: "千葉県" },
//     { value: '13', label: "東京都" },
//     { value: '14', label: "神奈川県" },
//     { value: '15', label: "新潟県" },
//     { value: '16', label: "富山県" },
//     { value: '17', label: "石川県" },
//     { value: '18', label: "福井県" },
//     { value: '19', label: "山梨県" },
//     { value: '20', label: "長野県" },
//     { value: '21', label: "岐阜県" },
//     { value: '22', label: "静岡県" },
//     { value: '23', label: "愛知県" },
//     { value: '24', label: "三重県" },
//     { value: '25', label: "滋賀県" },
//     { value: '26', label: "京都府" },
//     { value: '27', label: "大阪府" },
//     { value: '28', label: "兵庫県" },
//     { value: '29', label: "奈良県" },
//     { value: '30', label: "和歌山県" },
//     { value: '31', label: "鳥取県" },
//     { value: '32', label: "島根県" },
//     { value: '33', label: "岡山県" },
//     { value: '34', label: "広島県" },
//     { value: '35', label: "山口県" },
//     { value: '36', label: "徳島県" },
//     { value: '37', label: "香川県" },
//     { value: '38', label: "愛媛県" },
//     { value: '39', label: "高知県" },
//     { value: '40', label: "福岡県" },
//     { value: '41', label: "佐賀県" },
//     { value: '42', label: "長崎県" },
//     { value: '43', label: "熊本県" },
//     { value: '44', label: "大分県" },
//     { value: '45', label: "宮崎県" },
//     { value: '46', label: "鹿児島県" },
//     { value: '47', label: "沖縄県" },
// ];

export const remandReason = [
    { value: '承認フロー変更依頼', label: '承認フロー変更依頼' },
    { value: '契約書差替え依頼', label: '契約書差替え依頼' },
    { value: 'その他', label: 'その他' },
];

export const deleteReason = [
    { value: '相手方企業と合意の上破棄する', label: '相手方企業と合意の上破棄する' },
    { value: '相手方企業と合意せず破棄する', label: '相手方企業と合意せず破棄する' },
    { value: 'その他', label: 'その他' },
];

export const remindTime = [
    { value: '１週間前', label: '１週間前' },
    { value: '２週間前', label: '２週間前' },
    { value: '１か月前', label: '１か月前' },
    { value: '３か月前', label: '３か月前' },
    { value: '６か月前', label: '６か月前' },
];

export const representativeSealSelectType = [
    { value: 'useUserSeal', label: 'ユーザー情報を利用する' },
    { value: 'useRepresentativeSeal', label: '代表印を利用する' },
    // { value: 'アップロードする', label: 'アップロードする' }, // T.B.D
];

interface CommonSelectProps {
    label: string;
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    width?: string;
    fontSize?: string;
    fontWeight?: string;
}

interface CustomPulldownMenuProps extends CommonSelectProps {
    items: { value: string, label: string }[];
}

const CustomPulldownMenu: React.FC<CustomPulldownMenuProps> = ({
    label,
    value,
    onChange,
    width = '100%',
    fontSize = '20px',
    fontWeight = 'bold',
    items,
}) => {
    // デフォルト値を設定
    const defaultValue = items.length > 0 ? items[0].value : '';

    return (
        <FormControl variant="standard" sx={{ width }}>
            <InputLabel id={label}>{label}</InputLabel>
            <Select
                labelId={label}
                id={label}
                value={value || defaultValue}
                onChange={onChange}
                sx={{ fontWeight, fontSize }}
                defaultValue={items.length > 0 ? items[0].value : ''}
            >
                {items.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

interface CommonSelectProps_ {
    label: string;
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    width?: string;
    fontSize?: string;
    fontWeight?: string;
    useDefaultValue?: boolean;
}

interface CustomPulldownMenuProps_ extends CommonSelectProps_ {
    items: {
        company_id: string,
        company_type: string,
        company_name: string,
        postal_code: string,
        state: string,
        city: string,
        address_line: string,
        building: string,
    }[];
}

export const CustomPulldownMenuAlt: React.FC<CustomPulldownMenuProps_> = ({
    label,
    value,
    onChange,
    width = '100%',
    fontSize = '20px',
    fontWeight = 'bold',
    items,
    useDefaultValue = true,
}) => {
    if (!items || items.length === 0) {
        return (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', color: '#8B0000', fontSize: '1.2em', marginTop: '20px', marginBottom: '20px' }}>
                {/* <Typography sx={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>相手方企業が登録されていません。登録状況を確認してください。</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.reload()}
                    sx={{ fontWeight: 'bold', fontSize: '16px', '&:hover': { backgroundColor: 'darkblue' } }}
                >
                    <RefreshIcon />
                </Button> */}
            </Box>
        );
    };

    // デフォルト値を設定
    const defaultValue = useDefaultValue && items.length > 0 ? items[0].company_id : '';
    return (
        <FormControl variant="standard" sx={{ width }}>
            <InputLabel id={label}>{label}</InputLabel>
            <Select
                labelId={label}
                id={label}
                value={value || defaultValue}
                onChange={onChange}
                sx={{ fontWeight, fontSize }}
                defaultValue={items.length > 0 ? items[0].company_id : ''}
            >
                {items.map((item) => (
                    <MenuItem key={item.company_id} value={item.company_id}>
                        {item.company_name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

interface CustomPulldownMenuProps_SignTemplate extends CommonSelectProps_ {
    items: {
        template_id: string,
        template_name: string,
    }[];
}

export const CustomPulldownMenuSignTemplate: React.FC<CustomPulldownMenuProps_SignTemplate> = ({
    label,
    value,
    onChange,
    width = '100%',
    fontSize = '20px',
    fontWeight = 'bold',
    items,
    useDefaultValue = true,
}) => {
    if (!items || items.length === 0) {
        return (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', color: '#8B0000', fontSize: '1.2em', marginTop: '20px', marginBottom: '20px' }}>
                <Typography sx={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>署名用テンプレートが登録されていません。</Typography>
            </Box>
        );
    }

    // デフォルト値を設定
    const defaultValue = useDefaultValue && items.length > 0 ? items[0].template_id : '';
    return (
        <FormControl variant="standard" sx={{ width }}>
            <InputLabel id={label}>{label}</InputLabel>
            <Select
                labelId={label}
                id={label}
                value={value || defaultValue}
                onChange={onChange}
                sx={{ fontWeight, fontSize }}
                defaultValue={items.length > 0 ? items[0].template_id : ''}
            >
                {items.map((item) => (
                    <MenuItem key={item.template_id} value={item.template_id}>
                        {item.template_name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

interface CommonSelectProps_UserList {
    label: string;
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    width?: string;
    fontSize?: string;
    fontWeight?: string;
    useDefaultValue?: boolean;
}

interface CustomPulldownMenuProps_UserList extends CommonSelectProps_UserList {
    items: {
        user_id: string,
        user_name: string,
        company_id: string,
        location_id: string,
        position: string,
        email: string,
    }[];
}

export const CustomPulldownMenuUserList: React.FC<CustomPulldownMenuProps_UserList> = ({
    label,
    value,
    onChange,
    width = '100%',
    fontSize = '20px',
    fontWeight = 'bold',
    items,
}) => {
    // itemsが配列であることを確認
    const itemList = Array.isArray(items) ? items : [];

    // デフォルト値を設定
    const defaultValue = '';
    return (
        <FormControl variant="standard" sx={{ width }}>
            <InputLabel id={label}>{label}</InputLabel>
            <Select
                labelId={label}
                id={label}
                value={value || defaultValue}
                onChange={onChange}
                sx={{ fontWeight, fontSize }}
                defaultValue={itemList.length > 0 ? itemList[0].user_id : ''}
            >
                {itemList.map((item) => (
                    <MenuItem key={item.user_id} value={item.user_id}>
                        {item.user_name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

interface CustomPulldownMenuForPrefectureProps {
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    error?: boolean; // エラー状態を受け取る
    helperText?: string; // エラーメッセージを受け取る
}

export const CustomPulldownMenuForPrefecture: React.FC<CustomPulldownMenuForPrefectureProps> = ({ value, onChange, error, helperText }) => {
    return (
        <FormControl variant="standard" sx={{ width: '100%' }}>
            <InputLabel id="prefecture-label">都道府県</InputLabel>
            <Select
                labelId="prefecture-label"
                id="prefecture"
                value={value}
                onChange={onChange}
                sx={{ paddingLeft: '20px', fontSize: '20px', fontWeight: 'bold', borderColor: error ? 'red' : 'inherit' }}
            >
                {prefecture.map((pref) => (
                    <MenuItem key={pref.value} value={pref.value}>
                        {pref.label}
                    </MenuItem>
                ))}
            </Select>
            {helperText && (
                <Typography variant="body2" color="error" sx={{ marginTop: '5px' }}>
                    {helperText}
                </Typography>
            )}
        </FormControl>
    );
};

export const CustomPulldownMenuForLocation: React.FC<CustomPulldownMenuForPrefectureProps> = ({ value, onChange }) => {
    return (
        <FormControl variant="standard" sx={{ width: '100%' }}>
            <InputLabel id="prefecture-label">所属拠点</InputLabel>
            <Select
                labelId="prefecture-label"
                id="prefecture"
                value={value}
                onChange={onChange}
                sx={{ paddingLeft: '20px', fontSize: '20px', fontWeight: 'bold' }}
            >
                {prefecture.map((pref) => (
                    <MenuItem key={pref.value} value={pref.value}>
                        {pref.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default CustomPulldownMenu;

// 互換性alias（旧名称）
export const CustomPulldownMenu_ForPrefecture = CustomPulldownMenuForPrefecture;
export const CustomPulldownMenu_SignTemplate = CustomPulldownMenuSignTemplate;
export const CustomPulldownMenu_ = CustomPulldownMenuAlt;