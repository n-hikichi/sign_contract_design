import { Box, Button, CssBaseline, SelectChangeEvent, Tab, Tabs, TextField, Typography } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useEffect, useState } from "react";
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CustomPulldownMenu_ForPrefecture } from '../../../components/elements/CustomPulldownMenu';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import api from '../../../utils/apiAccessor';
import dataType from '../../../utils/apiDataType';
import { apiExecutor } from "../../../utils/apiExecutor";
import converter from "../../../utils/converter";
import validationRules from "../../../utils/validationRules";
import ApiProcessingDialog from "../../pages/common/ApiProcessingDialog";
import ErrorDialog from "../../pages/common/ErrorDialog";
import SuccessDialog from "../../pages/common/SuccessDialog";
import Footer from "../../templates/Footer";
import Header from "../../templates/Header";
import NowLoading from "../../templates/NowLoading";
import SideMenu from "../../templates/SideMenu";
import LocationView from "./LocationView";
import RepresentativeSealView from "./RepresentativeSealPage";
import UserView from "./UserView";
import WorkFlowDialog from "./WorkFlowDialog";

// 企業情報の種別
const COMPANYTYPE = 'INTERNAL';
let request_id = '';

// フォームの入力値
interface FormInput {
    company_name: string,
    company_type: string,
    postal_code: string,
    state: string,
    city: string,
    address_line: string,
    building: string
};

/***
 * 
 * 自社情報管理画面
 * 
 */
const CompanyManagePage = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const myValue = location.state?.uuid;

    if (myValue !== undefined && myValue !== null) {
        request_id = location.state.uuid;
    };

    /***
     *
     * React hooks
     *
     */
    const [tabIndex, setTabIndex] = useState<number>(0);

    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);

    // 企業情報
    const [companyInfo, setCompanyInfo] = useState<dataType.CompanyInfo>();
    // 企業登録状況
    const [isCompanyRegistered, setIsCompanyRegistered] = useState(false);

    // 拠点情報
    const [locationInfo, setLocationInfo] = useState<dataType.LocationInfo[]>([]);
    const [locationDataSet, setLocationDataSet] = useState<{ location_id: string; location_name: string }[]>([]);

    // ユーザー情報
    const [userData, setUserData] = useState([]);

    // 承認フロー情報
    const [workflowData, setWorkflow] = useState([]);

    // フォームの入力値
    const { control, setValue, getValues, handleSubmit } = useForm<FormInput>(
        {
            defaultValues: {
                company_name: '',
                company_type: COMPANYTYPE,
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

    // 初回レンダー時の処理
    useEffect(() => {

        // 非同期処理を開始する前にローディング状態をtrueに設定
        setIsLoading(true);

        async function fetchData() {
            try {
                // 企業情報を取得する
                const resultCompanyInfo = await apiExecutor.fetchGetCompanyList(COMPANYTYPE);

                // APIのレスポンスが正常でない場合はエラーダイアログを表示する
                if (resultCompanyInfo.status !== api.HTTP_OK) {
                    console.log("fetchAgreementData(): API response failed. HTTP Status: " + resultCompanyInfo.status);

                    setErrorCode(resultCompanyInfo.status);
                    setErrorProcess('契約書登録　情報取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                const companyInfo = await resultCompanyInfo.json();

                // 登録情報がない場合は処理を終了する
                if (companyInfo.length === 0) {
                    setErrors({ ...errors, company_name: ' ', postal_code: ' ', city: ' ', address_line: ' ' });
                    return;
                };

                // 登録済みの情報がある場合は、フォームに値をセットする
                setCompanyInfo(companyInfo[0]);
                setValue('company_name', companyInfo[0].company_name);
                setValue('postal_code', companyInfo[0].postal_code);
                setValue('state', companyInfo[0].state);
                setValue('city', companyInfo[0].city);
                setValue('address_line', companyInfo[0].address_line);
                setValue('building', companyInfo[0].building);
                setErrors({ ...errors, company_name: '', postal_code: '', city: '', address_line: '', state: '' });

                setIsCompanyRegistered(true);

                // 拠点情報を取得する
                const resultLocationInfo = await apiExecutor.fetchGetLocationList(companyInfo[0].company_id);

                // APIのレスポンスが正常でない場合はエラーダイアログを表示する
                if (resultLocationInfo.status !== api.HTTP_OK) {
                    console.log("fetchAgreementData(): API response failed. HTTP Status: " + resultLocationInfo.status);

                    setErrorCode(resultLocationInfo.status);
                    setErrorProcess('契約書登録　情報取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // 拠点情報を設定
                const locationInfo = await resultLocationInfo.json();
                setLocationInfo(locationInfo);

                // ユーザーの拠点情報と紐づけるために、location_idとlocation_nameの対応付けを行ったデータ作成
                const mappedLocationData = locationInfo.map((location: any) => ({
                    location_id: location.location_id,
                    location_name: location.location_name,
                }));

                setLocationDataSet(mappedLocationData);

                // ユーザー情報を取得する
                const resultUserInfo = await apiExecutor.fetchGetUserData(companyInfo[0].company_id);

                // APIのレスポンスが正常でない場合はエラーダイアログを表示する
                if (resultUserInfo.status !== api.HTTP_OK) {
                    console.log("fetchAgreementData(): API response failed. HTTP Status: " + resultUserInfo.status);

                    setErrorCode(resultUserInfo.status);
                    setErrorProcess('契約書登録　情報取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // ユーザー情報を設定
                const userInfo = await resultUserInfo.json();
                setUserData(userInfo);

                // 承認フロー情報を取得する
                const resultWorkFlowInfo = await apiExecutor.fetchGetApprovalFlowList(companyInfo[0].company_id);

                // APIのレスポンスが正常でない場合はエラーダイアログを表示する
                if (resultWorkFlowInfo.status !== api.HTTP_OK) {
                    console.log("fetchAgreementData(): API response failed. HTTP Status: " + resultWorkFlowInfo.status);

                    setErrorCode(resultWorkFlowInfo.status);
                    setErrorProcess('契約書登録　情報取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // 承認フロー情報を設定
                const workflowInfo = await resultWorkFlowInfo.json();
                setWorkflow(workflowInfo);
            } catch (error) {
                console.error("An error occurred while fetching data:", error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('契約書登録　情報取得処理');
                setExecuteFailedApiDialogOpen(true);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [request_id]);

    /***
     * 
     * 情報画面のタブ切り替え
     * 
     */
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    /***
     * 
     * API実行成功ダイアログ
     * 
     */
    const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
    const handleExecuteSuccessApiDialogClose = () => {
        setExecuteSuccessApiDialogOpen(false);

        const uuid = uuidv4();
        navigate('/manage/company', { state: { uuid: uuid } });
    };

    /***
     * 
     * API処理中ダイアログ
     * 
     */
    // エラーダイアログの開閉状態
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteApiDialogDialog = () => {
        setExecuteApiDialogOpen(true);
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

    // ダイアログを開く関数
    const openExecuteApiErrorDialogDialog = () => {
        setExecuteFailedApiDialogOpen(true);
    };

    /***
     * 
     * 登録処理
     * 
     */
    const onRegister = async () => {

        openExecuteApiDialogDialog();

        try {
            const res = await api.postCompanyData(getValues());
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('自社情報登録');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            const responseBody = await res.json();

            if (isChecked) {
                const companyId = responseBody.company_id;

                const res = await api.postLocationData(companyId, getValues());
                if (res.status !== api.HTTP_OK) {
                    console.log("API response failed. HTTP Status: " + res.status);

                    setErrorCode(res.status);
                    setErrorProcess('拠点登録処理');
                    setExecuteFailedApiDialogOpen(true)
                    return;
                }
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('自社情報登録');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }

    };

    /***
     * 
     * 更新処理
     * 
     */
    const onUpdate = async () => {

        if (companyInfo === undefined) {
            return;
        }

        // 企業情報種別を削除
        const { company_type, ...updatedCompanyData } = getValues();

        openExecuteApiDialogDialog();

        const onSuccess = () => {
            setExecuteSuccessApiDialogOpen(true)
        };

        const onError = (errorCode: any) => {
            setErrorCode(errorCode.toString());
            setErrorProcess('自社情報更新');
            openExecuteApiErrorDialogDialog();
        };

        await apiExecutor.executeApiRequest(
            () => api.putCompanyData(companyInfo.company_id, updatedCompanyData),
            onSuccess,
            onError
        );

        setExecuteApiDialogOpen(false);
    };

    /***
     *
     * 郵便番号入力フォーマット
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

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                    <Header />
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <SideMenu />
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <Box sx={{ marginLeft: '5%', marginRight: '5%' }}>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', width: '100%' }}>
                                    自社情報管理
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                                    {isCompanyRegistered === true ? (
                                        <Tabs value={tabIndex} onChange={handleTabChange}>
                                            <Tab label="企業情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                            <Tab label="拠点情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                            <Tab label="ユーザー情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                            <Tab label="代表印情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                            <Tab label="承認フロー" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                        </Tabs>
                                    ) : (
                                        <Tabs value={tabIndex} onChange={handleTabChange}>
                                            <Tab label="企業情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                        </Tabs>
                                    )}
                                </Box>
                                <Box>
                                    {isCompanyRegistered === true ? (
                                        <>
                                            {tabIndex === 0 && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '5px' }}>
                                                        <Button variant='contained' size='large' onClick={() => onUpdate()} disabled={!isFormValid}>更新する</Button>
                                                    </Box>
                                                    <Box sx={{ marginBottom: '20px', bgcolor: 'white', padding: '30px', border: '1px solid lightgrey' }} >
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <TextField
                                                                name="company_name"
                                                                label="企業名"
                                                                variant="standard"
                                                                placeholder="株式会社ブロックチェーン電子契約"
                                                                value={getValues().company_name}
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
                                                                value={getValues().postal_code}
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
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <TextField
                                                                name="city"
                                                                label="市区町村"
                                                                variant="standard"
                                                                placeholder="○○市"
                                                                value={getValues().city}
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
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <TextField
                                                                name="address_line"
                                                                label="町名番地"
                                                                variant="standard"
                                                                placeholder="○○町1-2-3"
                                                                value={getValues().address_line}
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
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                            <TextField
                                                                name="building"
                                                                label="建物名・部屋番号"
                                                                variant="standard"
                                                                placeholder="○○ビル"
                                                                value={getValues().building}
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
                                                </Box>
                                            )}
                                            {tabIndex === 1 && <LocationView companyInfo={companyInfo} locationInfo={locationInfo} />}
                                            {tabIndex === 2 && <UserView companyInfo={companyInfo} locationMappedData={locationDataSet} userInfo={userData} />}
                                            {tabIndex === 3 && <RepresentativeSealView companyInfo={companyInfo} locationMappedData={locationDataSet} userInfo={userData} />}
                                            {tabIndex === 4 && <WorkFlowDialog companyInfo={companyInfo} locationMappedData={locationDataSet} userInfo={userData} workflowInfo={workflowData} />}
                                        </>
                                    ) : (
                                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', width: '100%', marginBottom: '20px' }}>
                                                <Typography sx={{ color: 'darkred', fontSize: '1.2em', fontWeight: 'bold', width: '70%' }}>登録情報がありません。始めに企業情報を登録してください。</Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '30%' }}>
                                                    <Button variant='contained' size='large' onClick={handleSubmit(onRegister)} disabled={!isFormValid}>登録する</Button>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <Box sx={{ marginBottom: '20px', bgcolor: 'white', padding: '20px' }} >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                        <TextField
                                                            name="company_name"
                                                            label="企業名"
                                                            variant="standard"
                                                            placeholder="株式会社ブロックチェーン電子契約"
                                                            value={getValues().company_name}
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
                                                            value={getValues().postal_code}
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                        <TextField
                                                            name="city"
                                                            label="市区町村"
                                                            variant="standard"
                                                            placeholder="○○市"
                                                            value={getValues().city}
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                                        <TextField
                                                            name="address_line"
                                                            label="町名番地"
                                                            variant="standard"
                                                            placeholder="○○町1-2-3"
                                                            value={getValues().address_line}
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
                                                        <TextField
                                                            name="building"
                                                            label="建物名・部屋番号"
                                                            variant="standard"
                                                            placeholder="○○ビル"
                                                            value={getValues().building}
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
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}

export default CompanyManagePage;