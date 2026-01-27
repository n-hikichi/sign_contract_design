/**
 * ModernRegisterTop - モダナイズされた契約書登録開始画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add,
  Business,
  Description,
  Refresh,
  ArrowForward,
  Warning,
} from '@mui/icons-material';
import api from '../../../utils/apiAccessor';
import CommonStepper from '../../../utils/customStepper';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';

interface CompanyInfo {
  company_id: string;
  company_type: string;
  company_name: string;
  postal_code: string;
  state: string;
  city: string;
  address_line: string;
  building: string;
}

/**
 * ModernRegisterTop コンポーネント
 */
const ModernRegisterTop: React.FC = () => {
  const navigate = useNavigate();

  // 自社情報
  const [internalInfo, setInternalInfo] = useState<CompanyInfo>();
  // 顧客企業一覧
  const [customerList, setCustomerList] = useState<CompanyInfo[]>([]);
  // 署名テンプレートリスト
  const [signTemplateList, setSignTemplateList] = useState([]);
  // ローディング状態
  const [isLoading, setIsLoading] = useState(true);
  // リスト更新中フラグ
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  // 選択された企業
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedCompanyData, setSelectedCompanyData] = useState<CompanyInfo>();

  /**
   * 相手方企業リストを取得
   */
  const fetchGetCustomerList = async () => {
    setIsUpdatingList(true);
    try {
      const res = await api.getCompanyList('CUSTOMER');
      if (res.status !== api.HTTP_OK) {
        console.error('API response failed:', res.status);
        return;
      }
      const json = await res.json();
      const list = Array.isArray(json) ? json : [];
      setCustomerList(list);
      if (list.length > 0 && !selectedValue) {
        setSelectedValue(list[0].company_id);
        setSelectedCompanyData(list[0]);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    } finally {
      setIsUpdatingList(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchGetInternalInfo() {
      try {
        const res = await api.getCompanyList('INTERNAL');
        if (res.status !== api.HTTP_OK) {
          console.error('API response failed:', res.status);
          return null;
        }
        const json = await res.json();
        return json[0];
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        return null;
      }
    }

    async function fetchGetSignTemplateList() {
      try {
        const res = await api.getSignedTemplateList();
        if (res.status !== api.HTTP_OK) {
          console.error('API response failed:', res.status);
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        return [];
      }
    }

    async function fetchData() {
      try {
        const [internal, templates] = await Promise.all([
          fetchGetInternalInfo(),
          fetchGetSignTemplateList(),
        ]);
        setInternalInfo(internal);
        setSignTemplateList(templates);
        await fetchGetCustomerList();
      } catch (error) {
        console.error('An error occurred while fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 次の画面に遷移
   */
  const goNextPage = () => {
    navigate('/documentManagement/registerDocument', {
      state: { internalInfo, selectedValue, selectedCompanyData, signTemplateList },
    });
  };

  /**
   * 相手方企業の選択変更
   */
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    setSelectedValue(selectedId);
    const company = customerList.find((c) => c.company_id === selectedId);
    if (company) {
      setSelectedCompanyData(company);
    }
  };

  return (
    <ModernPageLayout
      loading={isLoading}
      title="新規契約書登録"
      subtitle="契約書を登録する相手方企業を選択してください"
      breadcrumbs={[
        { label: '新規契約書管理', path: '/documentManagement/register' },
        { label: '企業選択' },
      ]}
      stepper={<CommonStepper activeStep={0} />}
    >
      {/* ガイダンスバナー */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50
                      border border-indigo-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Description className="text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-indigo-800">
              契約書登録の開始
            </p>
            <p className="text-sm text-indigo-600 mt-0.5">
              相手方企業を選択してから「次へ」を押してください
            </p>
          </div>
        </div>
      </div>

      {customerList.length > 0 ? (
        <>
          {/* 相手方企業選択カード */}
          <ContentCard
            title="相手方企業の選択"
            subtitle="契約を締結する相手方企業を選択してください"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1 w-full md:w-auto">
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="customer-select-label">相手方企業</InputLabel>
                  <Select
                    labelId="customer-select-label"
                    value={selectedValue}
                    onChange={handleSelectChange}
                    label="相手方企業"
                    startAdornment={
                      <Business className="text-slate-400 mr-2" />
                    }
                    sx={{
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(226, 232, 240)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(148, 163, 184)',
                      },
                    }}
                  >
                    {customerList.map((company) => (
                      <MenuItem key={company.company_id} value={company.company_id}>
                        {company.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <Button
                variant="outlined"
                onClick={fetchGetCustomerList}
                disabled={isUpdatingList}
                startIcon={
                  isUpdatingList ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Refresh />
                  )
                }
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  borderColor: 'rgb(203, 213, 225)',
                  '&:hover': {
                    borderColor: 'rgb(148, 163, 184)',
                    backgroundColor: 'rgb(248, 250, 252)',
                  },
                }}
              >
                リスト更新
              </Button>
            </div>

            {/* 選択企業の詳細 */}
            {selectedCompanyData && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-sm font-medium text-slate-500 mb-3">
                  選択中の企業情報
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-400">企業名</span>
                    <p className="text-slate-800 font-medium">
                      {selectedCompanyData.company_name}
                    </p>
                  </div>
                  {selectedCompanyData.state && (
                    <div>
                      <span className="text-xs text-slate-400">所在地</span>
                      <p className="text-slate-800">
                        {selectedCompanyData.state}
                        {selectedCompanyData.city}
                        {selectedCompanyData.address_line}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ContentCard>

          {/* 新規企業登録への誘導 */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Warning className="text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-800 font-medium">
                  リストにない企業との契約書を登録する場合
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  先に企業登録を行ってからこの画面に戻ってきてください
                </p>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  onClick={() => window.open('/manage/clientCompany', '_blank')}
                  startIcon={<Add />}
                  sx={{
                    mt: 2,
                    borderRadius: '8px',
                    textTransform: 'none',
                  }}
                >
                  企業登録画面を開く
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 企業未登録状態 */
        <ContentCard>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Business className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              相手方企業が登録されていません
            </h3>
            <p className="text-slate-500 mb-6">
              契約書を登録するには、まず相手方企業を登録してください
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="contained"
                color="error"
                onClick={() => window.open('/manage/clientCompany', '_blank')}
                startIcon={<Add />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                }}
              >
                企業登録
              </Button>
              <Button
                variant="outlined"
                onClick={fetchGetCustomerList}
                disabled={isUpdatingList}
                startIcon={
                  isUpdatingList ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Refresh />
                  )
                }
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                }}
              >
                リスト更新
              </Button>
            </div>
          </div>
        </ContentCard>
      )}

      {/* 次へボタン */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="contained"
          size="large"
          onClick={goNextPage}
          disabled={!selectedValue}
          endIcon={<ArrowForward />}
          sx={{ px: 6, py: 1.5 }}
        >
          次へ進む
        </Button>
      </div>
    </ModernPageLayout>
  );
};

export default ModernRegisterTop;
