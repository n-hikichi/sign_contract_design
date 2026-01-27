import { Box, Button, CssBaseline, SelectChangeEvent, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomPulldownMenu_ForPrefecture } from '../../../components/elements/CustomPulldownMenu';
import api from '../../../utils/apiAccessor';
import dataType from '../../../utils/apiDataType';
import { apiExecutor } from '../../../utils/apiExecutor';
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
import UserView from "./UserView";
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import RepresentativeSealView from "./RepresentativeSealPage";
import WorkFlowDialog from "./WorkFlowDialog";

// フォームの入力値
interface FormInput {
    company_name: string,
    postal_code: string,
    state: string,
    city: string,
    address_line: string,
    building: string
};

const CompanyManagePage = () => {
    const navigate = useNavigate();

    // 承認フローを開始した契約書の情報を取得する
    const location = useLocation();
    const customerData = location.state.customerData;

    const [tabIndex, setTabIndex] = useState<number>(0);

    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);

    // 更新後の企業情報
    const [companyInfo, setCompanyInfo] = useState<dataType.CompanyInfo[]>([]);

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
                company_name: customerData.company_name,
                postal_code: customerData.postal_code,
                state: customerData.state,
                city: customerData.city,
                address_line: customerData.address_line,
                building: customerData.building,
            }
        }
    );

    const [isFormValid, setIsFormValid] = useState(false);

    const [errors, setErrors] = useState({
        company_name: ``,
        postal_code: ``,
        city: ``,
        address_line: ``,
        building: ``,
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
            setErrors({ ...errors, [name]: '' });
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
        return '';
    };

    // 初回レンダー時の処理
    useEffect(() => {

        // 非同期処理を開始する前にローディング状態をtrueに設定
        setIsLoading(true);

        async function fetchData() {
            try {
                // 拠点情報を取得する
                const resultLocationInfo = await apiExecutor.fetchGetLocationList(customerData.company_id);
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

                // ユーザーの拠点情報と紐づけるために、location_idとlocation_nameの対応付けを行ったデータを用意する
                const mappedLocationData = locationInfo.map((location: any) => ({
                    location_id: location.location_id,
                    location_name: location.location_name,
                }));

                setLocationDataSet(mappedLocationData);

                // ユーザー情報を取得する
                const resultUserInfo = await apiExecutor.fetchGetUserData(customerData.company_id);

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
                const resultWorkFlowInfo = await apiExecutor.fetchGetApprovalFlowList(customerData.company_id);

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
    }, [customerData]);

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
        navigate('/manage/clientCompanyLocation', { state: { customerData: companyInfo } });
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
     * 更新処理
     * 
     */
    const onUpdate = async () => {

        if (customerData === undefined) {
            return;
        }

        openExecuteApiDialogDialog();

        try {
            const res = await api.putCompanyData(customerData.company_id, getValues());
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('相手方企業情報更新');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            const updatedCompanyInfo = await res.json();
            setCompanyInfo(updatedCompanyInfo);

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('相手方企業情報更新');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }

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
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '50px', fontSize: '1.5rem', width: '100%' }}>
                                    {customerData.company_name}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="管理タブ">
                                        <Tab label="企業情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                        <Tab label="拠点情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                        <Tab label="ユーザー情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                        <Tab label="代表印情報" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                        <Tab label="承認フロー" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                                    </Tabs>
                                </Box>
                                <Box>
                                    {tabIndex === 0 &&
                                        <>
                                            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                                    <Button variant='contained' size='large' onClick={() => onUpdate()} disabled={!isFormValid}>更新する</Button>
                                                </Box>
                                            </Box>
                                            <Box bgcolor='white' sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1, marginBottom: '20px', padding: '20px', border: '1px solid lightgray' }}>
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
                                                        autoComplete="off"
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
                                                                onChange={field.onChange as (event: SelectChangeEvent<string>) => void}
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
                                        </>
                                    }
                                    {tabIndex === 1 && <LocationView companyInfo={customerData} locationInfo={locationInfo} />}
                                    {tabIndex === 2 && <UserView companyInfo={customerData} locationMappedData={locationDataSet} userInfo={userData} />}
                                    {tabIndex === 3 && <RepresentativeSealView companyInfo={customerData} locationMappedData={locationDataSet} userInfo={userData} />}
                                    {tabIndex === 4 && <WorkFlowDialog companyInfo={customerData} locationMappedData={locationDataSet} userInfo={userData} workflowInfo={workflowData} />}
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