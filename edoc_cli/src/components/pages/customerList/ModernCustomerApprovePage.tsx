/**
 * ModernCustomerApprovePage - モダナイズされた相手方承認中画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Email, Business, Person, Send, Description } from '@mui/icons-material';
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
  InfoCard,
  InfoField,
  ModernTabs,
  TabPanel,
  PdfViewerModal,
  ConfirmDialog,
} from '../../templates/ModernDetailPageLayout';
import { ModernErrorDialog } from '../../common/ModernDialog';
import ApiProcessingDialog from '../common/ApiProcessingDialog';

const status_label = '相手方承認中';

// 関係者情報の型定義
interface NotifierListColumns {
  company_name: string;
  user_name: string;
  email: string;
  position: string;
}

/**
 * ModernCustomerApprovePage コンポーネント
 */
const ModernCustomerApprovePage: React.FC = () => {
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
  const [presentApprover, setPresentApprover] = useState<apiDataType.Approver>(
    apiDataType.createInitialApprover()
  );
  const [isInternalPicUser, setIsInternalPicUser] = useState(false);
  const [internalNotifier, setInternalNotifier] = useState<NotifierListColumns[]>([]);
  const [customerNotifier, setCustomerNotifier] = useState<NotifierListColumns[]>([]);

  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reissueDialogOpen, setReissueDialogOpen] = useState(false);

  // API State
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorCode, setErrorCode] = useState(0);
  const [errorProcess, setErrorProcess] = useState('');

  useEffect(() => {
    if (!selectedInfo) {
      setErrorCode(api.HTTP_NOT_FOUND);
      setErrorProcess('相手方承認フロー　契約書取得処理');
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
          setErrorProcess('相手方承認フロー　契約書取得処理');
          setErrorDialogOpen(true);
          return;
        }

        const [agreement, approvals, file] = await Promise.all(
          responses.map((res: Response) => res.json())
        );

        setAgreementData(agreement);
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
        setErrorProcess('相手方承認フロー　契約書取得処理');
        setErrorDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 署名用URL再発行
  const handleReissueUrl = async () => {
    setApiDialogOpen(true);
    try {
      const body = {
        recipient_id: presentApprover?.approver_id,
      };

      const res = await api.postApprovalUrl(selectedInfo.agreement_id, body);
      if (res.status !== api.HTTP_OK) {
        setErrorCode(res.status);
        setErrorProcess('署名用URL再発行処理');
        setErrorDialogOpen(true);
        return;
      }

      const issuedTime = await res.json();
      navigate('/documentManagement/customerDocument/reissueSignedUrlRequestComplete', {
        state: { selectedInfo, presentApprover, issuedTime },
      });
    } catch (error) {
      setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
      setErrorProcess('署名用URL再発行処理');
      setErrorDialogOpen(true);
    } finally {
      setApiDialogOpen(false);
      setReissueDialogOpen(false);
    }
  };

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
      navigate('/documentManagement/customerDocument/deleteComplete', {
        state: { deleteResponse, selectedInfo, approveFlowData },
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

  const tabs = [
    { label: '承認者情報', icon: <Person /> },
    { label: '登録情報', icon: <Description /> },
  ];

  return (
    <>
      <ModernDetailPageLayout
        loading={isLoading}
        approveFlowData={approveFlowData}
        flowStatus={selectedInfo?.status}
        bgVariant={isInternalPicUser ? 'primary' : 'default'}
      >
        {/* ステータスバナー */}
        <StatusBanner variant="info" message="相手方企業が承認中です" />

        {/* アクションバー */}
        <ActionBar>
          <BackButton onClick={() => navigate('/documentManagement/customerDocument')} />
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
          <ActionBar>
            <button
              onClick={() => setReissueDialogOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Send fontSize="small" />
              署名用URLを発行する
            </button>
            <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
          </ActionBar>
        )}

        {/* 自社担当者用タブ */}
        {isInternalPicUser && (
          <>
            <ModernTabs
              tabs={tabs}
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
            />

            <TabPanel value={tabValue} index={0}>
              {/* 現在の承認者情報 */}
              <InfoCard title="現在の承認者">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Person className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">氏名</p>
                      <p className="font-medium text-slate-800 text-lg">
                        {presentApprover?.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Business className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">会社名</p>
                        <p className="font-medium text-slate-800">
                          {presentApprover?.company_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Email className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">メールアドレス</p>
                        <p className="font-medium text-slate-800">
                          {presentApprover?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  {presentApprover?.position && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Person className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">役職</p>
                        <p className="font-medium text-slate-800">
                          {presentApprover.position}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </InfoCard>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* 契約基本情報 */}
              <InfoCard title="契約基本情報">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="契約種別"
                    value={selectedInfo?.type}
                  />
                  <InfoField
                    label="契約金額"
                    value={selectedInfo?.deal_amount}
                  />
                  <InfoField
                    label="署名用URLの有効期限"
                    value={`${approveFlowData?.submission_period}日`}
                  />
                  <InfoField
                    label="契約開始日"
                    value={selectedInfo?.conclusion_date}
                  />
                  <InfoField
                    label="契約終了日"
                    value={selectedInfo?.expiration_date}
                  />
                </div>
              </InfoCard>

              {/* 自社登録情報 */}
              <InfoCard title="自社登録情報">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="企業名"
                    value={selectedInfo?.own_company?.company_name}
                  />
                  <InfoField
                    label="郵便番号"
                    value={selectedInfo?.own_company?.postal_code}
                  />
                  <div className="md:col-span-2">
                    <InfoField
                      label="住所"
                      value={`${selectedInfo?.own_company?.state || ''} ${selectedInfo?.own_company?.city || ''} ${selectedInfo?.own_company?.address_line || ''} ${selectedInfo?.own_company?.building || ''}`}
                    />
                  </div>
                  <InfoField
                    label="契約窓口"
                    value={selectedInfo?.internal_pic?.user_name}
                  />
                </div>
              </InfoCard>

              {/* 相手方登録情報 */}
              <InfoCard title="相手方登録情報">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="企業名"
                    value={selectedInfo?.customer_company?.company_name}
                  />
                  <InfoField
                    label="郵便番号"
                    value={selectedInfo?.customer_company?.postal_code}
                  />
                  <div className="md:col-span-2">
                    <InfoField
                      label="住所"
                      value={`${selectedInfo?.customer_company?.state || ''} ${selectedInfo?.customer_company?.city || ''} ${selectedInfo?.customer_company?.address_line || ''} ${selectedInfo?.customer_company?.building || ''}`}
                    />
                  </div>
                  <InfoField
                    label="契約窓口"
                    value={selectedInfo?.customer_pic?.user_name}
                  />
                </div>
              </InfoCard>
            </TabPanel>
          </>
        )}

        {/* 非担当者向け：承認者情報のみ表示 */}
        {!isInternalPicUser && (
          <InfoCard title="現在の承認者">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Person className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">氏名</p>
                  <p className="font-medium text-slate-800 text-lg">
                    {presentApprover?.user_name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Business className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">会社名</p>
                    <p className="font-medium text-slate-800">
                      {presentApprover?.company_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Email className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">メールアドレス</p>
                    <p className="font-medium text-slate-800">
                      {presentApprover?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>
        )}
      </ModernDetailPageLayout>

      {/* PDFプレビューモーダル */}
      <PdfViewerModal
        open={pdfDialogOpen}
        onClose={() => setPdfDialogOpen(false)}
        pdfBase64={pdfBase64}
      />

      {/* 署名用URL再発行確認ダイアログ */}
      <ConfirmDialog
        open={reissueDialogOpen}
        onClose={() => setReissueDialogOpen(false)}
        onConfirm={handleReissueUrl}
        title="署名用URLの発行確認"
        message={`以下の宛先に署名用URLを発行します。よろしいですか？\n\n会社名: ${presentApprover?.company_name || ''}\n氏名: ${presentApprover?.user_name || ''}\nメールアドレス: ${presentApprover?.email || ''}`}
        variant="success"
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

      {/* API処理中ダイアログ */}
      <ApiProcessingDialog open={apiDialogOpen} handleClose={() => setApiDialogOpen(false)} />

      {/* エラーダイアログ */}
      <ModernErrorDialog
        open={errorDialogOpen}
        onClose={() => {
          setErrorDialogOpen(false);
          if (errorProcess.includes('取得処理')) {
            navigate('/documentManagement/customerDocument');
          }
        }}
        errorCode={errorCode}
        errorProcess={errorProcess}
      />
    </>
  );
};

export default ModernCustomerApprovePage;
