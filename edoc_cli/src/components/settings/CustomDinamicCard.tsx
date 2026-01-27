import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AppBar, Box, Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Modal, Radio, RadioGroup, Select, SelectChangeEvent, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from '@mui/system';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { readOnlyTextFieldStyle, readOnlyTextFieldStyle_labelColor } from '../../styles/fontStyles';
import api from "../../utils/apiAccessor";
import { apiExecutor } from "../../utils/apiExecutor";
import ApiProcessingDialog from "../pages/common/ApiProcessingDialog";
import ErrorDialog from "../pages/common/ErrorDialog";
import SuccessDialog from "../pages/common/SuccessDialog";
import converter from "../../utils/converter";
import { CustomPulldownMenu_ForPrefecture } from '../elements/CustomPulldownMenu';
import validationRules from "../../utils/validationRules";
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const StyledCard = styled(Card)({
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    },
});

const IconWrapper = styled(Box)({
    display: 'inline-block',
    transition: 'transform 0.3s, color 0.3s',
    '&:hover': {
        transform: 'scale(1.2)',
        color: 'green',
    },
});

const DeleteIconWrapper = styled(Box)({
    display: 'inline-block',
    transition: 'transform 0.3s, color 0.3s',
    '&:hover': {
        transform: 'scale(1.2)',
        color: 'red',
    },
});

/***
 * 
 * 企業情報管理画面（I/F）
 * 
 */
interface CustomDinamicCardForCompanyProps {
    companyList?: any;
    onEdit: (companyInfo: any) => void;
    onDelete: () => void;
}

/***
 * 
 * 企業情報管理画面
 * 
 */
const CustomDinamicCardForCompany: React.FC<CustomDinamicCardForCompanyProps> = ({ companyList, onEdit, onDelete }) => {

    const navigate = useNavigate();

    const [selectedCompany, setSelectedLocation] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    const handleExecuteSuccessApiDialogClose = () => {
        setExecuteSuccessApiDialogOpen(false);

        const uuid = uuidv4();
        navigate('/manage/clientCompany', { state: { uuid: uuid } });
    };

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    /***
     * 
     * 削除ダイアログ
     * 
     */
    const handleDeleteDialogOpen = (user: any) => {
        setSelectedLocation(user);
        setDeleteDialogOpen(true);
        onDelete();
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setSelectedLocation(null);
    };

    // 削除処理
    const handleDelete = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const res = await api.deleteCompanyData(selectedCompany.company_id);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('企業情報削除処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('企業情報削除処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
        handleDeleteDialogClose();
    };
    return (
        <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: '20px' }}>
                {companyList && companyList.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', paddingLeft: '1%' }}>
                        {companyList.map((item: any, index: number) => (
                            <StyledCard key={index} sx={{ width: '48%', margin: '1%', border: '1px solid lightgray' }}>
                                <CardContent sx={{ backgroundColor: '#f0f0f0' }}>
                                    <Box sx={{ height: '220px' }}>
                                        <Box sx={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: "space-between", alignItems: 'center' }}>
                                            <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', width: '100%' }}>
                                                {item.company_name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ height: '120px' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography color="text.secondary" fontSize='1rem' fontWeight='bold' marginBottom='10px'>
                                                        郵便番号：{item.postal_code}
                                                    </Typography>
                                                    <Typography color="text.secondary" fontSize='1rem' fontWeight='bold'>
                                                        所在地　：{item.state}{item.city}{item.address_line}  {item.building}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box display="flex" justifyContent="flex-end" >
                                            <Tooltip title="企業情報を編集">
                                                <IconButton
                                                    onClick={() => onEdit(item)}
                                                    aria-label="edit"
                                                    sx={{
                                                        backgroundColor: 'transparent', // 背景を透明に設定
                                                        '&:hover': {
                                                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                                                        },
                                                    }}
                                                >
                                                    <IconWrapper>
                                                        <EditIcon fontSize="large" sx={{ marginRight: '20px' }} />
                                                    </IconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="企業情報を削除">
                                                <IconButton
                                                    onClick={() => handleDeleteDialogOpen(item)}
                                                    aria-label="delete"
                                                    sx={{
                                                        backgroundColor: 'transparent', // 背景を透明に設定
                                                        '&:hover': {
                                                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                                                        },
                                                    }}
                                                >
                                                    <DeleteIconWrapper>
                                                        <DeleteIcon fontSize="large" />
                                                    </DeleteIconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        ))}
                    </Box>
                ) : (
                    <Typography>登録情報がありません</Typography>
                )}
                {/* ユーザー情報削除ダイアログ */}
                <Modal open={deleteDialogOpen}>
                    <Box sx={{ padding: '20px', backgroundColor: '#ffeeee', borderRadius: '4px', boxShadow: 24, width: '50%', margin: 'auto', marginTop: '10%' }}>
                        <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '10px', fontSize: '1.5rem' }}>
                            以下の企業情報を削除します。よろしいですか？
                        </Typography>
                        <Typography sx={{ color: 'darkred', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.2em' }}>
                            企業情報を削除すると、拠点・ユーザー情報も削除されます。<br />
                        </Typography>
                        {selectedCompany && (
                            <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedCompany.company_name}
                                        label="企業名"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedCompany.postal_code}
                                        label="郵便番号"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={`${selectedCompany.state}${selectedCompany.city}${selectedCompany.address_line}${selectedCompany.building}`}
                                        label="所在地"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={handleDelete} color="error" variant="contained" sx={{ marginRight: '10px', width: '10rem', '&:hover': { backgroundColor: 'darkred' } }}>削除する</Button>
                            <Button onClick={handleDeleteDialogClose} color="primary" variant="contained" sx={{ width: '10rem', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button>
                        </Box>
                    </Box>
                </Modal>
            </Box>
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
};

/***
 * 
 * 拠点情報管理画面（I/F）
 * 
 */
interface CustomDinamicCardForLocationProps {
    companyInfo?: any;
    locationList?: any;
    onEditDialogOpen: () => void;
    onDeleteDialogOpen: () => void;
}

/***
 * 
 * 拠点情報管理画面
 * 
 */
const CustomDinamicCardForLocation: React.FC<CustomDinamicCardForLocationProps> = ({ companyInfo, locationList, onEditDialogOpen, onDeleteDialogOpen }) => {

    const navigate = useNavigate();

    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [errors, setErrors] = useState({
        location_name: '',
        postal_code: '',
        city: '',
        address_line: '',
    });

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    const fieldNamesInJapanese: { [key: string]: string } = {
        location_name: '拠点名',
        city: '市区町村',
        address_line: '町名番地',
    };

    /***
     * 
     * テキストフィールド変更処理
     * 
     */
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setSelectedLocation({ ...selectedLocation, [name]: value });

        if (name === 'location_name' || name === 'city' || name === 'address_line') {
            const error = validateTextField(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    // バリデーションチェック
    const validateTextField = (name: string, value: string) => {
        const fieldName = fieldNamesInJapanese[name] || name;

        if (!value) {
            return `${fieldName}は必須です。${validationRules.TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`;
        }
        return '';
    };

    /***
     * 
     * 郵便番号 フォーマット処理
     * 
     */
    const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // 郵便番号の形式をチェックし、XXX-XXXXの形式に達した場合それ以上の入力を無視
        if (event.target.value.length > 8) {
            return;
        }

        // バリデーションチェック
        const error = validatePostalCode(event.target.value);
        setErrors({ ...errors, postal_code: error });

        // フォーマットを整えてからテキストフィールドを更新
        event.target.value = converter.postalCodeConverter(event.target.value);
        setSelectedLocation({ ...selectedLocation, postal_code: event.target.value });
    };

    // 郵便番号バリデーション
    const validatePostalCode = (value: string) => {
        if (!value) {
            return '郵便番号は必須です。';
        }
        if (!/^\d{3}-\d{4}$/.test(value)) {
            return '郵便番号は必須です。XXX-XXXXの形式で入力してください';
        }
        return '';
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
    const handleExecuteSuccessApiDialogClose = () => {
        setExecuteSuccessApiDialogOpen(false);

        if (companyInfo.company_type === 'INTERNAL') {
            const uuid = uuidv4();
            navigate('/manage/company', { state: { uuid: uuid } });
        } else if (companyInfo.company_type === 'CUSTOMER') {
            navigate('/manage/clientCompanyLocation', { state: { customerData: companyInfo } });
        }
    };

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    /***
     * 
     * 編集ダイアログ
     * 
     */
    const handleEditDialogOpen = (user: any) => {
        setSelectedLocation(user);
        setEditDialogOpen(true);
        onEditDialogOpen();
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedLocation(null);
        setErrors({ location_name: '', postal_code: '', city: '', address_line: '' });
    };

    // 編集処理
    const handleEdit = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const { company_id, location_id, ...selectedData } = selectedLocation;

            const res = await api.putLocationData(selectedLocation.company_id, selectedLocation.location_id, selectedData);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('拠点情報更新処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('拠点情報更新処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
        handleEditDialogClose();
    };

    /***
     * 
     * 削除ダイアログ
     * 
     */
    const handleDeleteDialogOpen = (user: any) => {
        setSelectedLocation(user);
        setDeleteDialogOpen(true);
        onDeleteDialogOpen();
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setSelectedLocation(null);
    };

    // 削除処理
    const handleDelete = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const res = await api.deleteLocationData(selectedLocation.company_id, selectedLocation.location_id);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('拠点情報削除処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('拠点情報削除処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
        handleDeleteDialogClose();
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: '20px' }}>
                {locationList && locationList.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', paddingLeft: '1%' }}>
                        {locationList.map((item: any, index: number) => (
                            <StyledCard key={index} sx={{ width: '48%', margin: '1%', border: '1px solid lightgray' }}>
                                <CardContent sx={{ backgroundColor: '#f0f0f0' }}>
                                    <Box sx={{ height: '220px' }}>
                                        <Box sx={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: "space-between", alignItems: 'center' }}>
                                            <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', width: '100%' }}>
                                                {item.location_name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ height: '120px' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography color="text.secondary" fontSize='1rem' fontWeight='bold' marginBottom='10px'>
                                                        郵便番号：{item.postal_code}
                                                    </Typography>
                                                    <Typography color="text.secondary" fontSize='1rem' fontWeight='bold'>
                                                        所在地　：{item.state}{item.city}{item.address_line}  {item.building}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box display="flex" justifyContent="flex-end" >
                                            <Tooltip title="拠点情報を編集">
                                                <IconButton
                                                    onClick={() => handleEditDialogOpen(item)}
                                                    aria-label="edit"
                                                    sx={{
                                                        backgroundColor: 'transparent', // 背景を透明に設定
                                                        '&:hover': {
                                                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                                                        },
                                                    }}
                                                >
                                                    <IconWrapper>
                                                        <EditIcon fontSize="large" sx={{ marginRight: '20px' }} />
                                                    </IconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="拠点情報を削除">
                                                <IconButton
                                                    onClick={() => handleDeleteDialogOpen(item)}
                                                    aria-label="delete"
                                                    sx={{
                                                        backgroundColor: 'transparent', // 背景を透明に設定
                                                        '&:hover': {
                                                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                                                        },
                                                    }}>
                                                    <DeleteIconWrapper>
                                                        <DeleteIcon fontSize="large" />
                                                    </DeleteIconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        ))}
                    </Box>
                ) : (
                    <Typography>登録情報がありません</Typography>
                )}
                {/* ユーザー情報更新ダイアログ */}
                <Modal open={editDialogOpen}>
                    <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', height: '75%', margin: 'auto', marginTop: '10%' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', width: '100%' }}>
                            拠点情報を編集
                        </Typography>
                        {selectedLocation && (
                            <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', overflowY: 'auto', maxHeight: '80%', border: '1px solid lightgray' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        name="company_name"
                                        value={selectedLocation.company_name}
                                        label="企業名"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        name="location_name"
                                        value={selectedLocation.location_name}
                                        label="拠点名"
                                        variant="standard"
                                        placeholder="本社"
                                        onChange={handleTextFieldChange}
                                        error={!!errors.location_name}
                                        helperText={errors.location_name}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            style: {
                                                color: 'black',
                                                paddingLeft: '20px',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                            },
                                            inputProps: {
                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                            }
                                        }}
                                        sx={readOnlyTextFieldStyle}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.postal_code}
                                        label="郵便番号"
                                        variant="standard"
                                        placeholder="123-4567"
                                        onChange={handlePostalCodeChange}
                                        error={!!errors.postal_code}
                                        helperText={errors.postal_code}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            style: {
                                                color: 'black',
                                                paddingLeft: '20px',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                            },
                                        }}
                                        sx={readOnlyTextFieldStyle}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <CustomPulldownMenu_ForPrefecture
                                        value={selectedLocation.state}
                                        onChange={(e) => setSelectedLocation({ ...selectedLocation, state: e.target.value })}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        name="city"
                                        value={selectedLocation.city}
                                        label="市区町村"
                                        variant="standard"
                                        placeholder="○○市"
                                        onChange={handleTextFieldChange}
                                        error={!!errors.city}
                                        helperText={errors.city}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            style: {
                                                color: 'black',
                                                paddingLeft: '20px',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                            },
                                            inputProps: {
                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                            }
                                        }}
                                        sx={readOnlyTextFieldStyle}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        name="address_line"
                                        value={selectedLocation.address_line}
                                        label="町名番地"
                                        variant="standard"
                                        placeholder="○○町1-2-3"
                                        onChange={handleTextFieldChange}
                                        error={!!errors.address_line}
                                        helperText={errors.address_line}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            style: {
                                                color: 'black',
                                                paddingLeft: '20px',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                            },
                                            inputProps: {
                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                            }
                                        }}
                                        sx={readOnlyTextFieldStyle}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        name="building"
                                        value={selectedLocation.building}
                                        label="建物名・部屋番号"
                                        variant="standard"
                                        placeholder="○○ビル"
                                        onChange={handleTextFieldChange}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            style: {
                                                color: 'black',
                                                paddingLeft: '20px',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                            },
                                            inputProps: {
                                                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                            }
                                        }}
                                        sx={readOnlyTextFieldStyle}
                                    />
                                </Box>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <Button onClick={handleEdit} color="primary" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} disabled={!isFormValid}>更新する</Button>
                            <Button onClick={handleEditDialogClose} color="primary" variant="contained" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>閉じる</Button>
                        </Box>
                    </Box>
                </Modal>
                {/* ユーザー情報削除ダイアログ */}
                <Modal open={deleteDialogOpen}>
                    <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', margin: 'auto', marginTop: '10%' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '10px', fontSize: '1.5rem' }}>
                            以下の拠点を削除します。よろしいですか？
                        </Typography>
                        {selectedLocation && (
                            <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.location_name}
                                        label="拠点名"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.company_name}
                                        label="企業名"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.postal_code}
                                        label="郵便番号"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.state}
                                        label="都道府県"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.city}
                                        label="市区町村"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.address_line}
                                        label="町名番地"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        value={selectedLocation.building}
                                        label="建物名・部屋番号"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_labelColor}
                                        disabled={true}
                                    />
                                </Box>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={handleDelete} color="error" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkred' } }}>削除する</Button>
                            <Button onClick={handleDeleteDialogClose} color="primary" variant="contained" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button>
                        </Box>
                    </Box>
                </Modal>
            </Box>
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
};

/***
 * 
 * ユーザー情報管理画面（I/F）
 * 
 */
interface CustomDinamicCardForUserProps {
    companyInfo?: any;
    locationList?: any;
    userList?: any;
    onEditDialogOpen: () => void;
    onDeleteDialogOpen: () => void;
}

/***
 * 
 * ユーザー情報管理画面
 * 
 */
const CustomDinamicCardForUser: React.FC<CustomDinamicCardForUserProps> = ({ companyInfo, locationList, userList, onEditDialogOpen, onDeleteDialogOpen }) => {

    const navigate = useNavigate();

    // 印影プレビュー用
    const [sealPreview, setSealPreview] = useState<string | null>(null);
    const [uploadSealPreview, setUploadSealPreview] = useState<string | null>(null);

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // 印影用の入力フィールド
    const [companyDisplayName, setCompanyDisplayName] = useState('');
    const [sealPosition, setSealPosition] = useState('');
    const [sealUserName, setSealUserName] = useState('');

    // 印影ファイル情報
    const [uploadFile, setUploadFile] = useState<string>();
    // 印影ファイル情報
    const [createFile, setCreateFile] = useState<string>();

    const [errors, setErrors] = useState({
        user_name: '',
        email: '',
    });

    // タブ切り替え用のstateを追加
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: SelectChangeEvent<string>) => {
        setTabValue(event.target.value === '0' ? 0 : 1);
    };

    // タブ切り替え用のstateを追加
    const [previewTabValue, setPreviewTabValue] = useState(0);
    const handlePreviewTabChange = (event: React.SyntheticEvent, newTabValue: number) => {
        setPreviewTabValue(newTabValue);
    };

    function a11yProps(index: number) {
        return {
            id: `full-width-tab-${index}`,
            'aria-controls': `full-width-tabpanel-${index}`,
        };
    };

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    const fieldNamesInJapanese: { [key: string]: string } = {
        user_name: 'ユーザー名',
        email: 'メールアドレス',
    };

    /***
     * 
     * テキストフィールド変更処理
     * 
     */
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setSelectedUser({ ...selectedUser, [name]: value });

        if (name === 'company_name') {
            setCompanyDisplayName(value);
        }

        if (name === 'seal_position') {
            setSealPosition(value);
        }

        if (name === 'seal_user_name') {
            setSealUserName(value);
        }

        if (name === 'email' || name === 'user_name') {
            const error = validateTextField(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    // バリデーションチェック
    const validateTextField = (name: string, value: string) => {
        const fieldName = fieldNamesInJapanese[name] || name;

        if (!value) {
            return `${fieldName}は必須です。${validationRules.TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`;
        }
        return '';
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
    const handleExecuteSuccessApiDialogClose = () => {
        setExecuteSuccessApiDialogOpen(false);

        if (companyInfo.company_type === 'INTERNAL') {
            const uuid = uuidv4();
            navigate('/manage/company', { state: { uuid: uuid } });
        } else if (companyInfo.company_type === 'CUSTOMER') {
            navigate('/manage/clientCompanyLocation', { state: { customerData: companyInfo } });
        }
    }

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    /***
     * 
     * 編集ダイアログ
     * 
     */
    // ユーザー情報編集ダイアログを開く
    const handleEditDialogOpen = (user: any) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
        onEditDialogOpen();
    };

    // ユーザー情報編集ダイアログを閉じる
    const handleEditDialogClose = () => {
        setTabValue(0);
        setPreviewTabValue(0);
        setEditDialogOpen(false);
        setSelectedUser(null);
        setErrors({ user_name: '', email: '' });
        setSealPreview('');
        setUploadSealPreview('');
        setCompanyDisplayName(companyInfo?.company_name || '');
        setSealPosition('');
        setSealUserName('');
        setIsChecked(false);
    };

    // ユーザー情報更新処理
    const handleEdit = async () => {

        setExecuteApiDialogOpen(true);
        handleEditDialogClose();

        try {
            let selectedFile = '';

            // 現在の印影を使用する
            if (previewTabValue === 0) {
                // 現在の印影を使用
                selectedFile = selectedUser.file || '';
            };

            // 新規ファイルアップロードで印影を更新する
            if (previewTabValue === 1 && tabValue === 0) {
                selectedFile = uploadFile || '';
            };

            // 新規作成で印影を更新する
            if (previewTabValue === 1 && tabValue === 1) {
                selectedFile = createFile || '';
            };

            const { user_id, seal_position, seal_user_name, company_name, ...userData } = selectedUser;
            userData.file = selectedFile;

            const res = await api.putUserData(selectedUser.user_id, userData);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('ユーザー情報更新処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('ユーザー情報更新処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }

        setExecuteApiDialogOpen(false);
    };

    /***
     * 
     * 削除ダイアログ
     * 
     */
    // ユーザー情報削除ダイアログを開く
    const handleDeleteDialogOpen = (user: any) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
        onDeleteDialogOpen();
    };

    // ユーザー情報削除ダイアログを閉じる
    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    };

    // ユーザー情報削除処理
    const handleDelete = async () => {

        setExecuteApiDialogOpen(true);
        handleDeleteDialogClose();

        try {
            const res = await api.deleteUserData(selectedUser.user_id);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('ユーザー情報削除処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('ユーザー情報削除処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }

        setExecuteApiDialogOpen(false);
    };

    /***
     * 
     * location_idをキーとするオブジェクトを作成
     * ※所属拠点をIDから拠点名に変換する
     * 
     */
    // const locationMap = locationList.reduce((map: any, location: any) => {
    //     map[location.location_id] = location.location_name;
    //     return map;
    // }, {} as { [key: string]: string });

    // const [selectedLocation, setSelectedLocation] = useState('');

    // const handleSelectChange = (event: SelectChangeEvent<string>) => {
    //     setSelectedUser({ ...selectedUser, location_id: event.target.value });
    // };

    /***
     *
     * 契約書アップロード
     *
     */
    // ファイル名
    const [fileName, setFileName] = useState<string | null>(null);
    // ファイル情報
    const [file, setFile] = useState<File>();
    // ファイルアップロード状況
    const [fileUploaded, setFileUploaded] = useState(false);

    // アップロードしたファイルの情報を保持する
    const handleFileUpload = (files: File[]) => {

        const file = files[0];
        if (file) {
            setFileName(file.name);
            // ファイル名を件名として使用する
            let fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
            setFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                let base64String = reader.result as string;
                // プレフィックスを取り除く
                base64String = base64String.replace(/^data:image\/png;base64,/, '');
                setUploadSealPreview(base64String);
                setUploadFile(base64String);
                // setSelectedUser({ ...selectedUser, file: base64String });
                setSelectedUser((prev: typeof selectedUser) => ({
                    ...prev,
                    file: base64String
                }));
            };
            reader.readAsDataURL(file);

            setFileUploaded(true);
        }
    };

    // ドロップされたファイルを処理します。ここでは最初のファイルだけを扱います。
    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleFileUpload(acceptedFiles);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const [preview, setPreview] = useState<string | null>(null);

    // チェックボックスの状態を管理する
    const [isChecked, setIsChecked] = useState(false);

    // 承認者情報に関する処理
    // チェックボックスの状態を更新する
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);

        if (event.target.checked) {
            // 入力情報を代表印フィールドに反映する
            setCompanyDisplayName(companyInfo ? companyInfo.company_name : '');
            setSealPosition(selectedUser ? selectedUser.position : '');
            setSealUserName(selectedUser ? selectedUser.user_name : '');
        } else {
            // 代表印のフィールドをクリアする
            setSealUserName('');
            setSealPosition('');
        }
    };

    // 印影作成関数
    const generateSealImage = (userName: string, position: string, companyName: string) => {
        const size = 250;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 外側の大きな円
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 6;
        ctx.stroke();

        // 会社名を外側円弧に沿って描画（多い場合は一周）
        drawTextAlongArc(
            ctx,
            companyName,
            size / 2,
            size / 2,
            size / 2 - 25,
            Math.PI * 1.1,
            Math.PI * 1.9,
            "bold 24px sans-serif",
            "#d32f2f"
        );

        // 内側の小さい円
        const innerRadius = size / 2 - 45;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, innerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 役職とユーザー名のフォントサイズを自動調整
        function fitFontSize(text: string, maxWidth: number, baseFontSize: number, minFontSize: number) {
            let fontSize = baseFontSize;

            if (!ctx) return fontSize;
            ctx.font = `bold ${fontSize}px sans-serif`;
            while (ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
                fontSize -= 1;
                ctx.font = `bold ${fontSize}px sans-serif`;
            }
            return fontSize;
        }

        const maxTextWidth = innerRadius * 1.7; // 円内に収まるよう調整（1.7は目安、必要に応じて調整）

        const positionFontSize = fitFontSize(position, maxTextWidth, 20, 10);
        ctx.font = `bold ${positionFontSize}px sans-serif`;
        ctx.fillStyle = '#d32f2f';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(position, size / 2, size / 2 - 12);

        const userNameFontSize = fitFontSize(userName, maxTextWidth, 20, 10);
        ctx.font = `bold ${userNameFontSize}px sans-serif`;
        ctx.fillText(userName, size / 2, size / 2 + 18);

        return canvas.toDataURL('image/png');
    };

    function drawTextAlongArc(
        ctx: CanvasRenderingContext2D,
        str: string,
        centerX: number,
        centerY: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        font: string,
        color: string
    ) {
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const len = str.length;
        // 円周全体を使い、等間隔で配置
        const angleRange = 2 * Math.PI;
        const angleDecrement = angleRange / len;
        // 1文字目を12時方向よりやや右（0時30分方向、約15度 = π/12）にする
        const baseAngle = -Math.PI / 2 + Math.PI / 12;

        for (let i = 0; i < len; i++) {
            const char = str[i];
            const angle = baseAngle + i * angleDecrement;
            ctx.save();
            ctx.translate(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    /***
     * 
     * 代表印を作成する
     * 
     */
    const createRepresentativeSeal = async () => {
        // テキストフィールドから値を取得
        const userName = sealUserName;
        const position = sealPosition;
        const companyName = companyDisplayName;

        // 印影画像を生成
        const sealImg = generateSealImage(userName, position, companyName);
        setSealPreview(sealImg);

        if (sealImg) {
            const base64String = sealImg.replace(/^data:image\/png;base64,/, '');
            setCreateFile(base64String);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: '20px' }}>
                {userList && userList.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', paddingLeft: '1%' }}>
                        {userList.filter((item: any) => item.isRepresentativeSeal === false).map((item: any, index: number) => (
                            <StyledCard key={index} sx={{ width: '48%', margin: '1%', border: '1px solid lightgray' }}>
                                <CardContent sx={{ backgroundColor: '#f0f0f0' }}>
                                    <Box sx={{ height: '220px' }}>
                                        <Box sx={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: "space-between", alignItems: 'center' }}>
                                            <Typography sx={{ backgroundColor: item.position === 'RepresentativeSeal' ? 'lightgreen' : 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', width: '100%' }}>
                                                {item.user_name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ height: '120px' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography color="text.secondary" fontSize='1rem' fontWeight='bold' marginBottom='10px'>
                                                        役職　　　　　　：{item.position}
                                                    </Typography>
                                                    <Typography color="text.secondary" fontSize='1rem' fontWeight='bold' marginBottom='10px'>
                                                        メールアドレス　：{item.email}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                                        <Typography color="text.secondary" fontSize="1rem" fontWeight="bold">
                                                            代表印　　　　：{item.file ? '登録済み' : '未登録'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box display="flex" justifyContent="flex-end" >
                                            <Tooltip title="ユーザー情報を編集">
                                                <IconButton
                                                    onClick={() => handleEditDialogOpen(item)}
                                                    aria-label="edit"
                                                    sx={{
                                                        backgroundColor: 'transparent', // 背景を透明に設定
                                                        '&:hover': {
                                                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                                                        },
                                                    }}
                                                >
                                                    <IconWrapper>
                                                        <EditIcon fontSize="large" sx={{ marginRight: '20px' }} />
                                                    </IconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="ユーザー情報を削除">
                                                <IconButton
                                                    onClick={() => handleDeleteDialogOpen(item)}
                                                    aria-label="delete"
                                                    sx={{
                                                        backgroundColor: 'transparent', // 背景を透明に設定
                                                        '&:hover': {
                                                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                                                        },
                                                    }}
                                                >
                                                    <DeleteIconWrapper>
                                                        <DeleteIcon fontSize="large" />
                                                    </DeleteIconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        ))}
                    </Box>
                ) : (
                    <Typography>登録情報がありません</Typography>
                )}
                {/* ユーザー情報更新ダイアログ */}
                <Modal open={editDialogOpen}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', marginTop: '10%' }}>
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', width: '100%' }}>
                                ユーザー情報を編集
                            </Typography>
                            {selectedUser && (
                                <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray', overflow: 'auto', maxHeight: '70vh' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            name="user_name"
                                            value={selectedUser.user_name}
                                            label="ユーザー名"
                                            variant="standard"
                                            onChange={handleTextFieldChange}
                                            error={!!errors.user_name}
                                            helperText={errors.user_name}
                                            InputProps={{
                                                style: {
                                                    color: 'black',
                                                    paddingLeft: '20px',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                },
                                                inputProps: {
                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                }
                                            }}
                                            sx={{ width: '100%' }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            name="position"
                                            value={selectedUser.position}
                                            label="役職"
                                            variant="standard"
                                            onChange={handleTextFieldChange}
                                            InputProps={{
                                                style: {
                                                    color: 'black',
                                                    paddingLeft: '20px',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                },
                                                inputProps: {
                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                }
                                            }}
                                            sx={{ width: '100%' }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            name="email"
                                            value={selectedUser.email}
                                            label="メールアドレス"
                                            variant="standard"
                                            placeholder="blockchain-econtract@micros.com"
                                            onChange={handleTextFieldChange}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            InputProps={{
                                                style: {
                                                    color: 'black',
                                                    paddingLeft: '20px',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                },
                                                inputProps: {
                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                }
                                            }}
                                            sx={{ width: '100%' }}
                                        />
                                    </Box>
                                    <Box sx={{ backgroundColor: 'white', paddingTop: '20px', marginBottom: '20px' }}>
                                        <Typography sx={{ borderRadius: '4px', textAlign: 'start', fontSize: '1rem', width: '100%' }}>
                                            代表印
                                        </Typography>
                                        <Box sx={{ width: '50%', justifyContent: 'flex-end', display: 'flex', marginBottom: '10px', marginLeft: '20px' }}>
                                            <AppBar position="static">
                                                <Tabs
                                                    value={previewTabValue}
                                                    onChange={handlePreviewTabChange}
                                                    indicatorColor="secondary"
                                                    textColor="inherit"
                                                    variant="fullWidth"
                                                    aria-label="full width tabs example"
                                                    sx={{
                                                        '& .MuiTab-root': {
                                                            backgroundColor: 'lightblue', // デフォルトの背景色
                                                        },
                                                        '& .Mui-selected': {
                                                            backgroundColor: 'darkorange', // 選択されたタブの背景色
                                                            color: 'white', // 選択されたタブの文字色
                                                        },
                                                    }}
                                                >
                                                    <Tab label={<Typography sx={{ fontSize: '1em', fontWeight: 'bold' }}>現在の印影で更新</Typography>}
                                                        {...a11yProps(0)}
                                                    />
                                                    <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>印影を更新</Typography>}
                                                        {...a11yProps(1)}
                                                    />
                                                </Tabs>
                                            </AppBar>
                                        </Box>
                                        {previewTabValue === 0 && (
                                            <>
                                                {/* プレビュー表示エリア */}
                                                {preview ? (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                        <img src={preview} alt="Uploaded preview" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                                    </Box>
                                                ) : (
                                                    selectedUser?.file ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                            <img src={`data:image/png;base64,${selectedUser.file}`} alt="user" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                                        </Box>
                                                    ) : (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '40px', width: '100%', height: '100%', textAlign: 'center', fontSize: '1.2em' }}>
                                                    <Typography color="darkred" fontWeight="bold" >このユーザーは代表印が登録されていません</Typography>
                                                </Box>
                                                )
                                                )}
                                            </>
                                        )}
                                        {previewTabValue === 1 && (
                                            <>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '5px' }}>
                                                    <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginLeft: '20px', marginRight: '20px', fontSize: '1.2rem' }}>
                                                        登録方法選択
                                                    </Typography>
                                                    <RadioGroup
                                                        row
                                                        value={tabValue.toString()}
                                                        onChange={handleTabChange}
                                                        name="sealType"
                                                    >
                                                        <FormControlLabel
                                                            value="0"
                                                            control={<Radio color="primary" />}
                                                            label="ファイルアップロード"
                                                        />
                                                        <FormControlLabel
                                                            value="1"
                                                            control={<Radio color="primary" />}
                                                            label="新規作成"
                                                        />
                                                    </RadioGroup>
                                                </Box>
                                                {tabValue === 0 && (
                                                    <>
                                                        <Box
                                                            {...getRootProps()}
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                height: '100px',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                marginBottom: '20px',
                                                                border: isDragActive ? 'dashed' : 'dotted',
                                                                marginLeft: '20px',
                                                                marginRight: '20px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => document.getElementById('fileInput')?.click()}
                                                        >
                                                            <input {...getInputProps()} />
                                                            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                                                                <br />
                                                                ここにファイルをドロップ or クリックしてファイルを選択<br />
                                                                （PNG形式のみ）<br /><br />
                                                            </Box>
                                                            <input
                                                                id="fileInput"
                                                                type="file"
                                                                accept=".png"
                                                                onChange={(e) => handleFileUpload(e.target.files ? Array.from(e.target.files) : [])}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </Box>
                                                        {/* プレビュー表示エリア */}
                                                        {uploadSealPreview && (
                                                            <>
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
                                                                    <img src={`data:image/png;base64,${uploadSealPreview}`} alt="印影プレビュー" style={{ maxWidth: '200px', border: '1px solid gray', borderRadius: '10px' }} />
                                                                </Box>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {tabValue === 1 && (
                                                    <>
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '5px' }}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onChange={handleCheckboxChange}
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label="入力情報を利用して代表印を作成する"
                                                                sx={{ alignSelf: 'center' }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ backgroundColor: 'grey.200', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '10px', marginLeft: '10px', alignItems: 'center', border: '1px solid lightgray', padding: '20px' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                                <TextField
                                                                    name="company_name"
                                                                    value={companyDisplayName}
                                                                    label="会社名"
                                                                    variant="standard"
                                                                    onChange={handleTextFieldChange}
                                                                    InputProps={{
                                                                        style: {
                                                                            color: 'black',
                                                                            paddingLeft: '20px',
                                                                            fontSize: '20px',
                                                                            fontWeight: 'bold',
                                                                        },
                                                                        inputProps: {
                                                                            maxLength: 30 // 最大文字数を設定
                                                                        }
                                                                    }}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                                <TextField
                                                                    name="seal_position"
                                                                    value={sealPosition}
                                                                    label="役職"
                                                                    variant="standard"
                                                                    onChange={handleTextFieldChange}
                                                                    InputProps={{
                                                                        style: {
                                                                            color: 'black',
                                                                            paddingLeft: '20px',
                                                                            fontSize: '20px',
                                                                            fontWeight: 'bold',
                                                                        },
                                                                        inputProps: {
                                                                            maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                        }
                                                                    }}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                                                <TextField
                                                                    name="seal_user_name"
                                                                    value={sealUserName}
                                                                    label="ユーザー名"
                                                                    variant="standard"
                                                                    onChange={handleTextFieldChange}
                                                                    InputProps={{
                                                                        style: {
                                                                            color: 'black',
                                                                            paddingLeft: '20px',
                                                                            fontSize: '20px',
                                                                            fontWeight: 'bold',
                                                                        },
                                                                        inputProps: {
                                                                            maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                        }
                                                                    }}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </Box>
                                                            <Button onClick={createRepresentativeSeal} color="warning" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkorange' } }}>登録画像を作成</Button>
                                                            {sealPreview && (
                                                                <>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
                                                                        <img src={sealPreview} alt="印影プレビュー" style={{ maxWidth: '200px', border: '1px solid gray', borderRadius: '10px' }} />
                                                                    </Box>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <Button onClick={handleEdit} color="primary" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} disabled={!isFormValid}>更新する</Button>
                                <Button onClick={handleEditDialogClose} color="primary" variant="contained" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>閉じる</Button>
                            </Box>
                        </Box>
                    </Box>
                </Modal>
                {/* ユーザー情報削除ダイアログ */}
                <Modal open={deleteDialogOpen}>
                    <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', margin: 'auto', marginTop: '10%' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '10px', fontSize: '1.5rem' }}>
                            以下のユーザーを削除します。よろしいですか？
                        </Typography>
                        <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={selectedUser?.user_name}
                                    label="ユーザー名"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={selectedUser?.position}
                                    label="役職"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={selectedUser?.email}
                                    label="メールアドレス"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box>
                            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={locationMap[selectedUser?.location_id] || ''}
                                    label="所属拠点"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box> */}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={handleDelete} color="error" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkred' } }}>削除する</Button>
                            <Button onClick={handleDeleteDialogClose} color="primary" variant="contained" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button>
                        </Box>
                    </Box>
                </Modal>
            </Box >
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
};

/***
 * 
 * ユーザー情報管理画面（I/F）
 * 
 */
interface CustomDinamicCardForRepresentativeSealProps {
    companyInfo?: any;
    locationList?: any;
    userList?: any;
    onEditDialogOpen: () => void;
    onDeleteDialogOpen: () => void;
}

/***
 * 
 * ユーザー情報管理画面
 * 
 */
const CustomDinamicCardForRepresentativeSeal: React.FC<CustomDinamicCardForRepresentativeSealProps> = ({ companyInfo, locationList, userList, onEditDialogOpen, onDeleteDialogOpen }) => {

    const navigate = useNavigate();

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [errors, setErrors] = useState({
        user_name: '',
        email: '',
    });

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    const fieldNamesInJapanese: { [key: string]: string } = {
        user_name: 'ユーザー名',
        email: 'メールアドレス',
    };

    /***
     * 
     * テキストフィールド変更処理
     * 
     */
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setSelectedUser({ ...selectedUser, [name]: value });

        if (name === 'email' || name === 'user_name') {
            const error = validateTextField(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    // バリデーションチェック
    const validateTextField = (name: string, value: string) => {
        const fieldName = fieldNamesInJapanese[name] || name;

        if (!value) {
            return `${fieldName}は必須です。${validationRules.TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`;
        }
        return '';
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
    const handleExecuteSuccessApiDialogClose = () => {
        setExecuteSuccessApiDialogOpen(false);

        if (companyInfo.company_type === 'INTERNAL') {
            const uuid = uuidv4();
            navigate('/manage/company', { state: { uuid: uuid } });
        } else if (companyInfo.company_type === 'CUSTOMER') {
            navigate('/manage/clientCompanyLocation', { state: { customerData: companyInfo } });
        }
    }

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    /***
     * 
     * 編集ダイアログ
     * 
     */
    // ユーザー情報編集ダイアログを開く
    const handleEditDialogOpen = (user: any) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
        onEditDialogOpen();
    };

    // ユーザー情報編集ダイアログを閉じる
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
        setErrors({ user_name: '', email: '' });
    };

    // ユーザー情報更新処理
    const handleEdit = async () => {

        setExecuteApiDialogOpen(true);
        handleEditDialogClose();

        try {
            const { user_id, ...userData } = selectedUser;

            const res = await api.putUserData(selectedUser.user_id, userData);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('ユーザー情報更新処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('ユーザー情報更新処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }

        setExecuteApiDialogOpen(false);
    };

    /***
     * 
     * 削除ダイアログ
     * 
     */
    // ユーザー情報削除ダイアログを開く
    const handleDeleteDialogOpen = (user: any) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
        onDeleteDialogOpen();
    };

    // ユーザー情報削除ダイアログを閉じる
    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    };

    // ユーザー情報削除処理
    const handleDelete = async () => {

        setExecuteApiDialogOpen(true);
        handleDeleteDialogClose();

        try {
            const res = await api.deleteUserData(selectedUser.user_id);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('ユーザー情報削除処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('ユーザー情報削除処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }

        setExecuteApiDialogOpen(false);
    };

    /***
     * 
     * location_idをキーとするオブジェクトを作成
     * ※所属拠点をIDから拠点名に変換する
     * 
     */
    // const locationMap = locationList.reduce((map: any, location: any) => {
    //     map[location.location_id] = location.location_name;
    //     return map;
    // }, {} as { [key: string]: string });

    // const [selectedLocation, setSelectedLocation] = useState('');

    // const handleSelectChange = (event: SelectChangeEvent<string>) => {
    //     setSelectedUser({ ...selectedUser, location_id: event.target.value });
    // };

    /***
     *
     * 契約書アップロード
     *
     */
    // ファイル名
    const [fileName, setFileName] = useState<string | null>(null);
    // ファイル情報
    const [file, setFile] = useState<File>();
    // ファイルアップロード状況
    const [fileUploaded, setFileUploaded] = useState(false);

    // アップロードしたファイルの情報を保持する
    const handleFileUpload = (files: File[]) => {

        const file = files[0];
        if (file) {
            setFileName(file.name);
            // ファイル名を件名として使用する
            let fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
            setFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                let base64String = reader.result as string;
                // プレフィックスを取り除く
                base64String = base64String.replace(/^data:image\/png;base64,/, '');
                setPreview(reader.result as string);
                setSelectedUser({ ...selectedUser, file: base64String });
            };
            reader.readAsDataURL(file);

            setFileUploaded(true);
        }
    };

    // ドロップされたファイルを処理します。ここでは最初のファイルだけを扱います。
    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleFileUpload(acceptedFiles);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const [preview, setPreview] = useState<string | null>(null);

    return (
        <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: '20px' }}>
                {userList && userList.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', paddingLeft: '1%' }}>
                        {userList.filter((item: any) => item.isRepresentativeSeal === true).map((item: any, index: number) => (
                            <StyledCard key={index} sx={{ width: '48%', margin: '1%', border: '1px solid lightgray' }}>
                                <CardContent sx={{ backgroundColor: '#f0f0f0' }}>
                                    <Box sx={{ height: '220px' }}>
                                        <Box sx={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: "space-between", alignItems: 'center' }}>
                                            <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem', width: '100%' }}>
                                                {item.user_name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ height: '120px' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                                        <Typography color="text.secondary" fontSize="1rem" fontWeight="bold">
                                                            代表印　　　　：{item.file ? '登録済み' : '未登録'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box display="flex" justifyContent="flex-end" >
                                            <Tooltip title="編集">
                                                <IconButton onClick={() => handleEditDialogOpen(item)} aria-label="edit">
                                                    <IconWrapper>
                                                        <EditIcon fontSize="large" sx={{ marginRight: '20px' }} />
                                                    </IconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="削除">
                                                <IconButton onClick={() => handleDeleteDialogOpen(item)} aria-label="delete">
                                                    <DeleteIconWrapper>
                                                        <DeleteIcon fontSize="large" />
                                                    </DeleteIconWrapper>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        ))}
                    </Box>
                ) : (
                    <Typography>登録情報がありません</Typography>
                )}
                {/* ユーザー情報更新ダイアログ */}
                <Modal open={editDialogOpen}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', marginTop: '10%' }}>
                            <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', width: '100%' }}>
                                ユーザー情報を編集
                            </Typography>
                            {selectedUser && (
                                <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray', overflow: 'auto', maxHeight: '70vh' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            name="user_name"
                                            value={selectedUser.user_name}
                                            label="ユーザー名"
                                            variant="standard"
                                            onChange={handleTextFieldChange}
                                            error={!!errors.user_name}
                                            helperText={errors.user_name}
                                            InputProps={{
                                                style: {
                                                    color: 'black',
                                                    paddingLeft: '20px',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                },
                                                inputProps: {
                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                }
                                            }}
                                            sx={{ width: '100%' }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            name="position"
                                            value={selectedUser.position}
                                            label="役職"
                                            variant="standard"
                                            onChange={handleTextFieldChange}
                                            InputProps={{
                                                style: {
                                                    color: 'black',
                                                    paddingLeft: '20px',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                },
                                                inputProps: {
                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                }
                                            }}
                                            sx={{ width: '100%' }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                        <TextField
                                            name="email"
                                            value={selectedUser.email}
                                            label="メールアドレス"
                                            variant="standard"
                                            onChange={handleTextFieldChange}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            InputProps={{
                                                style: {
                                                    color: 'black',
                                                    paddingLeft: '20px',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                },
                                                inputProps: {
                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                }
                                            }}
                                            sx={{ width: '100%' }}
                                        />
                                    </Box>
                                    <Box sx={{ backgroundColor: 'white', paddingTop: '20px', marginBottom: '20px' }}>
                                        <Typography sx={{ borderRadius: '4px', textAlign: 'start', fontSize: '1rem', width: '100%' }}>
                                            代表印
                                        </Typography>
                                        <Box
                                            {...getRootProps()}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100px',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginBottom: '20px',
                                                border: isDragActive ? 'dashed' : 'dotted',
                                                marginLeft: '20px',
                                                marginRight: '20px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => document.getElementById('fileInput')?.click()}
                                        >
                                            <input {...getInputProps()} />
                                            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                                                <br />
                                                ここにファイルをドロップ or クリックしてファイルを選択<br />
                                                （PNG形式のみ）<br /><br />
                                            </Box>
                                            <input
                                                id="fileInput"
                                                type="file"
                                                accept=".png"
                                                onChange={(e) => handleFileUpload(e.target.files ? Array.from(e.target.files) : [])}
                                                style={{ display: 'none' }}
                                            />
                                        </Box>
                                        {/* プレビュー表示エリア */}
                                        {preview ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                <img src={preview} alt="Uploaded preview" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                            </Box>
                                        ) : (
                                            selectedUser.file && (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                    <img src={`data:image/png;base64,${selectedUser.file}`} alt="user" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                                </Box>
                                            )
                                        )}
                                    </Box>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <Button onClick={handleEdit} color="primary" variant="contained" sx={{ marginRight: '10px', width: '10em' }} disabled={!isFormValid}>更新する</Button>
                                <Button onClick={handleEditDialogClose} color="primary" variant="contained" sx={{ width: '10em' }}>閉じる</Button>
                            </Box>
                        </Box>
                    </Box>
                </Modal>
                {/* ユーザー情報削除ダイアログ */}
                <Modal open={deleteDialogOpen}>
                    <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', margin: 'auto', marginTop: '10%' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '10px', fontSize: '1.5rem' }}>
                            以下のユーザーを削除します。よろしいですか？
                        </Typography>
                        <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={selectedUser?.user_name}
                                    label="ユーザー名"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={selectedUser?.position}
                                    label="役職"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={selectedUser?.email}
                                    label="メールアドレス"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box>
                            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    value={locationMap[selectedUser?.location_id] || ''}
                                    label="所属拠点"
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_labelColor}
                                    disabled={true}
                                />
                            </Box> */}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={handleDelete} color="error" variant="contained" sx={{ marginRight: '10px', width: '10em' }}>削除する</Button>
                            <Button onClick={handleDeleteDialogClose} color="primary" variant="contained" sx={{ width: '10em' }}>キャンセル</Button>
                        </Box>
                    </Box>
                </Modal>
            </Box >
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
};

export { CustomDinamicCardForCompany, CustomDinamicCardForLocation, CustomDinamicCardForUser, CustomDinamicCardForRepresentativeSeal };
