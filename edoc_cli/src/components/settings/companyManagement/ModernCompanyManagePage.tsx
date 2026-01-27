/**
 * ModernCompanyManagePage - モダナイズされた自社情報管理画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 * タブ構成：企業情報、拠点情報、ユーザー情報、代表印情報、承認フロー
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  FormControlLabel,
  Checkbox,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import {
  Business,
  LocationOn,
  People,
  Approval,
  Badge,
  Save,
  Add,
} from '@mui/icons-material';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import { CustomPulldownMenuForPrefecture } from '../../elements/CustomPulldownMenu';
import api from '../../../utils/apiAccessor';
import dataType from '../../../utils/apiDataType';
import { apiExecutor } from '../../../utils/apiExecutor';
import validationRules from '../../../utils/validationRules';
import converter from '../../../utils/converter';
import ApiProcessingDialog from '../../pages/common/ApiProcessingDialog';
import ErrorDialog from '../../pages/common/ErrorDialog';
import SuccessDialog from '../../pages/common/SuccessDialog';
import LocationView from './LocationView';
import RepresentativeSealView from './RepresentativeSealPage';
import UserView from './UserView';
import WorkFlowDialog from './WorkFlowDialog';

// 企業情報の種別
const COMPANYTYPE = 'INTERNAL';
let request_id = '';

// フォームの入力値
interface FormInput {
  company_name: string;
  company_type: string;
  postal_code: string;
  state: string;
  city: string;
  address_line: string;
  building: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * ModernCompanyManagePage コンポーネント
 */
const ModernCompanyManagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const myValue = location.state?.uuid;

  if (myValue !== undefined && myValue !== null) {
    request_id = location.state.uuid;
  }

  // React hooks
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // 企業情報
  const [companyInfo, setCompanyInfo] = useState<dataType.CompanyInfo>();
  const [isCompanyRegistered, setIsCompanyRegistered] = useState(false);

  // 拠点情報
  const [locationInfo, setLocationInfo] = useState<dataType.LocationInfo[]>([]);
  const [locationDataSet, setLocationDataSet] = useState<
    { location_id: string; location_name: string }[]
  >([]);

  // ユーザー情報
  const [userData, setUserData] = useState([]);

  // 承認フロー情報
  const [workflowData, setWorkflow] = useState([]);

  // フォームの入力値
  const { control, setValue, getValues, handleSubmit } = useForm<FormInput>({
    defaultValues: {
      company_name: '',
      company_type: COMPANYTYPE,
      postal_code: '',
      state: 'default',
      city: '',
      address_line: '',
      building: '',
    },
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    company_name: ' ',
    postal_code: ' ',
    city: ' ',
    address_line: ' ',
    state: ' ',
  });

  useEffect(() => {
    const isValid = Object.values(errors).every((error) => error === '');
    setIsFormValid(isValid);
  }, [errors]);

  const fieldNamesInJapanese: { [key: string]: string } = {
    company_name: '企業名',
    postal_code: '郵便番号',
    city: '市区町村',
    address_line: '町名番地',
    state: '都道府県',
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    setLoading(true);

    async function fetchData() {
      try {
        const resultCompanyInfo = await apiExecutor.fetchGetCompanyList(COMPANYTYPE);

        if (resultCompanyInfo.status !== api.HTTP_OK) {
          console.log(
            'fetchAgreementData(): API response failed. HTTP Status: ' +
              resultCompanyInfo.status
          );
          setErrorCode(resultCompanyInfo.status);
          setErrorProcess('契約書登録　情報取得処理');
          setExecuteFailedApiDialogOpen(true);
          return;
        }

        const companyInfo = await resultCompanyInfo.json();

        if (companyInfo.length === 0) {
          setErrors({
            ...errors,
            company_name: ' ',
            postal_code: ' ',
            city: ' ',
            address_line: ' ',
          });
          return;
        }

        setCompanyInfo(companyInfo[0]);
        setValue('company_name', companyInfo[0].company_name);
        setValue('postal_code', companyInfo[0].postal_code);
        setValue('state', companyInfo[0].state);
        setValue('city', companyInfo[0].city);
        setValue('address_line', companyInfo[0].address_line);
        setValue('building', companyInfo[0].building);
        setErrors({
          ...errors,
          company_name: '',
          postal_code: '',
          city: '',
          address_line: '',
          state: '',
        });
        setIsCompanyRegistered(true);

        // 拠点情報を取得
        const resultLocationInfo = await apiExecutor.fetchGetLocationList(
          companyInfo[0].company_id
        );

        if (resultLocationInfo.status !== api.HTTP_OK) {
          setErrorCode(resultLocationInfo.status);
          setErrorProcess('契約書登録　情報取得処理');
          setExecuteFailedApiDialogOpen(true);
          return;
        }

        const locationInfo = await resultLocationInfo.json();
        setLocationInfo(locationInfo);

        const mappedLocationData = locationInfo.map((loc: dataType.LocationInfo) => ({
          location_id: loc.location_id,
          location_name: loc.location_name,
        }));
        setLocationDataSet(mappedLocationData);

        // ユーザー情報を取得
        const resultUserInfo = await apiExecutor.fetchGetUserData(
          companyInfo[0].company_id
        );

        if (resultUserInfo.status !== api.HTTP_OK) {
          setErrorCode(resultUserInfo.status);
          setErrorProcess('契約書登録　情報取得処理');
          setExecuteFailedApiDialogOpen(true);
          return;
        }

        const userInfo = await resultUserInfo.json();
        setUserData(userInfo);

        // 承認フロー情報を取得
        const resultWorkFlowInfo = await apiExecutor.fetchGetApprovalFlowList(
          companyInfo[0].company_id
        );

        if (resultWorkFlowInfo.status !== api.HTTP_OK) {
          setErrorCode(resultWorkFlowInfo.status);
          setErrorProcess('契約書登録　情報取得処理');
          setExecuteFailedApiDialogOpen(true);
          return;
        }

        const workflowInfo = await resultWorkFlowInfo.json();
        setWorkflow(workflowInfo);
      } catch (error) {
        console.error('An error occurred while fetching data:', error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('契約書登録　情報取得処理');
        setExecuteFailedApiDialogOpen(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request_id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // API実行成功ダイアログ
  const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
  const handleExecuteSuccessApiDialogClose = () => {
    setExecuteSuccessApiDialogOpen(false);
    const uuid = uuidv4();
    navigate('/manage/company', { state: { uuid: uuid } });
  };

  // API処理中ダイアログ
  const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
  const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);
  const openExecuteApiDialogDialog = () => setExecuteApiDialogOpen(true);

  // API実行失敗ダイアログ
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');
  const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
  const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);
  const openExecuteApiErrorDialogDialog = () => setExecuteFailedApiDialogOpen(true);

  // チェックボックスの状態
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  // 登録処理
  const onRegister = async () => {
    openExecuteApiDialogDialog();

    try {
      const res = await api.postCompanyData(getValues());
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('自社情報登録');
        setExecuteFailedApiDialogOpen(true);
        return;
      }

      const responseBody = await res.json();

      if (isChecked) {
        const companyId = responseBody.company_id;
        const res = await api.postLocationData(companyId, getValues());
        if (res.status !== api.HTTP_OK) {
          setErrorCode(res.status);
          setErrorProcess('拠点登録処理');
          setExecuteFailedApiDialogOpen(true);
          return;
        }
      }

      setExecuteSuccessApiDialogOpen(true);
    } catch (error) {
      console.error('onRegister: An unexpected error has occurred.', error);
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('自社情報登録');
      setExecuteFailedApiDialogOpen(true);
    } finally {
      setExecuteApiDialogOpen(false);
    }
  };

  // 更新処理
  const onUpdate = async () => {
    if (companyInfo === undefined) return;

    const { company_type, ...updatedCompanyData } = getValues();
    openExecuteApiDialogDialog();

    const onSuccess = () => setExecuteSuccessApiDialogOpen(true);
    const onError = (errorCode: number) => {
      setErrorCode(errorCode);
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

  // 郵便番号入力フォーマット
  const handlePostalCodeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const error = validatePostalCode(event.target.value);
    setErrors({ ...errors, postal_code: error });
    event.target.value = converter.postalCodeConverter(event.target.value);
    setValue('postal_code', event.target.value);
  };

  const validatePostalCode = (value: string) => {
    if (!value) return '郵便番号は必須です。';
    if (!/^\d{3}-\d{4}$/.test(value)) {
      return '郵便番号は必須です。XXX-XXXXの形式で入力してください';
    }
    return '';
  };

  const tabItems = isCompanyRegistered
    ? [
        { label: '企業情報', icon: <Business /> },
        { label: '拠点情報', icon: <LocationOn /> },
        { label: 'ユーザー情報', icon: <People /> },
        { label: '代表印情報', icon: <Badge /> },
        { label: '承認フロー', icon: <Approval /> },
      ]
    : [{ label: '企業情報', icon: <Business /> }];

  return (
    <ModernPageLayout
      loading={loading}
      title="自社情報管理"
      subtitle="自社の企業情報、拠点、ユーザー、承認フローを管理します"
      breadcrumbs={[
        { label: '企業・ユーザー管理' },
        { label: '自社情報管理' },
      ]}
    >
      {/* タブナビゲーション */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              py: 2,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {tabItems.map((item, index) => (
            <Tab
              key={index}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              id={`company-tab-${index}`}
              aria-controls={`company-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </div>

      {/* 企業情報タブ */}
      <TabPanel value={tabIndex} index={0}>
        {!isCompanyRegistered && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50
                          border border-amber-200 rounded-xl">
            <Typography
              sx={{ color: 'error.dark', fontSize: '1.1em', fontWeight: 'bold' }}
            >
              登録情報がありません。始めに企業情報を登録してください。
            </Typography>
          </div>
        )}

        <ContentCard
          title="基本情報"
          subtitle="企業の基本的な情報を入力・編集します"
          actions={
            isCompanyRegistered ? (
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => onUpdate()}
                disabled={!isFormValid}
                sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
              >
                更新する
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleSubmit(onRegister)}
                disabled={!isFormValid}
                sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
              >
                登録する
              </Button>
            )
          }
        >
          <div className="space-y-4">
            <TextField
              name="company_name"
              label="企業名"
              variant="outlined"
              fullWidth
              placeholder="株式会社ブロックチェーン電子契約"
              value={getValues().company_name}
              onChange={handleTextFieldChange}
              error={!!errors.company_name.trim()}
              helperText={errors.company_name}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <TextField
              name="postal_code"
              label="郵便番号"
              variant="outlined"
              fullWidth
              placeholder="123-4567"
              value={getValues().postal_code}
              onChange={handlePostalCodeChange}
              error={!!errors.postal_code.trim()}
              helperText={errors.postal_code}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.POSTAL_CODE_LENGTH,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <CustomPulldownMenuForPrefecture
                  value={field.value}
                  onChange={(event: SelectChangeEvent<string>) => {
                    field.onChange(event);
                    const error = validateTextField('state', event.target.value);
                    setErrors({ ...errors, state: error });
                  }}
                  error={!!errors.state.trim()}
                  helperText={errors.state}
                />
              )}
            />

            <TextField
              name="city"
              label="市区町村"
              variant="outlined"
              fullWidth
              placeholder="○○市"
              value={getValues().city}
              onChange={handleTextFieldChange}
              error={!!errors.city.trim()}
              helperText={errors.city}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <TextField
              name="address_line"
              label="町名番地"
              variant="outlined"
              fullWidth
              placeholder="○○町1-2-3"
              value={getValues().address_line}
              onChange={handleTextFieldChange}
              error={!!errors.address_line.trim()}
              helperText={errors.address_line}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <TextField
              name="building"
              label="建物名・部屋番号"
              variant="outlined"
              fullWidth
              placeholder="○○ビル"
              value={getValues().building}
              onChange={handleTextFieldChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            {!isCompanyRegistered && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: 'error.dark',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    }}
                  >
                    この情報を拠点情報として登録する
                  </Typography>
                }
              />
            )}
          </div>
        </ContentCard>
      </TabPanel>

      {/* 拠点情報タブ */}
      <TabPanel value={tabIndex} index={1}>
        <LocationView companyInfo={companyInfo} locationInfo={locationInfo} />
      </TabPanel>

      {/* ユーザー情報タブ */}
      <TabPanel value={tabIndex} index={2}>
        <UserView
          companyInfo={companyInfo}
          locationMappedData={locationDataSet}
          userInfo={userData}
        />
      </TabPanel>

      {/* 代表印情報タブ */}
      <TabPanel value={tabIndex} index={3}>
        <RepresentativeSealView
          companyInfo={companyInfo}
          locationMappedData={locationDataSet}
          userInfo={userData}
        />
      </TabPanel>

      {/* 承認フロータブ */}
      <TabPanel value={tabIndex} index={4}>
        <WorkFlowDialog
          companyInfo={companyInfo}
          locationMappedData={locationDataSet}
          userInfo={userData}
          workflowInfo={workflowData}
        />
      </TabPanel>

      {/* ダイアログ */}
      <ApiProcessingDialog
        open={executeApiDialog}
        handleClose={handleExecuteApiDialogClose}
      />
      <SuccessDialog
        open={executeSuccessApiDialog}
        handleClose={handleExecuteSuccessApiDialogClose}
      />
      <ErrorDialog
        open={executeFailedApiDialog}
        handleClose={handleExecuteFailedApiDialogClose}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
    </ModernPageLayout>
  );
};

export default ModernCompanyManagePage;
