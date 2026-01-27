/**
 * ModernCompanyLocationManagePage - モダナイズされた相手方企業詳細管理画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 * 相手方企業（顧客企業）の詳細情報管理（タブ形式）
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Tab,
  Tabs,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import {
  Business,
  LocationOn,
  People,
  VerifiedUser,
  AccountTree,
  Save,
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import { CustomPulldownMenuForPrefecture } from '../../elements/CustomPulldownMenu';
import api from '../../../utils/apiAccessor';
import dataType from '../../../utils/apiDataType';
import { apiExecutor } from '../../../utils/apiExecutor';
import converter from '../../../utils/converter';
import validationRules from '../../../utils/validationRules';
import ApiProcessingDialog from '../../pages/common/ApiProcessingDialog';
import ErrorDialog from '../../pages/common/ErrorDialog';
import SuccessDialog from '../../pages/common/SuccessDialog';
import LocationView from './LocationView';
import UserView from './UserView';
import RepresentativeSealView from './RepresentativeSealPage';
import WorkFlowDialog from './WorkFlowDialog';

// フォームの入力値
interface FormInput {
  company_name: string;
  postal_code: string;
  state: string;
  city: string;
  address_line: string;
  building: string;
}

// タブパネルProps
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// タブパネルコンポーネント
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`clientcompany-tabpanel-${index}`}
    aria-labelledby={`clientcompany-tab-${index}`}
  >
    {value === index && <div className="pt-0">{children}</div>}
  </div>
);

/**
 * ModernCompanyLocationManagePage コンポーネント
 */
const ModernCompanyLocationManagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const customerData = location.state?.customerData;

  // タブ状態
  const [tabIndex, setTabIndex] = useState<number>(0);

  // ローディング状態
  const [loading, setLoading] = useState(true);

  // 更新後の企業情報
  const [companyInfo, setCompanyInfo] = useState<dataType.CompanyInfo[]>([]);

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
  const { control, setValue, getValues } = useForm<FormInput>({
    defaultValues: {
      company_name: customerData?.company_name || '',
      postal_code: customerData?.postal_code || '',
      state: customerData?.state || '',
      city: customerData?.city || '',
      address_line: customerData?.address_line || '',
      building: customerData?.building || '',
    },
  });

  const [isFormValid, setIsFormValid] = useState(true);

  const [errors, setErrors] = useState({
    company_name: '',
    postal_code: '',
    city: '',
    address_line: '',
    building: '',
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
  };

  // テキストフィールド変更処理
  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  // 郵便番号入力フォーマット
  const handlePostalCodeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  // 初回レンダー時の処理
  useEffect(() => {
    if (!customerData) {
      navigate('/manage/clientCompany');
      return;
    }

    setLoading(true);

    async function fetchData() {
      try {
        // 拠点情報を取得
        const resultLocationInfo = await apiExecutor.fetchGetLocationList(
          customerData.company_id
        );
        if (resultLocationInfo.status !== api.HTTP_OK) {
          setErrorCode(resultLocationInfo.status);
          setErrorProcess('契約書登録　情報取得処理');
          setExecuteFailedApiDialogOpen(true);
          return;
        }

        const locationInfoData = await resultLocationInfo.json();
        setLocationInfo(locationInfoData);

        const mappedLocationData = locationInfoData.map((loc: dataType.LocationInfo) => ({
          location_id: loc.location_id,
          location_name: loc.location_name,
        }));
        setLocationDataSet(mappedLocationData);

        // ユーザー情報を取得
        const resultUserInfo = await apiExecutor.fetchGetUserData(
          customerData.company_id
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
          customerData.company_id
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
  }, [customerData, navigate]);

  // タブ切り替え
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // API実行成功ダイアログ
  const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
  const handleExecuteSuccessApiDialogClose = () => {
    setExecuteSuccessApiDialogOpen(false);
    navigate('/manage/clientCompanyLocation', { state: { customerData: companyInfo } });
  };

  // API処理中ダイアログ
  const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
  const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

  // API実行失敗ダイアログ
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');
  const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
  const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

  // 更新処理
  const onUpdate = async () => {
    if (!customerData) return;

    setExecuteApiDialogOpen(true);

    try {
      const res = await api.putCompanyData(customerData.company_id, getValues());
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('相手方企業情報更新');
        setExecuteFailedApiDialogOpen(true);
        return;
      }

      const updatedCompanyInfo = await res.json();
      setCompanyInfo(updatedCompanyInfo);
      setExecuteSuccessApiDialogOpen(true);
    } catch (error) {
      console.error('Update error:', error);
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('相手方企業情報更新');
      setExecuteFailedApiDialogOpen(true);
    } finally {
      setExecuteApiDialogOpen(false);
    }
  };

  // タブアイコン
  const tabIcons = [
    <Business key="business" />,
    <LocationOn key="location" />,
    <People key="people" />,
    <VerifiedUser key="seal" />,
    <AccountTree key="workflow" />,
  ];

  return (
    <ModernPageLayout
      loading={loading}
      title={customerData?.company_name || '相手方企業'}
      subtitle="企業情報・拠点・ユーザー・代表印・承認フローを管理します"
      breadcrumbs={[
        { label: '企業・ユーザー管理' },
        { label: '相手方情報管理', path: '/manage/clientCompany' },
        { label: customerData?.company_name || '詳細' },
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
          <Tab icon={tabIcons[0]} iconPosition="start" label="企業情報" />
          <Tab icon={tabIcons[1]} iconPosition="start" label="拠点情報" />
          <Tab icon={tabIcons[2]} iconPosition="start" label="ユーザー情報" />
          <Tab icon={tabIcons[3]} iconPosition="start" label="代表印情報" />
          <Tab icon={tabIcons[4]} iconPosition="start" label="承認フロー" />
        </Tabs>
      </div>

      {/* 企業情報タブ */}
      <TabPanel value={tabIndex} index={0}>
        <ContentCard
          title="基本情報"
          subtitle="企業の基本的な情報を編集します"
          actions={
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={onUpdate}
              disabled={!isFormValid}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 3,
                py: 1.25,
              }}
            >
              更新する
            </Button>
          }
        >
          <div className="space-y-5">
            <TextField
              name="company_name"
              label="企業名"
              variant="outlined"
              fullWidth
              placeholder="株式会社ブロックチェーン電子契約"
              value={getValues().company_name}
              onChange={handleTextFieldChange}
              error={!!errors.company_name}
              helperText={errors.company_name}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT,
              }}
            />

            <TextField
              name="postal_code"
              label="郵便番号"
              variant="outlined"
              fullWidth
              placeholder="123-4567"
              autoComplete="off"
              value={getValues().postal_code}
              onChange={handlePostalCodeChange}
              error={!!errors.postal_code}
              helperText={errors.postal_code}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.POSTAL_CODE_LENGTH,
              }}
            />

            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <CustomPulldownMenuForPrefecture
                  value={field.value}
                  onChange={
                    field.onChange as (event: SelectChangeEvent<string>) => void
                  }
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
              error={!!errors.city}
              helperText={errors.city}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT,
              }}
            />

            <TextField
              name="address_line"
              label="町名番地"
              variant="outlined"
              fullWidth
              placeholder="○○町1-2-3"
              value={getValues().address_line}
              onChange={handleTextFieldChange}
              error={!!errors.address_line}
              helperText={errors.address_line}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT,
              }}
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
            />
          </div>
        </ContentCard>
      </TabPanel>

      {/* 拠点情報タブ */}
      <TabPanel value={tabIndex} index={1}>
        <LocationView companyInfo={customerData} locationInfo={locationInfo} />
      </TabPanel>

      {/* ユーザー情報タブ */}
      <TabPanel value={tabIndex} index={2}>
        <UserView
          companyInfo={customerData}
          locationMappedData={locationDataSet}
          userInfo={userData}
        />
      </TabPanel>

      {/* 代表印情報タブ */}
      <TabPanel value={tabIndex} index={3}>
        <RepresentativeSealView
          companyInfo={customerData}
          locationMappedData={locationDataSet}
          userInfo={userData}
        />
      </TabPanel>

      {/* 承認フロータブ */}
      <TabPanel value={tabIndex} index={4}>
        <WorkFlowDialog
          companyInfo={customerData}
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

export default ModernCompanyLocationManagePage;
