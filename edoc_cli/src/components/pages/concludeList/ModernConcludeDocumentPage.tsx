/**
 * ModernConcludeDocumentPage - 締結済み契約書詳細画面（Modern UI版）
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Modal } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ModernDetailPageLayout, {
  StatusBanner,
  TitleBar,
  ActionBar,
  BackButton,
  InfoCard,
  InfoField,
  ModernTabs,
  TabPanel,
} from '../../templates/ModernDetailPageLayout';
import ErrorDialog from '../common/ErrorDialog';
import SignatureHistory from './SignatureHistory';
import SignatureHistoryPdf from './SignatureHistoryPdf';
import RegisterNewAgreementUseExistDataDialog from './RegisterNewAgreementUseExistDataDialog';
import apiExecutor from '../../../utils/apiExecutor';
import api from '../../../utils/apiAccessor';
import converter from '../../../utils/converter';
import { Download, ContentCopy, Description } from '@mui/icons-material';

type Approver = {
  user_name: string;
  company_name: string;
  position: string;
  email: string;
  approved: boolean;
  approved_time: string;
};

const createApprover = (): Approver => ({
  user_name: '',
  company_name: '',
  position: '',
  email: '',
  approved: false,
  approved_time: '',
});

type AgreementFlow = {
  internal_pic: Approver;
  internal_approver: Approver;
  internal_authorizer: Approver;
  customer_pic: Approver;
  customer_approver: Approver;
  customer_authorizer: Approver;
  present_approver: string;
};

const initialAgreementFlow: AgreementFlow = {
  internal_pic: createApprover(),
  internal_approver: createApprover(),
  internal_authorizer: createApprover(),
  customer_pic: createApprover(),
  customer_approver: createApprover(),
  customer_authorizer: createApprover(),
  present_approver: '',
};

type ApproveResult = {
  user_name: string;
  company_name: string;
  email: string;
  signed_time: string;
  valid: boolean;
  agreement_valid?: boolean;
  signatures?: Signatures[];
};

const initialApproveResult: ApproveResult = {
  user_name: '',
  company_name: '',
  email: '',
  signed_time: '',
  valid: false,
};

interface Signatures {
  user_name: string;
  company_name: string;
  position: string;
  email: string;
  role: string;
  signed_time: string;
  valid: boolean;
}

const ModernConcludeDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agreementId } = useParams();

  const selectedInfo = agreementId
    ? location.state?.agreementInfo
    : location.state?.record;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [approveFlowData, setApproveFlowData] =
    useState<AgreementFlow>(initialAgreementFlow);
  const [approveResult, setApproveResult] =
    useState<ApproveResult>(initialApproveResult);
  const [validateMessage, setValidateMessage] = useState('');
  const [isSignatureValid, setIsSignatureValid] = useState(true);
  const [approveUserList, setApproveUserList] = useState<Signatures[]>([]);

  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [reuseDialogOpen, setReuseDialogOpen] = useState(false);

  // API State
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');

  useEffect(() => {
    if (!selectedInfo) {
      setErrorCode(api.HTTP_NOT_FOUND);
      setErrorProcess('締結済み契約書　取得処理');
      setErrorDialogOpen(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const requests = [
          apiExecutor.fetchGetAgreementSignatures(selectedInfo.agreement_id),
          apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id),
          apiExecutor.fetchGetAgreementFile(selectedInfo.agreement_id),
        ];

        const responses = await Promise.all(requests);
        const errorResponse = responses.find(
          (res: Response) => res.status !== 200
        );

        if (errorResponse) {
          setErrorCode(errorResponse.status);
          setErrorProcess('締結済み契約書　取得処理');
          setErrorDialogOpen(true);
          return;
        }

        const [signature, approvals, file] = await Promise.all(
          responses.map((res: Response) => res.json())
        );

        setApproveResult(signature);
        setApproveUserList(signature.signatures?.slice(1) || []);
        setApproveFlowData(approvals);
        setPdfBase64('data:application/pdf;base64,' + file.file);

        if (signature.agreement_valid) {
          setValidateMessage('全ての署名が有効です');
          setIsSignatureValid(true);
        } else {
          setValidateMessage('全ての署名が有効ではありません');
          setIsSignatureValid(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('締結済み契約書　取得処理');
        setErrorDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pdfDialogOpen) return;

    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (pdfDialogOpen) setPdfDialogOpen(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pdfDialogOpen]);

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfBase64;
    link.download = selectedInfo.title;
    link.click();
  };

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    navigate('/documentManagement/conclusionDocument');
  };

  const tabItems = [
    { label: '締結情報', icon: <Description /> },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', pt: '64px' }}>
        {/* サイドバー: SignatureHistory */}
        <SignatureHistory
          approveFlowData={approveFlowData}
          approveResult={approveResult}
          agreement_id={selectedInfo?.agreement_id}
          title={selectedInfo?.title}
          own_company={selectedInfo?.own_company?.company_name}
          customer_company={selectedInfo?.customer_company?.company_name}
        />

        {/* メインコンテンツ */}
        <ModernDetailPageLayout
          loading={isLoading}
          showSidebar={false}
        >
          {/* 署名検証結果バナー */}
          <StatusBanner
            variant={isSignatureValid ? 'success' : 'error'}
            message={validateMessage}
          />

          {/* アクションバー */}
          <ActionBar align="between">
            <BackButton
              onClick={() => navigate('/documentManagement/conclusionDocument')}
            />
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={() => setReuseDialogOpen(true)}
            >
              流用する
            </Button>
          </ActionBar>

          {/* タイトルバー */}
          <TitleBar
            title={selectedInfo?.title || ''}
            status="CONCLUDED"
            statusLabel="締結済"
            onViewPdf={() => setPdfDialogOpen(true)}
            pdfLoading={isPdfLoading}
          />

          {/* タブ */}
          <ModernTabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            tabs={tabItems}
            variant="success"
          />

          {/* 締結情報タブ */}
          <TabPanel value={tabValue} index={0}>
            {/* 契約基本情報 */}
            <InfoCard title="契約基本情報">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <InfoField label="契約種別" value={selectedInfo?.type} />
                <InfoField
                  label="契約金額"
                  value={
                    selectedInfo?.deal_amount
                      ? `${selectedInfo.deal_amount.toLocaleString()}円`
                      : undefined
                  }
                />
                <InfoField label="契約開始日" value={selectedInfo?.conclusion_date} />
                <InfoField label="契約終了日" value={selectedInfo?.expiration_date} />
              </Box>
            </InfoCard>

            {/* 自社登録情報 */}
            <InfoCard title="自社登録情報">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <InfoField
                  label="企業名"
                  value={selectedInfo?.own_company?.company_name}
                />
                <InfoField
                  label="郵便番号"
                  value={selectedInfo?.own_company?.postal_code}
                />
                <InfoField
                  label="住所"
                  value={[
                    selectedInfo?.own_company?.state,
                    selectedInfo?.own_company?.city,
                    selectedInfo?.own_company?.address_line,
                    selectedInfo?.own_company?.building,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  fullWidth
                />
                <InfoField
                  label="契約窓口"
                  value={selectedInfo?.internal_pic?.user_name}
                />
                <InfoField
                  label="契約代表者"
                  value={approveFlowData?.internal_authorizer?.user_name}
                />
              </Box>
            </InfoCard>

            {/* 相手方登録情報 */}
            <InfoCard title="相手方登録情報">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <InfoField
                  label="企業名"
                  value={selectedInfo?.customer_company?.company_name}
                />
                <InfoField
                  label="郵便番号"
                  value={selectedInfo?.customer_company?.postal_code}
                />
                <InfoField
                  label="住所"
                  value={[
                    selectedInfo?.customer_company?.state,
                    selectedInfo?.customer_company?.city,
                    selectedInfo?.customer_company?.address_line,
                    selectedInfo?.customer_company?.building,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  fullWidth
                />
                <InfoField
                  label="契約窓口"
                  value={selectedInfo?.customer_pic?.user_name}
                />
                <InfoField
                  label="契約代表者"
                  value={approveFlowData?.customer_authorizer?.user_name}
                />
              </Box>
            </InfoCard>
          </TabPanel>
        </ModernDetailPageLayout>
      </Box>

      {/* PDFプレビューダイアログ */}
      <Modal open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
            height: '95%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: 'grey.100',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => window.open(pdfBase64, '_blank')}
          >
            {isPdfLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <embed
                type="application/pdf"
                src={`${pdfBase64}#zoom=100`}
                height="100%"
                width="100%"
              />
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={downloadPdf}
            >
              契約書ダウンロード
            </Button>
            <PDFDownloadLink
              document={
                <SignatureHistoryPdf
                  approveFlowData={approveFlowData}
                  approveResult={approveUserList}
                  agreement_id={selectedInfo?.agreement_id}
                  title={selectedInfo?.title}
                />
              }
              fileName={`signature_report_${selectedInfo?.title}_${converter.getCurrentDate()}`}
            >
              <Button variant="contained" startIcon={<Download />}>
                署名履歴ダウンロード
              </Button>
            </PDFDownloadLink>
            <Button variant="outlined" onClick={() => setPdfDialogOpen(false)}>
              プレビュー終了
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 流用ダイアログ */}
      <Modal open={reuseDialogOpen} onClose={() => setReuseDialogOpen(false)}>
        <Box
          sx={{
            width: '80vw',
            maxWidth: 900,
            margin: '5vh auto',
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
          }}
        >
          <RegisterNewAgreementUseExistDataDialog
            open={reuseDialogOpen}
            handleClose={() => setReuseDialogOpen(false)}
            selectedInfo={selectedInfo}
            internalAuthorizer={approveFlowData.internal_authorizer}
            customerAuthorizer={approveFlowData.customer_authorizer}
            approveFlowData={approveFlowData}
          />
        </Box>
      </Modal>

      {/* エラーダイアログ */}
      <ErrorDialog
        open={errorDialogOpen}
        handleClose={handleErrorDialogClose}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
    </>
  );
};

export default ModernConcludeDocumentPage;
