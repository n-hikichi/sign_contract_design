import { Box, Button, Dialog, DialogActions, DialogContent, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import api from "../../utils/apiAccessor";
import converter from "../../utils/converter";
import validationRules from "../../utils/validationRules";
import { CustomPulldownMenu_ForPrefecture } from '../elements/CustomPulldownMenu';
import EdocButton from "../elements/EdocButton";
import ApiProcessingDialog from "../pages/common/ApiProcessingDialog";
import ErrorDialog from "../pages/common/ErrorDialog";
import SuccessDialog, { SettingsSuccessDialog } from "../pages/common/SuccessDialog";
import ValidationTextForm from "../pages/common/ValidationTextForm";
import { readOnlyTextFieldStyle, readOnlyTextFieldStyle_labelColor } from '../../styles/fontStyles';
import { useNavigate } from 'react-router-dom';

/***
 * 
 * 拠点情報登録フォーム
 * 
 */
const RegisterLocationDialog = (props: any) => {

    const navigate = useNavigate();

    const { control, handleSubmit, getValues, setValue } = useForm(
        {
            defaultValues: {
                company_name: props.companyInfo.company_name,
                location_name: '',
                postal_code: '',
                state: 'default',
                city: '',
                address_line: '',
                building: '',
            }
        }
    );

    const [isFormValid, setIsFormValid] = useState(false);

    const [errors, setErrors] = useState({
        location_name: ` `,
        postal_code: ` `,
        city: ` `,
        address_line: ` `,
    });

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    const fieldNamesInJapanese: { [key: string]: string } = {
        location_name: '拠点名',
        postal_code: '郵便番号',
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

        if (name === 'building') {
            setValue(name, value);
        }

        if (name === 'location_name' || name === 'city' || name === 'address_line') {
            setValue(name, value);

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

    /***
     * 
     * 郵便番号 フォーマット処理
     * 
     */
    const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // バリデーションチェック
        const error = validatePostalCode(event.target.value);
        setErrors({ ...errors, postal_code: error });

        event.target.value = converter.postalCodeConverter(event.target.value);
        setValue('postal_code', event.target.value);
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
     * 登録処理
     * 
     */
    const onSubmit = async (data: any) => {

        setExecuteApiDialogOpen(true);

        try {
            const res = await api.postLocationData(props.companyInfo.company_id, getValues());
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('拠点登録処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('拠点登録処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    /***
     * 
     * 拠点情報登録ダイアログを閉じる
     * 
     */
    const onClose = async () => {
        props.setDialogOpen(false);
    };

    /***
     * 
     * 企業情報登録ダイアログを閉じる
     * 
     */
    const closeRegisterLocationDialog = async () => {
        props.setDialogOpen(false);
        navigate('/manage/clientCompanyLocation', { state: { customerData: props.companyInfo } });
    };

    return (
        <>
            <Dialog open={true} fullWidth maxWidth='md'>
                <Box sx={{ bgcolor: 'grey.200' }}>
                    <Box sx={{ width: '100%' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '20px', fontSize: '1.5rem' }}>
                            新規に登録する企業情報を入力してください
                        </Typography>
                    </Box>
                    <DialogContent sx={{ bgcolor: 'white', marginLeft: '20px', marginRight: '20px', border: '1px solid lightgray' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginTop: '20px', marginBottom: '10px' }}>
                            <TextField
                                name="company_name"
                                value={getValues().company_name}
                                label="企業名"
                                variant="standard"
                                sx={readOnlyTextFieldStyle_labelColor}
                                disabled={true}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '10px' }}>
                            <TextField
                                name="location_name"
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                            <TextField
                                name="postal_code"
                                label="郵便番号"
                                variant="standard"
                                placeholder="123-4567"
                                sx={{ width: '100%' }}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    style: {
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        paddingLeft: '20px'
                                    },
                                    inputProps: {
                                        maxLength: validationRules.POSTAL_CODE_LENGTH // 最大文字数を設定
                                    }
                                }}
                                onChange={handlePostalCodeChange}
                                error={!!errors.postal_code}
                                helperText={errors.postal_code}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                            <Controller
                                name="state"
                                control={control}
                                render={({ field }) => (
                                    <CustomPulldownMenu_ForPrefecture
                                        value={field.value}
                                        onChange={field.onChange as (event: SelectChangeEvent<string>) => void}
                                    />
                                )}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '10px' }}>
                            <TextField
                                name="city"
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '10px' }}>
                            <TextField
                                name="address_line"
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '10px' }}>
                            <TextField
                                name="building"
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
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Button onClick={handleSubmit(onSubmit)} color="primary" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} disabled={!isFormValid}>登録する</Button>
                            <EdocButton text='キャンセル' variant='contained' handleClick={onClose} />
                        </Box>
                    </DialogActions>
                </Box>
            </Dialog>
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SettingsSuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} handleCloseModalDialog={closeRegisterLocationDialog} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
}

export default RegisterLocationDialog;