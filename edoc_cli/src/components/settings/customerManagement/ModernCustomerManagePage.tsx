/**
 * ModernCustomerManagePage - モダナイズされた相手方情報管理画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 * 相手方企業（顧客企業）の一覧表示と管理機能
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Typography,
  Chip,
} from '@mui/material';
import {
  Business,
  Add,
  Group,
} from '@mui/icons-material';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import api from '../../../utils/apiAccessor';
import dataType from '../../../utils/apiDataType';
import { apiExecutor } from '../../../utils/apiExecutor';
import ApiProcessingDialog from '../../pages/common/ApiProcessingDialog';
import ErrorDialog from '../../pages/common/ErrorDialog';
import SuccessDialog from '../../pages/common/SuccessDialog';
import { CustomDinamicCardForCompany } from '../CustomDinamicCard';
import RegisterCompanyDialog from '../RegisterCompanyDialog';

// 企業情報の種別
const COMPANYTYPE = 'CUSTOMER';
let request_id = '';

/**
 * ModernCustomerManagePage コンポーネント
 */
const ModernCustomerManagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const myValue = location.state?.uuid;

  if (myValue !== undefined && myValue !== null) {
    request_id = location.state.uuid;
  }

  // React hooks
  const [loading, setLoading] = useState(true);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  // 企業情報
  const [customerCompanyInfo, setCustomerCompanyInfo] = useState<dataType.CompanyInfo[]>([]);

  // 初回レンダー時の処理
  useEffect(() => {
    setLoading(true);

    async function fetchData() {
      try {
        const companyList = await apiExecutor.fetchGetCompanyList(COMPANYTYPE);

        if (companyList.status !== api.HTTP_OK) {
          console.log(
            'fetchAgreementData(): API response failed. HTTP Status: ' +
              companyList.status
          );
          setErrorCode(companyList.status);
          setErrorProcess('相手方企業情報　取得処理');
          setExecuteFailedApiDialogOpen(true);
          return;
        }

        const companyListJson = await companyList.json();
        setCustomerCompanyInfo(companyListJson);
      } catch (error) {
        console.error('An error occurred while fetching data:', error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('相手方企業情報　取得処理');
        setExecuteFailedApiDialogOpen(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request_id]);

  // API実行成功ダイアログ
  const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
  const handleExecuteSuccessApiDialogClose = () => setExecuteSuccessApiDialogOpen(false);

  // API処理中ダイアログ
  const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
  const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

  // API実行失敗ダイアログ
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');
  const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
  const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

  // 企業情報登録
  const registerCompany = () => {
    setRegisterDialogOpen(true);
  };

  // 企業情報編集
  const handleClickModifyLocation = (data: dataType.CompanyInfo) => {
    navigate('/manage/clientCompanyLocation', { state: { customerData: data } });
  };

  // 削除確認ダイアログ用
  const handleClickOpen = () => {
    // CustomDinamicCardForCompany内部で削除ダイアログを処理
  };

  return (
    <ModernPageLayout
      loading={loading}
      title="相手方情報管理"
      subtitle="相手方企業の情報を登録・管理します"
      breadcrumbs={[
        { label: '企業・ユーザー管理' },
        { label: '相手方情報管理' },
      ]}
      actions={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={registerCompany}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            px: 3,
            py: 1.25,
          }}
        >
          企業登録
        </Button>
      }
    >
      {/* 登録企業数 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50
                      border border-blue-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Group className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">登録企業数</p>
              <p className="text-sm text-blue-600 mt-0.5">
                {customerCompanyInfo?.length || 0} 社の相手方企業が登録されています
              </p>
            </div>
          </div>
          <Chip
            label={`${customerCompanyInfo?.length || 0} 社`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </div>
      </div>

      {/* 企業一覧 */}
      <ContentCard
        title="登録企業一覧"
        subtitle="相手方企業の一覧を表示します。企業をクリックして詳細を編集できます。"
        noPadding
      >
        <Box sx={{ p: 3 }}>
          {customerCompanyInfo && customerCompanyInfo.length > 0 ? (
            <Grid container spacing={2}>
              <CustomDinamicCardForCompany
                companyList={customerCompanyInfo}
                onEdit={handleClickModifyLocation}
                onDelete={handleClickOpen}
              />
            </Grid>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
              }}
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center
                              justify-center mb-4">
                <Business className="text-slate-400" sx={{ fontSize: 40 }} />
              </div>
              <Typography
                variant="h6"
                sx={{ color: 'text.secondary', mb: 1 }}
              >
                相手方企業が登録されていません
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.disabled', mb: 3 }}
              >
                「企業登録」ボタンから新しい企業を追加してください
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={registerCompany}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                最初の企業を登録
              </Button>
            </Box>
          )}
        </Box>
      </ContentCard>

      {/* 企業登録ダイアログ */}
      {registerDialogOpen && (
        <RegisterCompanyDialog
          setDialogOpen={setRegisterDialogOpen}
          attribute="CUSTOMER"
        />
      )}

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

export default ModernCustomerManagePage;
