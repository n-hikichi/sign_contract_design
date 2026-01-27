/**
 * ModernInternalPage - MUI Default スタイル社内承認中文書一覧画面
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { Pending } from '@mui/icons-material';
import api from '../../../utils/apiAccessor';
import { apiExecutor } from '../../../utils/apiExecutor';
import apiStatus from '../../../utils/apiStatus';
import CommonStepper from '../../../utils/customStepper';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import InternalDocView from './InternalDocView';
import { ModernErrorDialog } from '../../common/ModernDialog';

/**
 * ModernInternalPage コンポーネント
 */
const ModernInternalPage: React.FC = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [documentList, setDocumentList] = useState<any>(null);
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorCode2, setErrorCode2] = useState(0);
  const [errorProcess2, setErrorProcess2] = useState('');
  const [errorDialogOpen2, setErrorDialogOpen2] = useState(false);

  const validStatuses = [
    apiStatus.agreementStatus.INTERNAL_APPROVING,
    apiStatus.agreementStatus.INTERNAL_REMANDING,
    apiStatus.agreementStatus.INTERNAL_APPROVED,
  ];

  useEffect(() => {
    async function fetchGetAgreementList() {
      try {
        const res = await apiExecutor.fetchGetAgreementList(
          apiStatus.agreementStatus.IN_INTERNAL_FLOW.toString()
        );
        if (res.status !== api.HTTP_OK) {
          setErrorCode(res.status);
          setErrorProcess('自社承認フロー文書取得処理');
          setErrorDialogOpen(true);
          return;
        }
        const json = await res.json();
        setDocumentList(json);
      } catch (error) {
        console.error(error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('自社承認フロー文書取得処理');
        setErrorDialogOpen(true);
      } finally {
        setLoading(false);
      }
    }

    async function fetchGetAgreement(id: string) {
      try {
        const res = await apiExecutor.fetchGetAgreement(id);
        if (res.status !== api.HTTP_OK) {
          setErrorCode2(res.status);
          setErrorProcess2('契約書ファイル取得処理');
          setErrorDialogOpen2(true);
          return;
        }
        const json = await res.json();
        if (!validStatuses.includes(json.agreement_status)) {
          setErrorCode2(api.HTTP_BAD_REQUEST);
          setErrorProcess2('契約書ファイル取得処理');
          setErrorDialogOpen2(true);
          return;
        }
        setDocumentList([json]);
      } catch (error) {
        console.error(error);
        setErrorCode2(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess2('契約書ファイル取得処理');
        setErrorDialogOpen2(true);
      } finally {
        setLoading(false);
      }
    }

    if (agreementId) {
      fetchGetAgreement(agreementId);
    } else {
      fetchGetAgreementList();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreementId]);

  return (
    <>
      <ModernPageLayout
        loading={loading}
        title="社内承認中"
        subtitle="社内承認フロー中の書類一覧です"
        breadcrumbs={[
          { label: '新規契約書管理', path: '/documentManagement/register' },
          { label: '社内承認中' },
        ]}
        stepper={<CommonStepper activeStep={2} />}
      >
        {/* ガイダンスバナー */}
        <Paper sx={{ mb: 3, p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'warning.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pending sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography fontWeight="bold">
                社内承認フロー中の書類
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                承認状況を確認し、必要に応じてアクションを行ってください
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 文書一覧 */}
        <ContentCard noPadding>
          <InternalDocView documentList={documentList} />
        </ContentCard>
      </ModernPageLayout>

      <ModernErrorDialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
      <ModernErrorDialog
        open={errorDialogOpen2}
        onClose={() => {
          setErrorDialogOpen2(false);
          navigate('/');
        }}
        errorCode={errorCode2}
        errorProcess={errorProcess2}
      />
    </>
  );
};

export default ModernInternalPage;
