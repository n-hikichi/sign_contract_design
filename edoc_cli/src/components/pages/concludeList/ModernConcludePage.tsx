/**
 * ModernConcludePage - MUI Default スタイル締結済み文書一覧画面
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import api from '../../../utils/apiAccessor';
import ModernPageLayout, { ContentCard } from '../../templates/ModernPageLayout';
import ConcludeDocView from './ConcludeDocView';
import { ModernErrorDialog } from '../../common/ModernDialog';

/**
 * ModernConcludePage コンポーネント
 */
const ModernConcludePage: React.FC = () => {
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

  useEffect(() => {
    async function fetchGetAgreementList(status: string) {
      try {
        const res = await api.getAgreementList(status);
        if (res.status !== api.HTTP_OK) {
          setErrorCode(res.status);
          setErrorProcess('締結済み文書取得処理');
          setErrorDialogOpen(true);
          return;
        }
        const json = await res.json();
        setDocumentList(json);
      } catch (error) {
        console.error(error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('締結済み文書取得処理');
        setErrorDialogOpen(true);
      } finally {
        setLoading(false);
      }
    }

    async function fetchGetAgreement(id: string) {
      try {
        const res = await api.getAgreement(id);
        if (res.status !== api.HTTP_OK) {
          setErrorCode2(res.status);
          setErrorProcess2('契約書ファイル取得処理');
          setErrorDialogOpen2(true);
          return;
        }
        const json = await res.json();
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
      fetchGetAgreementList('CONCLUDED');
    }
  }, [agreementId]);

  return (
    <>
      <ModernPageLayout
        loading={loading}
        title="締結済み契約書"
        subtitle="締結が完了した契約書の一覧です"
        breadcrumbs={[
          { label: '契約書管理' },
          { label: '締結済み契約書' },
        ]}
      >
        {/* ガイダンスバナー */}
        <Paper sx={{ mb: 3, p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'success.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography fontWeight="bold">
                締結済み契約書一覧
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                締結が完了した契約書をダウンロード・確認できます
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 文書一覧 */}
        <ContentCard noPadding>
          <ConcludeDocView documentList={documentList} />
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
          navigate('/documentManagement/conclusionDocument');
        }}
        errorCode={errorCode2}
        errorProcess={errorProcess2}
      />
    </>
  );
};

export default ModernConcludePage;
