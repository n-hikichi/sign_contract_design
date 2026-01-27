/**
 * ModernApproveDocumentPageForGuest - MUI Default スタイルゲスト承認ページ
 */
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import {
  Error,
  Warning,
  AssignmentReturn,
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { Document, Page } from 'react-pdf';
import api from '../../utils/apiAccessor';
import apiExecutor from '../../utils/apiExecutor';
import CustomPulldownMenu, { remandReason } from '../elements/CustomPulldownMenu';
import ModernGuestPageLayout, {
  GuestStatusCard,
  GuestContentCard,
  GuestInfoField,
} from './common/ModernGuestPageLayout';
import SignatureApproveList from './SignatureApproveListForGuest';
import ApiProcessingDialog from './common/ApiProcessingDialog';
import ErrorDialog, { ErrorDialogForLogout } from './common/ErrorDialog';

// 型定義
interface Approver {
  approver_id: string;
  user_name: string;
  company_name: string;
  position: string;
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

type RestoreInput = {
  responderId: string;
  types: string;
  comment: string;
};

const initialApprover: Approver = {
  approver_id: '',
  user_name: '',
  company_name: '',
  position: '',
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
 * ModernApproveDocumentPageForGuest コンポーネント
 */
const ModernApproveDocumentPageForGuest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let agreementId = 'acde070d-8c4c-4f0d-9d8a-162843c10333';
  if (location.state) {
    agreementId = location.state.agreementId;
  }

  // Data State
  const [agreementData, setAgreementData] = useState<AgreementData>(initialAgreementData);
  const [approveFlowData, setApproveFlowData] = useState<AgreementFlow>(initialAgreementFlow);
  const [presentApprover, setPresentApprover] = useState<Approver>(initialApprover);
  const [pdfBase64, setPdfBase64] = useState('');

  // Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [isInValidLogin, setIsInValidLogin] = useState(false);

  // PDF State
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [isPdfViewedEnough, setIsPdfViewedEnough] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Checkbox State
  const [isAgreementDetailChecked, setIsAgreementDetailChecked] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Dialog State
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [remandDialogOpen, setRemandDialogOpen] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);

  // Error State
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [authErrorDialogOpen, setAuthErrorDialogOpen] = useState(false);

  // Form State
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [textFieldValue, setTextFieldValue] = useState('');
  const { control, handleSubmit, setValue } = useForm<RestoreInput>({
    defaultValues: {
      responderId: presentApprover?.approver_id,
      types: remandReason[0].label,
      comment: '',
    },
  });

  // Fetch data on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setErrorCode(401);
      setErrorProcess('認証エラー');
      setAuthErrorDialogOpen(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const requests = [
          apiExecutor.fetchGetAgreementForGuest(agreementId),
          apiExecutor.fetchGetAgreementApprovalsForGuest(agreementId),
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

        const [agreement, approvals, fileData] = await Promise.all(
          responses.map((res: Response) => res.json())
        );

        setAgreementData(agreement);
        setApproveFlowData(approvals);

        const presentApproverId = approvals.present_approver;
        const presentApproverInfo = Object.values(approvals)
          .flat()
          .find((a: any) => a.approver_id === presentApproverId) as Approver;
        setPresentApprover(presentApproverInfo);

        setPdfBase64('data:application/pdf;base64,' + fileData.file);
      } catch (error) {
        setIsInValidLogin(true);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('契約書情報取得処理');
        setErrorDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PDF scroll tracking
  const handlePdfScroll = () => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const scrollPercent =
      container.scrollTop / (container.scrollHeight - container.clientHeight);
    if (scrollPercent >= 0.9 && !isPdfViewedEnough) {
      setIsPdfViewedEnough(true);
    }
  };

  // Close PDF dialog
  const handlePdfDialogClose = () => {
    if (!isAgreementDetailChecked) {
      setIsPdfViewedEnough(false);
    }
    setPdfDialogOpen(false);
  };

  // Approve handler
  const handleApprove = async () => {
    setApiDialogOpen(true);
    try {
      const response = await api.postAgreementApprovalsForGuest(agreementData.agreement_id);
      if (response.status !== api.HTTP_OK) {
        setErrorCode(response.status);
        setErrorProcess('契約書承認処理');
        setErrorDialogOpen(true);
        setApproveDialogOpen(false);
        return;
      }
      const result = await response.json();
      navigate('/guest/agreement/approveCompletePage', {
        state: { agreementData, presentApprover, approvedTime: result.approved_time },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('契約書承認処理');
      setErrorDialogOpen(true);
      setApproveDialogOpen(false);
    } finally {
      setApiDialogOpen(false);
    }
  };

  // Remand handler
  const handleRemand = async (data: RestoreInput) => {
    setApiDialogOpen(true);
    try {
      const requestBody = {
        responder_id: presentApprover?.approver_id,
        types: [data.types],
        comment: data.comment || '',
      };

      const res = await api.postAgreementRemandForGuest(agreementData.agreement_id, requestBody);
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('契約書差戻し処理');
        setErrorDialogOpen(true);
        return;
      }

      const remandTime = await res.json();
      navigate('/guest/agreement/remandComplete', {
        state: { remandTime, data, internalPic: approveFlowData.internal_pic },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('契約書差戻し処理');
      setErrorDialogOpen(true);
    } finally {
      setApiDialogOpen(false);
    }
  };

  // Logout handler
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
          <SignatureApproveList approveHistory={approveFlowData} />
        </Box>
      }
    >
      {/* Status Banner */}
      {agreementData.status === 'CUSTOMER_APPROVING' && (
        <GuestStatusCard
          variant="info"
          title="契約書の内容を確認してください"
          description="内容に問題がなければ、承認手続きを行ってください。"
        />
      )}
      {agreementData.status === 'CUSTOMER_REMANDING' && (
        <GuestStatusCard
          variant="error"
          title="この契約書は差戻し要求が送信されました"
        />
      )}

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

      {/* Approver Info Card */}
      <GuestContentCard title="承認者情報">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <GuestInfoField label="会社名" value={presentApprover?.company_name} />
          <GuestInfoField label="氏名" value={presentApprover?.user_name} />
          <GuestInfoField label="役職" value={presentApprover?.position} />
          <GuestInfoField label="メールアドレス" value={presentApprover?.email} />
        </Box>

        {agreementData.status === 'CUSTOMER_APPROVING' && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
            {isAgreementDetailChecked ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                }
                label={
                  <Typography color="error" fontWeight={600}>
                    承認者情報が正しい事を確認しました。
                  </Typography>
                }
              />
            ) : (
              <Typography color="error" fontWeight={600} textAlign="center">
                始めに「契約書を閲覧する」をクリックして、契約書の内容を確認してください。
              </Typography>
            )}
          </Paper>
        )}
      </GuestContentCard>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        {agreementData.status === 'CUSTOMER_APPROVING' && (
          <>
            <Button
              variant="contained"
              onClick={() => setApproveDialogOpen(true)}
              disabled={!isChecked}
            >
              承認する
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setRemandDialogOpen(true)}
            >
              差戻し
            </Button>
          </>
        )}
        <Button variant="outlined" onClick={handleLogout}>
          終了する
        </Button>
      </Box>

      {/* PDF Preview Modal */}
      <Modal open={pdfDialogOpen} onClose={handlePdfDialogClose}>
        <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
          <Box
            ref={pdfContainerRef}
            onScroll={handlePdfScroll}
            sx={{ flex: 1, overflow: 'auto', p: 2 }}
          >
            <Document
              file={pdfBase64}
              loading={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                  <CircularProgress />
                </Box>
              }
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Box key={i + 1} sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Page
                    pageNumber={i + 1}
                    width={1200}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </Box>
              ))}
            </Document>
          </Box>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              bgcolor: isPdfViewedEnough ? 'success.lighter' : 'error.lighter',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAgreementDetailChecked}
                  onChange={(e) => setIsAgreementDetailChecked(e.target.checked)}
                  disabled={!isPdfViewedEnough}
                />
              }
              label={
                <Typography color={isPdfViewedEnough ? 'text.primary' : 'error'}>
                  契約書の内容を確認しました。
                </Typography>
              }
            />
            <Button variant="contained" onClick={handlePdfDialogClose}>
              プレビュー終了
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Approve Confirmation Dialog */}
      <Modal open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: 400,
            width: '100%',
            p: 3,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'warning.light',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Warning sx={{ color: 'warning.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              承認確認
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              書類内容に同意して確認を完了します。よろしいですか？
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="error" onClick={handleApprove}>
                実行する
              </Button>
              <Button variant="outlined" onClick={() => setApproveDialogOpen(false)}>
                キャンセル
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Remand Dialog */}
      <Modal open={remandDialogOpen} onClose={() => setRemandDialogOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Box sx={{ p: 3, bgcolor: 'error.main', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">
              差戻し依頼
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              差戻し内容を入力してください
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentReturn color="error" />
                差戻し内容（必須）
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomPulldownMenu
                  label="差戻し種別"
                  value={selectedValue}
                  onChange={(e: SelectChangeEvent<string>) => {
                    setSelectedValue(e.target.value);
                    setValue('types', e.target.value);
                  }}
                  items={remandReason}
                />
                <Controller
                  name="comment"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="差戻し理由"
                      multiline
                      rows={4}
                      fullWidth
                      value={textFieldValue}
                      onChange={(e) => {
                        field.onChange(e);
                        setTextFieldValue(e.target.value);
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
            <Paper variant="outlined" sx={{ mb: 3, p: 2, bgcolor: 'grey.50' }}>
              <Typography fontWeight={600} sx={{ mb: 1.5 }}>
                差戻し要求送信先
              </Typography>
              <GuestInfoField label="会社名" value={approveFlowData.internal_pic.company_name} />
              <GuestInfoField label="氏名" value={approveFlowData.internal_pic.user_name} />
              <GuestInfoField label="メールアドレス" value={approveFlowData.internal_pic.email} />
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleSubmit(handleRemand)}
                disabled={!textFieldValue.trim()}
              >
                差戻し
              </Button>
              <Button variant="outlined" onClick={() => setRemandDialogOpen(false)}>
                キャンセル
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* API Processing Dialog */}
      <ApiProcessingDialog open={apiDialogOpen} handleClose={() => setApiDialogOpen(false)} />

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialogOpen}
        handleClose={() => setErrorDialogOpen(false)}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />

      {/* Auth Error Dialog */}
      <ErrorDialogForLogout
        open={authErrorDialogOpen}
        handleClose={() => {
          setAuthErrorDialogOpen(false);
          handleLogout();
        }}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
    </ModernGuestPageLayout>
  );
};

export default ModernApproveDocumentPageForGuest;
