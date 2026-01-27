/**
 * ModernInternalCompletePage - モダナイズされた社内承認完了画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Person, Business, Info } from '@mui/icons-material';
import api from '../../../utils/apiAccessor';
import apiDataType from '../../../utils/apiDataType';
import apiExecutor from '../../../utils/apiExecutor';
import apiStatus from '../../../utils/apiStatus';
import { getUserData } from '../../../auth/login';
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
import { NotificationInfo } from '../common/ApproverInfo';
import { ApproveFlowNotifier } from '../common/PreviewApproveFlow';
import { ModernErrorDialog } from '../../common/ModernDialog';
import ApiProcessingDialog from '../common/ApiProcessingDialog';

// 承認フローの型
interface Approver {
  company_name: string;
  user_name: string;
  email: string;
}

// 関係者リストの型
interface NotifierListColumns {
  company_name: string;
  user_name: string;
  email: string;
  position: string;
}

const status_label = '社内承認完了';

/**
 * ModernInternalCompletePage コンポーネント
 */
const ModernInternalCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agreementId } = useParams();

  // 選択された契約書情報
  const selectedInfo = agreementId
    ? location.state?.agreementInfo
    : location.state?.record;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState('');
  const [agreementData, setAgreementData] = useState<apiDataType.AgreementData>(
    apiDataType.createInitialAgreementData()
  );
  const [approveFlowData, setApproveFlowData] = useState<apiDataType.AgreementFlow>(
    apiDataType.createInitialAgreementFlow()
  );
  const [presentApprover, setPresentApprover] = useState<apiDataType.Approver>();
  const [customerFirstApprover, setCustomerFirstApprover] = useState<Approver>();
  const [isInternalPicUser, setIsInternalPicUser] = useState(false);
  const [isPresentApprover, setIsPresentApprover] = useState(false);
  const [internalNotifier, setInternalNotifier] = useState<NotifierListColumns[]>([]);
  const [customerNotifier, setCustomerNotifier] = useState<NotifierListColumns[]>([]);

  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [startFlowDialogOpen, setStartFlowDialogOpen] = useState(false);

  // API State
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
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

        setAgreementData(agreement);
        setApproveFlowData(approvals);

        // 相手方承認者フロー１番目の情報を設定
        if (approvals.customer_approver.length > 0) {
          setCustomerFirstApprover(approvals.customer_approver[0]);
        } else {
          setCustomerFirstApprover(approvals.customer_authorizer);
        }

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
          if (approvers.length === 0) continue;

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

        // PDF設定
        setPdfBase64('data:application/pdf;base64,' + file.file);

        // ユーザー権限チェック
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

  // 契約書の削除
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
      navigate('/documentManagement/registerList/deleteComplete', {
        state: { selectedInfo, deleteResponse },
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

  // 相手方承認フロー開始
  const handleStartCustomerFlow = async () => {
    setApiDialogOpen(true);
    try {
      const res = await api.postStartApprovalFlow(selectedInfo.agreement_id);
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('相手方承認フロー開始');
        setErrorDialogOpen(true);
        return;
      }

      const json = await res.json();
      navigate('/documentManagement/registerList/approveFlowStart', {
        state: {
          selectedInfo,
          approvalRequestAddress: approveFlowData.customer_pic,
          started_time: json.started_time,
        },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('相手方承認フロー開始');
      setErrorDialogOpen(true);
    } finally {
      setApiDialogOpen(false);
      setStartFlowDialogOpen(false);
    }
  };

  const tabItems = [
    { label: '承認者情報', icon: <Person /> },
    { label: '契約基本情報', icon: <Info /> },
  ];

  return (
    <>
      <ModernDetailPageLayout
        loading={isLoading}
        approveFlowData={approveFlowData}
        flowStatus={selectedInfo?.status}
        bgVariant={isInternalPicUser ? 'success' : 'default'}
      >
        {/* ステータスバナー */}
        <StatusBanner
          variant="success"
          message={
            isInternalPicUser
              ? '社内承認が完了しました。相手方承認フローを開始してください。'
              : '社内承認が完了しました。'
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
        />

        {/* 自社担当者用アクション */}
        {isInternalPicUser && (
          <ActionBar align="between">
            <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
            <ModernTabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              tabs={tabItems}
              variant="success"
            />
          </ActionBar>
        )}

        {/* 承認者情報タブ */}
        <TabPanel value={tabValue} index={0}>
          <NotificationInfo
            present_approver={presentApprover}
            isPresentApprover={isPresentApprover}
          />
          {isInternalPicUser && (
            <div className="flex justify-center mt-6">
              <SendButton
                label="相手方承認フローを開始する"
                variant="success"
                onClick={() => setStartFlowDialogOpen(true)}
              />
            </div>
          )}
        </TabPanel>

        {/* 契約基本情報タブ */}
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
                value={`${selectedInfo?.customer_company?.state || ''} ${selectedInfo?.customer_company?.city || ''} ${selectedInfo?.customer_company?.address_line || ''}`}
                fullWidth
              />
              <InfoField label="契約窓口" value={selectedInfo?.customer_pic?.user_name} />
            </div>
          </InfoCard>
        </TabPanel>
      </ModernDetailPageLayout>

      {/* PDFプレビューモーダル */}
      <PdfViewerModal
        open={pdfDialogOpen}
        onClose={() => setPdfDialogOpen(false)}
        pdfBase64={pdfBase64}
      />

      {/* 破棄確認ダイアログ */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="契約書破棄の確認"
        message="契約書を破棄すると再登録が必要になります。実行してよろしいですか？"
        variant="danger"
      />

      {/* 相手方承認フロー開始確認ダイアログ */}
      <ConfirmDialog
        open={startFlowDialogOpen}
        onClose={() => setStartFlowDialogOpen(false)}
        onConfirm={handleStartCustomerFlow}
        title="相手方承認フローを開始します"
        message="相手方に承認依頼を送信します。よろしいですか？"
        variant="success"
        confirmLabel="開始する"
      >
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">承認依頼送信先</p>
          <div className="flex items-center gap-3">
            <Business className="text-slate-400" />
            <span className="text-slate-800">{customerFirstApprover?.company_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Person className="text-slate-400" />
            <span className="text-slate-800">
              {customerFirstApprover?.user_name} ({customerFirstApprover?.email})
            </span>
          </div>
        </div>
      </ConfirmDialog>

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

export default ModernInternalCompletePage;
