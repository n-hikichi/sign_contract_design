/**
 * ModernConcludeDocumentPageForGuest - MUI Default スタイル締結済み契約書ページ（ゲスト）
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Modal, Paper, Typography } from '@mui/material';
import { Error, Download, Verified } from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import api from '../../utils/apiAccessor';
import apiExecutor from '../../utils/apiExecutor';
import converter from '../../utils/converter';
import ModernGuestPageLayout, {
  GuestStatusCard,
  GuestContentCard,
} from './common/ModernGuestPageLayout';
import SignatureHistory from './SignatureHistoryForGuest';
import SignatureHistoryPdfForGuest from './SignatureHistoryPdfForGuest';
import ErrorDialog from './common/ErrorDialog';

// 型定義
interface Approver {
  user_name: string;
  company_name: string;
  email: string;
  approved: boolean;
  approved_time: string;
}

interface AgreementData {
  agreement_id: string;
  title: string;
  company_name: string;
  deal_amount: number;
  conclusion_date: string;
  expiration_date: string;
  internal_pic: { user_name: string; company_name: string; email: string };
  customer_pic: { user_name: string; company_name: string; email: string };
  status: string;
}

interface AgreementFlow {
  internal_pic: Approver;
  internal_approver: Approver;
  internal_authorizer: Approver;
  customer_pic: Approver;
  customer_approver: Approver;
  customer_authorizer: Approver;
  present_approver: string;
}

interface Signatures {
  user_name: string;
  company_name: string;
  position: string;
  email: string;
  role: string;
  signed_time: string;
  valid: boolean;
}

const initialApprover: Approver = {
  user_name: '',
  company_name: '',
  email: '',
  approved: false,
  approved_time: '',
};

const initialAgreementData: AgreementData = {
  agreement_id: '',
  title: '',
  company_name: '',
  deal_amount: 0,
  conclusion_date: '',
  expiration_date: '',
  internal_pic: { user_name: '', company_name: '', email: '' },
  customer_pic: { user_name: '', company_name: '', email: '' },
  status: '',
};

const initialAgreementFlow: AgreementFlow = {
  internal_pic: { ...initialApprover },
  internal_approver: { ...initialApprover },
  internal_authorizer: { ...initialApprover },
  customer_pic: { ...initialApprover },
  customer_approver: { ...initialApprover },
  customer_authorizer: { ...initialApprover },
  present_approver: '',
};

/**
 * ModernConcludeDocumentPageForGuest コンポーネント
 */
const ModernConcludeDocumentPageForGuest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let agreementId = 'acde070d-8c4c-4f0d-9d8a-162843c10333';
  if (location.state) {
    agreementId = location.state.agreementId;
  }

  // Data State
  const [agreementData, setAgreementData] = useState<AgreementData>(initialAgreementData);
  const [approveFlowData, setApproveFlowData] = useState<AgreementFlow>(initialAgreementFlow);
  const [approveResult, setApproveResult] = useState<any>(null);
  const [approveUserList, setApproveUserList] = useState<Signatures[]>([]);
  const [pdfBase64, setPdfBase64] = useState('');

  // Validation State
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [pdfIsLoading, setPdfIsLoading] = useState(true);
  const [isInValidLogin, setIsInValidLogin] = useState(false);

  // Dialog State
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  // Error State
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const requests = [
          apiExecutor.fetchGetAgreementForGuest(agreementId),
          apiExecutor.fetchGetAgreementApprovalsForGuest(agreementId),
          apiExecutor.fetchGetAgreementSignaturesForGuest(agreementId),
          apiExecutor.fetchGetAgreementFileForGuest(agreementId),
        ];

        const responses = await Promise.all(requests);
        const errorResponse = responses.find((res: Response) => res.status !== 200);

        if (errorResponse) {
          setIsInValidLogin(true);
          setErrorCode(errorResponse.status);
          setErrorProcess('契約書情報取得処理');
          setErrorDialogOpen(true);
          return;
        }

        const [agreement, approvals, signature, file] = await Promise.all(
          responses.map((res: Response) => res.json())
        );

        setAgreementData(agreement);
        setApproveFlowData(approvals);
        setApproveResult(signature);
        setApproveUserList(signature.signatures.slice(1));

        if (signature.agreement_valid) {
          setValidationMessage('全ての署名が有効です');
          setIsValid(true);
        } else {
          setValidationMessage('全ての署名が有効ではありません');
          setIsValid(false);
        }

        setPdfBase64('data:application/pdf;base64,' + file.file);
        setPdfIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsInValidLogin(true);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('契約書情報取得処理');
        setPdfIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfBase64;
    link.download = agreementData.title + '.pdf';
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    navigate('/guest/logout');
  };

  // Error view
  if (isInValidLogin) {
    return (
      <ModernGuestPageLayout>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Paper sx={{ p: 6, maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'error.light',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Error sx={{ color: 'error.main', fontSize: 48 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
              契約書取得エラー
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              契約書へのアクセス権限を確認してから再度アクセスしてください。
            </Typography>
          </Paper>
        </Box>
        <ErrorDialog
          open={errorDialogOpen}
          handleClose={() => {
            setErrorDialogOpen(false);
            handleLogout();
          }}
          errorCode={errorCode}
          errorProcess={errorProcess}
        />
      </ModernGuestPageLayout>
    );
  }

  return (
    <ModernGuestPageLayout
      loading={isLoading}
      showSidebar
      sidebar={
        <Box sx={{ height: '100%', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
          <SignatureHistory
            approveFlow_Data={approveFlowData}
            approveResult={approveResult}
            agreement_id={agreementId}
            title={agreementData.title}
            own_company={approveFlowData.internal_pic.company_name}
            customer_company={approveFlowData.customer_pic.company_name}
          />
        </Box>
      }
    >
      {/* Validation Status Banner */}
      <GuestStatusCard
        variant={isValid ? 'success' : 'error'}
        title={validationMessage}
        description={
          isValid
            ? 'ブロックチェーンによる署名検証が完了しました。'
            : '署名に問題がある可能性があります。'
        }
      >
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Verified sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            検証済み契約書
          </Typography>
        </Box>
      </GuestStatusCard>

      {/* Action Bar */}
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={handleLogout}>
          閲覧終了
        </Button>
      </Box>

      {/* Title Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {agreementData.title}
        </Typography>
        <Button variant="contained" onClick={() => setPdfDialogOpen(true)}>
          契約書を閲覧する
        </Button>
      </Paper>

      {/* Download Buttons */}
      <GuestContentCard title="ダウンロード">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={downloadPdf}
            disabled={pdfIsLoading}
          >
            契約書ダウンロード
          </Button>
          {!pdfIsLoading && (
            <PDFDownloadLink
              document={
                <SignatureHistoryPdfForGuest
                  approveFlow_Data={approveFlowData}
                  approveResult={approveUserList}
                  agreement_id={agreementData.agreement_id}
                  title={agreementData.title}
                />
              }
              fileName={`signature_report_${agreementData.title}_${converter.getCurrentDate()}`}
            >
              <Button variant="outlined" startIcon={<Download />}>
                署名履歴ダウンロード
              </Button>
            </PDFDownloadLink>
          )}
        </Box>
      </GuestContentCard>

      {/* PDF Preview Modal */}
      <Modal open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)}>
        <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, position: 'relative' }}>
            {pdfIsLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <embed
                type="application/pdf"
                src={pdfBase64 + '#zoom=100&toolbar=0'}
                style={{ width: '100%', height: '100%' }}
                onClick={() => window.open(pdfBase64, '_blank')}
              />
            )}
          </Box>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button variant="contained" startIcon={<Download />} onClick={downloadPdf}>
              契約書ダウンロード
            </Button>
            {!pdfIsLoading && (
              <PDFDownloadLink
                document={
                  <SignatureHistoryPdfForGuest
                    approveFlow_Data={approveFlowData}
                    approveResult={approveUserList}
                    agreement_id={agreementData.agreement_id}
                    title={agreementData.title}
                  />
                }
                fileName={`signature_report_${agreementData.title}_${converter.getCurrentDate()}`}
              >
                <Button variant="outlined" startIcon={<Download />}>
                  署名履歴ダウンロード
                </Button>
              </PDFDownloadLink>
            )}
            <Button variant="outlined" onClick={() => setPdfDialogOpen(false)}>
              プレビュー終了
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialogOpen}
        handleClose={() => setErrorDialogOpen(false)}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
    </ModernGuestPageLayout>
  );
};

export default ModernConcludeDocumentPageForGuest;
