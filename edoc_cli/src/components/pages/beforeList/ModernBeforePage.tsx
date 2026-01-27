/**
 * ModernBeforePage - MUI Default スタイル承認フロー開始前文書一覧画面
 */
import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { PlayCircle } from '@mui/icons-material';
import api from '../../../utils/apiAccessor';
import { apiExecutor } from '../../../utils/apiExecutor';
import apiStatus from '../../../utils/apiStatus';
import CommonStepper from '../../../utils/customStepper';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import BeforeDocView from './BeforeDocView';
import { ModernErrorDialog } from '../../common/ModernDialog';

/**
 * ModernBeforePage コンポーネント
 */
const ModernBeforePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documentList, setDocumentList] = useState<any>(null);
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchGetAgreementList() {
      try {
        const res = await apiExecutor.fetchGetAgreementList(
          apiStatus.agreementStatus.BEFORE_FLOW.toString()
        );
        if (!isMounted) return;

        if (res.status !== api.HTTP_OK) {
          setErrorCode(res.status);
          setErrorProcess('承認フロー開始前文書取得処理');
          setErrorDialogOpen(true);
          return;
        }
        const json = await res.json();
        if (isMounted) {
          setDocumentList(json);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error(error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('承認フロー開始前文書取得処理');
        setErrorDialogOpen(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchGetAgreementList();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <ModernPageLayout
        loading={loading}
        title="承認フロー開始前"
        subtitle="承認フローを開始する書類を選択してください"
        breadcrumbs={[
          { label: '新規契約書管理', path: '/documentManagement/register' },
          { label: '承認フロー開始前' },
        ]}
        stepper={<CommonStepper activeStep={1} />}
      >
        {/* ガイダンスバナー */}
        <Paper sx={{ mb: 3, p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayCircle sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography fontWeight="bold">
                承認フローを開始する書類を選択してください
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                下の一覧から書類をクリックして詳細を確認できます
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 文書一覧 */}
        <ContentCard noPadding>
          <BeforeDocView documentList={documentList} />
        </ContentCard>
      </ModernPageLayout>

      <ModernErrorDialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
    </>
  );
};

export default ModernBeforePage;
