import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import api from "../../utils/apiAccessor";
import ApiProcessingDialog from "../pages/common/ApiProcessingDialog";
import ErrorDialog from "../pages/common/ErrorDialog";
import SuccessDialog, { SettingsSuccessDialog } from "../pages/common/SuccessDialog";
import converter from "../../utils/converter";
import validationRules from "../../utils/validationRules";
import { CustomPulldownMenu_ForPrefecture, prefecture } from '../elements/CustomPulldownMenu';
import EdocButton from "../elements/EdocButton";
import { useNavigate } from 'react-router-dom';
import ValidationTextForm from "../pages/common/ValidationTextForm";
import { readOnlyTextFieldStyle } from '../../styles/fontStyles';
import { v4 as uuidv4 } from 'uuid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

/***
 * 
 * 企業情報登録フォーム
 * 
 */
const RegisterCompanyDialog = (props: any) => {

    const navigate = useNavigate();

    const { control, handleSubmit, getValues, setValue } = useForm(
        {
            defaultValues: {
                company_name: '',
                company_type: props.attribute,
                postal_code: '',
                state: prefecture.find((pref) => pref.value === 'default')?.value || '',
                city: '',
                address_line: '',
                building: '',
            }
        }
    );

    const [isFormValid, setIsFormValid] = useState(false);

    const [errors, setErrors] = useState({
        company_name: ` `,
        postal_code: ` `,
        city: ` `,
        address_line: ` `,
        state: ` `,
    });

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    const fieldNamesInJapanese: { [key: string]: string } = {
        company_name: '企業名',
        postal_code: '郵便番号',
        city: '市区町村',
        address_line: '町名番地',
        state: '都道府県',
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

        if (name === 'company_name' || name === 'city' || name === 'address_line') {
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

        if (name === 'state' && value === 'default') {
            return `${fieldName}を選択してください。`;
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
    const onSubmit = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const res = await api.postCompanyData(getValues());
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('企業登録処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            };

            const responseBody = await res.json();

            if (isChecked) {
                const companyId = responseBody.company_id;

                // 必要なデータを抽出し、location_nameを追加
                const locationData = {
                    company_name: responseBody.company_name,
                    location_name: responseBody.company_name, // location_nameをcompany_nameから設定
                    postal_code: responseBody.postal_code,
                    state: responseBody.state,
                    city: responseBody.city,
                    address_line: responseBody.address_line,
                    building: responseBody.building,
                };

                const res = await api.postLocationData(companyId, locationData);
                if (res.status !== api.HTTP_OK) {
                    console.log("API response failed. HTTP Status: " + res.status);

                    setErrorCode(res.status);
                    setErrorProcess('拠点登録処理');
                    setExecuteFailedApiDialogOpen(true)
                    return;
                };
            };

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('企業登録処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    /**
     * 承認ボタン
     * 
     */
    // チェックボックスの状態を管理する
    const [isChecked, setIsChecked] = useState(false);

    // 承認者情報に関する処理
    // チェックボックスの状態を更新する
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    /***
     * 
     * 企業情報登録ダイアログを閉じる
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
    const closeRegisterCompanyDialog = async () => {
        props.setDialogOpen(false);

        const uuid = uuidv4();
        navigate('/manage/clientCompany', { state: { uuid: uuid } });
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
                    <DialogContent sx={{ bgcolor: 'white', marginLeft: '20px', marginRight: '20px', border: '1px solid lightgrey' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '10px' }}>
                            <TextField
                                name="company_name"
                                label="企業名"
                                variant="standard"
                                placeholder="株式会社ブロックチェーン電子契約"
                                onChange={handleTextFieldChange}
                                error={!!errors.company_name}
                                helperText={errors.company_name}
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
                                        onChange={(event: SelectChangeEvent<string>) => {
                                            field.onChange(event); // React Hook Formの値を更新
                                            const error = validateTextField('state', event.target.value); // バリデーションを実行
                                            setErrors({ ...errors, state: error }); // エラーメッセージを設定
                                        }}
                                        error={!!errors.state} // エラー状態を渡す
                                        helperText={errors.state} // エラーメッセージを渡す
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isChecked}
                                    onChange={handleCheckboxChange}
                                />}
                            label={
                                <Typography sx={{ display: 'inline-flex', alignItems: 'center', color: 'darkred', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    この情報を拠点情報として登録する
                                </Typography>
                            }
                        />
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
            <SettingsSuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} handleCloseModalDialog={closeRegisterCompanyDialog} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
}

export default RegisterCompanyDialog;