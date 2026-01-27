/**
 * ModernInternalApprovePage - モダナイズされた社内承認画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import {
  Person,
  Info,
  Link as LinkIcon,
  AssignmentReturn,
  Check,
  Business,
  Email,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import api from '../../../utils/apiAccessor';
import apiDataType from '../../../utils/apiDataType';
import apiExecutor from '../../../utils/apiExecutor';
import apiStatus from '../../../utils/apiStatus';
import { getUserData } from '../../../auth/login';
import { remandReason } from '../../elements/CustomPulldownMenu';
import ModernDetailPageLayout, {
  StatusBanner,
  TitleBar,
  ActionBar,
  BackButton,
  DeleteButton,
  SendButton,
  InfoCard,
  InfoField,
  ModernTabs,
  TabPanel,
  PdfViewerModal,
  ConfirmDialog,
} from '../../templates/ModernDetailPageLayout';
import ApproverInfo from '../common/ApproverInfo';
import { ModernErrorDialog } from '../../common/ModernDialog';
import ApiProcessingDialog from '../common/ApiProcessingDialog';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// 関係者リストの型
interface NotifierListColumns {
  company_name: string;
  user_name: string;
  email: string;
  position: string;
}

// 差戻し入力の型
interface RemandInput {
  responderId: string;
  types: string;
  comment: string;
}

const status_label = '社内承認中';

/**
 * ModernInternalApprovePage コンポーネント
 */
const ModernInternalApprovePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agreementId } = useParams();

  const selectedInfo = agreementId
    ? location.state?.agreementInfo
    : location.state?.record;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [approveFlowData, setApproveFlowData] = useState<apiDataType.AgreementFlow>(
    apiDataType.createInitialAgreementFlow()
  );
  const [presentApprover, setPresentApprover] = useState<apiDataType.Approver>();
  const [isInternalPicUser, setIsInternalPicUser] = useState(false);
  const [isPresentApprover, setIsPresentApprover] = useState(false);
  const [internalNotifier, setInternalNotifier] = useState<NotifierListColumns[]>([]);
  const [customerNotifier, setCustomerNotifier] = useState<NotifierListColumns[]>([]);

  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [urlReissueDialogOpen, setUrlReissueDialogOpen] = useState(false);
  const [remandDialogOpen, setRemandDialogOpen] = useState(false);

  // Approval checkboxes
  const [isAgreementDetailChecked, setIsAgreementDetailChecked] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // PDF scroll tracking
  const [isPdfViewedEnough, setIsPdfViewedEnough] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // API State
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');

  // Remand form
  const [selectedRemandType, setSelectedRemandType] = useState('');
  const [remandComment, setRemandComment] = useState('');
  const { control, handleSubmit, setValue } = useForm<RemandInput>({
    defaultValues: {
      responderId: presentApprover?.approver_id,
      types: remandReason[0]?.label || '',
      comment: '',
    },
  });

  useEffect(() => {
    if (!selectedInfo) {
      setErrorCode(api.HTTP_NOT_FOUND);
      setErrorProcess('契約書取得処理');
      setErrorDialogOpen(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const requests = [
          apiExecutor.fetchGetAgreement(selectedInfo.agreement_id),
          apiExecutor.fetchGetAgreementApprovals(selectedInfo.agreement_id),
          apiExecutor.fetchGetAgreementFile(selectedInfo.agreement_id),
        ];

        const responses = await Promise.all(requests);
        const errorResponse = responses.find((res: Response) => res.status !== 200);

        if (errorResponse) {
          setErrorCode(errorResponse.status);
          setErrorProcess('社内承認フロー　契約書取得処理');
          setErrorDialogOpen(true);
          return;
        }

        const [agreement, approvals, file] = await Promise.all(
          responses.map((res: Response) => res.json())
        );

        setApproveFlowData(approvals);

        // 現在の承認者を設定
        const presentApproverId = approvals.present_approver;
        const presentApproverInfo = Object.values(approvals)
          .flat()
          .find((approver: any) => approver.approver_id === presentApproverId) as apiDataType.Approver;
        setPresentApprover(presentApproverInfo);

        // 関係者情報を整理
        const internalNotifierTmp: NotifierListColumns[] = [];
        const customerNotifierTmp: NotifierListColumns[] = [];

        for (const flowData in approvals) {
          if (!apiStatus.userRole.hasOwnProperty(flowData)) continue;
          if (
            !(flowData === 'internal_notifier' || flowData === 'customer_notifier') ||
            !Array.isArray(approvals[flowData])
          )
            continue;

          const approvers = approvals[flowData] as Array<any>;
          approvers.forEach((approver) => {
            const item: NotifierListColumns = {
              company_name: approver.company_name,
              user_name: approver.user_name,
              email: approver.email,
              position: approver.position,
            };
            if (flowData.startsWith('internal')) {
              internalNotifierTmp.push(item);
            } else {
              customerNotifierTmp.push(item);
            }
          });
        }

        setInternalNotifier(internalNotifierTmp);
        setCustomerNotifier(customerNotifierTmp);

        setPdfBase64('data:application/pdf;base64,' + file.file);
        setIsPdfLoading(false);

        const loginUser = getUserData();
        if (approvals.internal_pic.email === loginUser) {
          setIsInternalPicUser(true);
        }
        if (presentApproverInfo?.email === loginUser) {
          setIsPresentApprover(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('社内承認フロー　契約書取得処理');
        setErrorDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PDF scroll handler
  const handlePdfScroll = () => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const scrollPercent = container.scrollTop / (container.scrollHeight - container.clientHeight);
    if (scrollPercent >= 0.9 && !isPdfViewedEnough) {
      setIsPdfViewedEnough(true);
    }
  };

  // 承認処理
  const handleApprove = async () => {
    setApiDialogOpen(true);
    try {
      const res = await api.postAgreementApprovals(selectedInfo.agreement_id);
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('自社フロー　承認処理');
        setErrorDialogOpen(true);
        return;
      }
      const approveDate = await res.json();
      navigate('/documentManagement/internalDocument/approveComplete', {
        state: { selectedInfo, presentApprover, approveDate },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('自社フロー　承認処理');
      setErrorDialogOpen(true);
    } finally {
      setApiDialogOpen(false);
    }
  };

  // 差戻し処理
  const handleRemand = async (data: RemandInput) => {
    setApiDialogOpen(true);
    try {
      const requestBody = {
        responder_id: presentApprover?.approver_id,
        types: [data.types],
        comment: data.comment || '',
      };

      const res = await api.postAgreementRemand(selectedInfo.agreement_id, requestBody);
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('自社フロー　差戻し処理');
        setErrorDialogOpen(true);
        return;
      }

      const remandTime = await res.json();
      navigate('/documentManagement/internalDocument/remandComplete', {
        state: { remandTime, data, internalPic: approveFlowData.internal_pic },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('自社フロー　差戻し処理');
      setErrorDialogOpen(true);
    } finally {
      setApiDialogOpen(false);
      setRemandDialogOpen(false);
    }
  };

  // 破棄処理
  const handleDelete = async () => {
    setApiDialogOpen(true);
    try {
      const res = await api.deleteAgreement(selectedInfo.agreement_id);
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('契約書破棄処理');
        setErrorDialogOpen(true);
        return;
      }

      const deleteResponse = await res.json();
      navigate('/documentManagement/internalDocument/deleteComplete', {
        state: { selectedInfo, deleteResponse, flowStatus: selectedInfo.status, approveFlowData },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('契約書破棄処理');
      setErrorDialogOpen(true);
    } finally {
      setApiDialogOpen(false);
      setDeleteDialogOpen(false);
    }
  };

  // 署名用URL再発行処理
  const handleUrlReissue = async () => {
    setApiDialogOpen(true);
    try {
      const body = { recipient_id: presentApprover?.approver_id };
      const res = await api.postApprovalUrl(selectedInfo.agreement_id, body);
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('署名用URL再発行処理');
        setErrorDialogOpen(true);
        return;
      }

      const issuedTime = await res.json();
      navigate('/documentManagement/internalDocument/reissueSignedUrlRequestComplete', {
        state: { selectedInfo, presentApprover, issuedTime },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('署名用URL再発行処理');
      setErrorDialogOpen(true);
    } finally {
      setApiDialogOpen(false);
      setUrlReissueDialogOpen(false);
    }
  };

  const tabItems = [
    { label: '承認者情報', icon: <Person /> },
    { label: '登録情報', icon: <Info /> },
  ];

  return (
    <>
      <ModernDetailPageLayout
        loading={isLoading}
        approveFlowData={approveFlowData}
        flowStatus={selectedInfo?.status}
        bgVariant={isPresentApprover ? 'primary' : 'default'}
      >
        {/* ステータスバナー */}
        <StatusBanner
          variant="info"
          message={
            isPresentApprover
              ? '承認依頼が届いています。契約内容を確認し承認してください。'
              : '現在の社内承認状況です'
          }
        />

        {/* アクションバー */}
        <ActionBar>
          <BackButton onClick={() => navigate('/documentManagement/internalDocument')} />
        </ActionBar>

        {/* タイトルバー */}
        <TitleBar
          title={selectedInfo?.title || ''}
          status={selectedInfo?.status || ''}
          statusLabel={status_label}
          onViewPdf={() => setPdfDialogOpen(true)}
          pdfLoading={isPdfLoading}
        />

        {/* 自社担当者用アクション */}
        {isInternalPicUser && (
          <ActionBar align="between">
            <div className="flex gap-3">
              <Button
                variant="contained"
                color="success"
                startIcon={<LinkIcon />}
                onClick={() => setUrlReissueDialogOpen(true)}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
              >
                署名用URLを発行
              </Button>
              <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
            </div>
            <ModernTabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              tabs={tabItems}
            />
          </ActionBar>
        )}

        {/* 承認者情報タブ */}
        <TabPanel value={tabValue} index={0}>
          <ApproverInfo
            isChecked={isChecked}
            handleCheckboxChange={(e) => setIsChecked(e.target.checked)}
            present_approver={presentApprover}
            isPresentApprover={isPresentApprover}
            isAgreementDetailChecked={isAgreementDetailChecked}
          />

          {/* 承認者用アクション */}
          {isPresentApprover && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Check />}
                onClick={handleApprove}
                disabled={!isAgreementDetailChecked || !isChecked}
                sx={{ px: 4, py: 1.5 }}
              >
                承認する
              </Button>
              {!isInternalPicUser && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<AssignmentReturn />}
                  onClick={() => setRemandDialogOpen(true)}
                  sx={{ borderRadius: '10px', textTransform: 'none', px: 4, py: 1.5 }}
                >
                  差戻し
                </Button>
              )}
            </div>
          )}
        </TabPanel>

        {/* 登録情報タブ */}
        <TabPanel value={tabValue} index={1}>
          <InfoCard title="契約基本情報">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="契約種別" value={selectedInfo?.type} />
              <InfoField label="契約金額" value={selectedInfo?.deal_amount} />
              <InfoField
                label="署名用URLの有効期限"
                value={`${approveFlowData?.submission_period}日`}
              />
              <InfoField label="契約開始日" value={selectedInfo?.conclusion_date} />
              <InfoField label="契約終了日" value={selectedInfo?.expiration_date} />
            </div>
          </InfoCard>

          <InfoCard title="自社登録情報">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="企業名" value={selectedInfo?.own_company?.company_name} />
              <InfoField label="郵便番号" value={selectedInfo?.own_company?.postal_code} />
              <InfoField
                label="住所"
                value={`${selectedInfo?.own_company?.state || ''} ${selectedInfo?.own_company?.city || ''} ${selectedInfo?.own_company?.address_line || ''}`}
                fullWidth
              />
              <InfoField label="契約窓口" value={selectedInfo?.internal_pic?.user_name} />
            </div>
          </InfoCard>

          <InfoCard title="相手方登録情報">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="企業名" value={selectedInfo?.customer_company?.company_name} />
              <InfoField label="郵便番号" value={selectedInfo?.customer_company?.postal_code} />
              <InfoField
                label="住所"
                value={`${selectedInfo?.customer_company?.state || ''} ${selectedInfo?.customer_company?.city || ''} ${selectedInfo?.customer_company?.address_line || ''}`}
                fullWidth
              />
              <InfoField label="契約窓口" value={selectedInfo?.customer_pic?.user_name} />
            </div>
          </InfoCard>
        </TabPanel>
      </ModernDetailPageLayout>

      {/* 承認者向けPDFプレビューモーダル（スクロール追跡付き） */}
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
            borderRadius: '16px',
            boxShadow: 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isPresentApprover ? (
            <>
              <div
                ref={pdfContainerRef}
                onScroll={handlePdfScroll}
                className="flex-1 overflow-auto bg-slate-100"
              >
                <Document
                  file={pdfBase64}
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <CircularProgress />
                    </div>
                  }
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  {Array.from({ length: numPages }, (_, i) => (
                    <div key={i + 1} className="flex justify-center mb-6">
                      <Page
                        pageNumber={i + 1}
                        width={1000}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        loading={null}
                        noData={null}
                      />
                    </div>
                  ))}
                </Document>
              </div>
              <div
                className={`px-6 py-4 border-t border-slate-200 flex items-center justify-center gap-4 ${
                  isPdfViewedEnough ? 'bg-emerald-50' : 'bg-red-50'
                }`}
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
                    <span
                      className={`font-semibold ${
                        isPdfViewedEnough ? 'text-emerald-800' : 'text-red-800'
                      }`}
                    >
                      契約書の内容を確認しました
                    </span>
                  }
                />
                <Button
                  variant="contained"
                  onClick={() => setPdfDialogOpen(false)}
                  sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                  閉じる
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-slate-100 overflow-hidden">
                <embed
                  type="application/pdf"
                  src={`${pdfBase64}#zoom=100`}
                  height="100%"
                  width="100%"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex justify-center gap-4">
                <Button
                  variant="outlined"
                  onClick={() => window.open(pdfBase64, '_blank')}
                  sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                  新しいタブで開く
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setPdfDialogOpen(false)}
                  sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                  閉じる
                </Button>
              </div>
            </>
          )}
        </Box>
      </Modal>

      {/* 署名用URL再発行確認ダイアログ */}
      <ConfirmDialog
        open={urlReissueDialogOpen}
        onClose={() => setUrlReissueDialogOpen(false)}
        onConfirm={handleUrlReissue}
        title="署名用URL発行の確認"
        message="以下の宛先に署名用URLを発行します。よろしいですか？"
        variant="success"
        confirmLabel="発行する"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Business className="text-slate-400" />
            <span className="text-slate-800">{presentApprover?.company_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Person className="text-slate-400" />
            <span className="text-slate-800">{presentApprover?.user_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Email className="text-slate-400" />
            <span className="text-slate-800">{presentApprover?.email}</span>
          </div>
        </div>
      </ConfirmDialog>

      {/* 差戻しダイアログ */}
      <Modal open={remandDialogOpen} onClose={() => setRemandDialogOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90%',
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: 24,
            overflow: 'hidden',
          }}
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <h2 className="text-white font-bold text-lg text-center">
              差戻し内容を入力してください
            </h2>
          </div>
          <div className="p-6 max-h-[60vh] overflow-auto">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 mb-3">差戻し内容</h3>
              <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
                <InputLabel>差戻し種別</InputLabel>
                <Select
                  value={selectedRemandType}
                  onChange={(e) => {
                    setSelectedRemandType(e.target.value);
                    setValue('types', e.target.value);
                  }}
                  label="差戻し種別"
                  sx={{ borderRadius: '10px' }}
                >
                  {remandReason.map((reason) => (
                    <MenuItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="差戻し理由"
                    value={remandComment}
                    onChange={(e) => {
                      field.onChange(e);
                      setRemandComment(e.target.value);
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                    }}
                  />
                )}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-500 mb-3">差戻し要求送信先</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Business className="text-slate-400" />
                  <span className="text-slate-800">{approveFlowData?.internal_pic?.company_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Person className="text-slate-400" />
                  <span className="text-slate-800">{approveFlowData?.internal_pic?.user_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Email className="text-slate-400" />
                  <span className="text-slate-800">{approveFlowData?.internal_pic?.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center gap-3">
            <Button
              variant="contained"
              color="error"
              onClick={handleSubmit(handleRemand)}
              disabled={!remandComment.trim()}
              sx={{ borderRadius: '10px', textTransform: 'none', px: 4 }}
            >
              差戻し
            </Button>
            <Button
              variant="outlined"
              onClick={() => setRemandDialogOpen(false)}
              sx={{ borderRadius: '10px', textTransform: 'none', px: 4 }}
            >
              キャンセル
            </Button>
          </div>
        </Box>
      </Modal>

      {/* 破棄確認ダイアログ */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="契約書破棄の確認"
        message="契約書を破棄すると再登録が必要になります。実行してよろしいですか？"
        variant="danger"
      />

      {/* API処理中ダイアログ */}
      <ApiProcessingDialog open={apiDialogOpen} handleClose={() => setApiDialogOpen(false)} />

      {/* エラーダイアログ */}
      <ModernErrorDialog
        open={errorDialogOpen}
        onClose={() => {
          setErrorDialogOpen(false);
          if (errorProcess.includes('取得処理')) {
            navigate('/documentManagement/internalDocument');
          }
        }}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
    </>
  );
};

export default ModernInternalApprovePage;
