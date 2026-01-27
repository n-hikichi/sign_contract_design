/**
 * ModernInternalRemandPage - モダナイズされた社内差戻し画面
 *
 * MUI v6 + Tailwind CSS ハイブリッドスタイリング
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Email, Business, Person, AssignmentReturn } from '@mui/icons-material';
import api from '../../../utils/apiAccessor';
import apiDataType from '../../../utils/apiDataType';
import apiExecutor from '../../../utils/apiExecutor';
import { getUserData } from '../../../auth/login';
import ModernDetailPageLayout, {
  StatusBanner,
  TitleBar,
  ActionBar,
  BackButton,
  DeleteButton,
  InfoCard,
  InfoField,
  PdfViewerModal,
  ConfirmDialog,
} from '../../templates/ModernDetailPageLayout';
import { ModernErrorDialog } from '../../common/ModernDialog';
import ApiProcessingDialog from '../common/ApiProcessingDialog';

const status_label = '社内差戻し中';

/**
 * ModernInternalRemandPage コンポーネント
 */
const ModernInternalRemandPage: React.FC = () => {
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
  const [approveFlowData, setApproveFlowData] = useState<apiDataType.AgreementFlow>(
    apiDataType.createInitialAgreementFlow()
  );
  const [presentApprover, setPresentApprover] = useState<apiDataType.Approver>(
    apiDataType.createInitialApprover()
  );
  const [remandInfo, setRemandInfo] = useState<apiDataType.RemandInfo>(
    apiDataType.createInitialRemandRequest()
  );
  const [isInternalPicUser, setIsInternalPicUser] = useState(false);

  // UI State
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
          apiExecutor.fetchGetRemandRequest(selectedInfo.agreement_id),
        ];

        const responses = await Promise.all(requests);
        const errorResponse = responses.find((res: Response) => res.status !== 200);

        if (errorResponse) {
          setErrorCode(errorResponse.status);
          setErrorProcess('社内承認フロー　契約書取得処理');
          setErrorDialogOpen(true);
          return;
        }

        const [agreement, approvals, file, remandRequest] = await Promise.all(
          responses.map((res: Response) => res.json())
        );

        setApproveFlowData(approvals);

        // 現在の承認者を設定
        const presentApproverId = approvals.present_approver;
        const presentApproverInfo = Object.values(approvals)
          .flat()
          .find((approver: any) => approver.approver_id === presentApproverId) as apiDataType.Approver;
        setPresentApprover(presentApproverInfo);

        // PDF設定
        setPdfBase64('data:application/pdf;base64,' + file.file);

        // 差戻し情報設定
        if (remandRequest && remandRequest.length > 0) {
          setRemandInfo(remandRequest[0]);
        }

        // ユーザー権限チェック
        const loginUser = getUserData();
        if (approvals.internal_pic.email === loginUser) {
          setIsInternalPicUser(true);
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
      const flowStatus = selectedInfo.status;
      navigate('/documentManagement/internalDocument/deleteComplete', {
        state: { selectedInfo, deleteResponse, flowStatus, approveFlowData },
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

  // 差戻し区分のラベル変換
  const getRemandTypeLabel = (types: string | string[] | undefined) => {
    const typeMap: { [key: string]: string } = {
      CONTRACT_CONTENT: '契約内容の修正',
      DOCUMENT_ERROR: '書類の誤り',
      OTHER: 'その他',
    };
    if (!types) return '-----';
    const typeArray = Array.isArray(types) ? types : [types];
    return typeArray.map(t => typeMap[t] || t).join(', ');
  };

  return (
    <>
      <ModernDetailPageLayout
        loading={isLoading}
        approveFlowData={approveFlowData}
        flowStatus={selectedInfo?.status}
        bgVariant={isInternalPicUser ? 'error' : 'default'}
      >
        {/* ステータスバナー */}
        <StatusBanner
          variant="error"
          message={
            isInternalPicUser
              ? '差戻し依頼が届いています。依頼者からのメッセージを確認して対応してください。'
              : '差戻し依頼が発行されました。現在自社担当者による対応が行われています。'
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
          <ActionBar>
            <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
          </ActionBar>
        )}

        {/* 差戻し依頼内容 */}
        <InfoCard title="差戻し依頼内容" variant="error">
          <div className="space-y-4">
            {/* 依頼者情報 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AssignmentReturn className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">依頼者</p>
                  <p className="font-medium text-slate-800">
                    {presentApprover?.user_name}（{presentApprover?.email}）
                  </p>
                </div>
              </div>
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
            </div>

            {/* 差戻し区分 */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-600 mb-1">差戻し区分</p>
              <p className="font-semibold text-amber-800 text-lg">
                {getRemandTypeLabel(remandInfo?.types)}
              </p>
            </div>

            {/* 差戻しコメント */}
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">差戻しコメント</p>
              <div className="p-4 bg-slate-50 rounded-lg min-h-[100px]">
                <p className="text-slate-800 whitespace-pre-wrap">
                  {remandInfo?.comment || 'コメントなし'}
                </p>
              </div>
            </div>
          </div>
        </InfoCard>
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

export default ModernInternalRemandPage;
