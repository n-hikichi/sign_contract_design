import "amazon-cognito-passwordless-auth/passwordless.css";
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { setLoginUserData } from './auth/login';
import HowToPage from './components/howTo/HowToPage';
import ModernApproveFlowStartPage from './components/pages/beforeList/ModernApproveFlowStartPage';
import ModernBeforePage from './components/pages/beforeList/ModernBeforePage';
import DeleteCompleteDialog from './components/pages/beforeList/DeleteCompleteDialog';
import ModifyCompleteDialog from "./components/pages/beforeList/ModifyCompleteDialog";
import ModernModifyHome from "./components/pages/beforeList/ModernModifyHome";
import ApproveFlowModifyPage from "./components/pages/common/ApproveFlowModifyPage";
import ApproveFlowStartDialog from './components/pages/common/ApproveFlowStartDialog';
import CommonDeleteCompleteDialog from './components/pages/common/DeleteDocumentCompleteDialog';
import DeleteAndRegisterDocumentPage from './components/pages/common/DeleteAndRegisterDocumentPage';
import ModernConcludeDocumentPage from './components/pages/concludeList/ModernConcludeDocumentPage';
import ModernConcludePage from './components/pages/concludeList/ModernConcludePage';
import ModernDiscardDocumentPage from './components/pages/concludeList/ModernDiscardDocumentPage';
import MicBoxPage from './components/pages/concludeList/MicBoxPage';
import ModernCustomerApprovePage from './components/pages/customerList/ModernCustomerApprovePage';
import ModernCustomerRemandPage from './components/pages/customerList/ModernCustomerRemandPage';
import ModernCustomerPage from './components/pages/customerList/ModernCustomerPage';
import ReissueSignedUrlRequestCompleteUser from './components/pages/customerList/ReissueSignedUrlRequestComplete';
import ReissueSignedUrlRequestCompleteInternalUser from './components/pages/internalList/ReissueSignedUrlRequestComplete';
import ModernHomePage from './components/pages/ModernHomePage';
import ApproveCompleteDialog from './components/pages/internalList/ApproveCompleteDialog';
import ModernInternalApprovePage from './components/pages/internalList/ModernInternalApprovePage';
import ModernInternalRemandPage from './components/pages/internalList/ModernInternalRemandPage';
import ModernInternalCompletePage from './components/pages/internalList/ModernInternalCompletePage';
import ModernInternalPage from './components/pages/internalList/ModernInternalPage';
import RemandRequestCompleteDialog from './components/pages/internalList/RemandRequestCompleteDialog';
import RegisterCompleteDialog from "./components/pages/register/RegisterCompleteDialog";
import ModernRegisterHome from "./components/pages/register/ModernRegisterHome";
import ModernRegisterTop from "./components/pages/register/ModernRegisterTop";
import RegisterCompleteDialogIT from "./components/pages/registerItCompany/RegisterCompleteDialogIt";
import AgreementTemplate from "./components/pages/registerItCompany/AgreementTemplate";
import AgreementDetails from "./components/pages/registerItCompany/AgreementDetails";
import DifferenceConfirmation from "./components/pages/registerItCompany/DifferenceConfirmation";
import ReviewAgreement from "./components/pages/registerItCompany/ReviewAgreement";
import RegisterHomeIT from "./components/pages/registerItCompany/RegisterHomeIt";
import ModernCompanyManagePage from './components/settings/companyManagement/ModernCompanyManagePage';
import ModernCompanyLocationManagePage from './components/settings/customerManagement/ModernCompanyLocationManagePage';
import ModernCustomerManagePage from './components/settings/customerManagement/ModernCustomerManagePage';
import ApproveDocumentPageForGuest from './components/guest/ApproveDocumentPageForGuest';
import ConcludeDocumentPageForGuest from './components/guest/ConcludeDocumentPageForGuest';
import MailBox from './mail/MailBox';
import MailBoxGuest from './mail/MailBoxGuest';
import ApproveCompleteDialogForGuest from './components/guest/ApproveCompleteDialogForGuest';
import ModernUserAccountSettings from './components/pages/administratorSettings/ModernUserAccountSettings';
import ModernAdministratorSettings from './components/pages/administratorSettings/ModernAdministratorSettings';
import ModernOrganizationSettings from './components/pages/administratorSettings/ModernOrganizationSettings';
import ModernLisenceAndCopyright from './components/pages/administratorSettings/ModernLisenceAndCopyright';

// デバッグ：メール画面
import InternalApproveFlowApproveRequestMail from "./mail/userMail/CustomerApproveFlowCompleteMail";

const App: React.FC = () => {
    useEffect(() => {
        setLoginUserData();
    }, []);

    return (
        <>
            <div className="mesh-bg" />
            <Routes>
                {/* ログイン画面 */}
            {/* TODO：CognitoのマネージドUIではなく、独自のログイン画面を作成する */}
            {/* 独自実装をした場合のルーティングに障害があるため、社内リリース開始時はCognitoのマネージドUIを使用する */}
            {/* <Route path='/login' element={<UserLogin />} /> */}
            {/* 認証が必要なルート */}
            <Route path='/*' element={
                    // <Authenticator hideSignUp>
                        <Routes>
                            <Route path='/' element={<ModernHomePage />} />
                            <Route path='*' element={<ModernHomePage />} />
                            {/* <Route path='/RequestResourceNotFoundErrorDialog' element={<RequestResourceNotFoundErrorDialog />} /> */}
                            {/* 契約書管理画面 */}
                            <Route path='documentManagement/*'>
                                {/* ダッシュボードへリダイレクト */}
                                <Route path='*' element={<Navigate to='/' />} />
                                {/* 電子契約アプリケーションの使い方画面 */}
                                <Route path='howToPage' element={<HowToPage />} />
                                {/* 登録・更新画面 */}
                                <Route path='register' element={<ModernRegisterTop />} />
                                <Route path='registerDocument' element={<ModernRegisterHome />} />
                                <Route path='register/registerComplete' element={<RegisterCompleteDialog />} />
                                <Route path='registerList' element={<ModernBeforePage />} />
                                <Route path='registerList/checkFileDetails' element={<ModernApproveFlowStartPage />} />
                                <Route path='registerList/approveFlowStart' element={<ApproveFlowStartDialog />} />
                                <Route path='registerList/deleteComplete' element={<DeleteCompleteDialog />} />
                                <Route path='modifyDocument' element={<ModernModifyHome />} />
                                <Route path='modifyDocument/modifyComplete' element={<ModifyCompleteDialog />} />
                                {/* 社内承認フロー画面 */}
                                <Route path='internalDocument' element={<ModernInternalPage />} />
                                <Route path='internalDocument/:agreementId' element={<ModernInternalPage />} />
                                <Route path='internalDocument/checkFileDetails' element={<ModernInternalApprovePage />} />
                                <Route path="internalDocument/checkFileDetails/:agreementId" element={<ModernInternalApprovePage />} />
                                <Route path='internalDocument/remandDetails' element={<ModernInternalRemandPage />} />
                                <Route path='internalDocument/remandDetails/:agreementId' element={<ModernInternalRemandPage />} />
                                <Route path='internalDocument/complete' element={<ModernInternalCompletePage />} />
                                <Route path='internalDocument/complete/:agreementId' element={<ModernInternalCompletePage />} />
                                <Route path='internalDocument/modify' element={<ApproveFlowModifyPage />} />
                                <Route path='internalDocument/deleteComplete' element={<CommonDeleteCompleteDialog />} />
                                <Route path='internalDocument/deleteAndRegisterDocument' element={<DeleteAndRegisterDocumentPage />} />
                                <Route path='internalDocument/approveComplete' element={<ApproveCompleteDialog />} />
                                <Route path='internalDocument/startCustomerApproveFlow' element={<ApproveFlowStartDialog />} />
                                <Route path='internalDocument/remandComplete' element={<RemandRequestCompleteDialog />} />
                                <Route path='internalDocument/reissueSignedUrlRequestComplete' element={<ReissueSignedUrlRequestCompleteInternalUser />} />
                                {/* 顧客承認フロー画面 */}
                                <Route path='customerDocument' element={<ModernCustomerPage />} />
                                <Route path='customerDocument/:agreementId' element={<ModernCustomerPage />} />
                                <Route path='customerDocument/checkFileDetails' element={<ModernCustomerApprovePage />} />
                                <Route path='customerDocument/checkFileDetails/:agreementId' element={<ModernCustomerApprovePage />} />
                                <Route path='customerDocument/remandDetails' element={<ModernCustomerRemandPage />} />
                                <Route path='customerDocument/remandDetails/:agreementId' element={<ModernCustomerRemandPage />} />
                                <Route path='customerDocument/deleteComplete' element={<CommonDeleteCompleteDialog />} />
                                <Route path='customerDocument/reissueSignedUrlRequestComplete' element={<ReissueSignedUrlRequestCompleteUser />} />
                                {/* 処理済みファイル画面 */}
                                <Route path='conclusionDocument' element={<ModernConcludePage />} />
                                <Route path='conclusionDocument/:agreementId' element={<ModernConcludePage />} />
                                <Route path='conclusionDocument/checkFileDetails' element={<ModernConcludeDocumentPage />} />
                                <Route path="conclusionDocument/checkFileDetails/:agreementId" element={<ModernConcludeDocumentPage />} />
                                <Route path='discardDocument/checkFileDetails' element={<ModernDiscardDocumentPage />} />
                                <Route path='conclusionDocument/micbox' element={<MicBoxPage />} />
                                {/* 登録・更新画面（IT企業特化 - 生成AI対応） */}
                                {/* <Route path='registerIt' element={<RegisterTopIT />} /> */}
                                {/* <Route path='registerIt' element={<RegisterHomeIT />} />
                                <Route path='registerItDocument' element={<RegisterHomeIT />} />
                                <Route path='registerIt/registerComplete' element={<RegisterCompleteDialogIT />} /> */}
                                {/* <Route path='registerList' element={<RegisterPage />} />
                                <Route path='registerList/checkFileDetails' element={<ModernApproveFlowStartPage />} />
                                <Route path='registerList/approveFlowStart' element={<ApproveFlowStartDialog />} />
                                <Route path='registerList/deleteComplete' element={<DeleteCompleteDialog />} /> */}
                            </Route>
                            {/* ユーザー管理画面 */}
                            <Route path='manage/*'>
                                {/* ダッシュボードへリダイレクト */}
                                <Route path='*' element={<Navigate to='/' />} />
                                {/* 自社情報管理 */}
                                <Route path='company' element={<ModernCompanyManagePage />} />
                                {/* 相手方情報管理 */}
                                <Route path='clientCompany' element={<ModernCustomerManagePage />} />
                                <Route path='clientCompanyLocation' element={<ModernCompanyLocationManagePage />} />
                            </Route>
                            {/* 管理者画面 */}
                            <Route path='advancedSettings/*'>
                                {/* ダッシュボードへリダイレクト */}
                                <Route path='*' element={<Navigate to='/' />} />
                                <Route path='userSettings' element={<ModernUserAccountSettings />} />
                                <Route path='accountSettings' element={<ModernAdministratorSettings />} />
                                <Route path='administratorSettings' element={<ModernOrganizationSettings />} />
                                <Route path='lisenceAndCopyright' element={<ModernLisenceAndCopyright />} />
                            </Route>
                             {/* 開発者機能 */}
                            <Route path='develop/*'>
                                <Route path='*' element={<Navigate to='/' />} />
                                {/* <Route path='terms/0fb235c5-0ca2-47dc-a51c-6f1b1beaba74' element={<TermsOfUseForGuest uuid="0fb235c5-0ca2-47dc-a51c-6f1b1beaba74" />} />
                                <Route path='terms/2bc3b33f-b95e-336e-8215-46bf6965f7f1' element={<TermsOfUseForGuest uuid="2bc3b33f-b95e-336e-8215-46bf6965f7f1" />} /> */}
                                <Route path='approveDocument' element={<ApproveDocumentPageForGuest />} />
                                <Route path='concludeDocument' element={<ConcludeDocumentPageForGuest />} />
                                <Route path='mailBox' element={<MailBox />} />
                                <Route path='mailBoxGuest' element={<MailBoxGuest />} />
                                <Route path='approveCompletePageForGuest' element={<ApproveCompleteDialogForGuest />} />
                                <Route path='remandCompletePageForGuest' element={<RemandRequestCompleteDialog />} />
                                <Route path='mail' element={<InternalApproveFlowApproveRequestMail />} />
                            </Route>
                            <Route path='generativeai/*'>
                                <Route path='*' element={<Navigate to='/' />} />
                                <Route path='registerIt' element={<RegisterHomeIT />} />
                                <Route path='registerItDocument' element={<RegisterHomeIT />} />
                                <Route path='registerIt/registerComplete' element={<RegisterCompleteDialogIT />} />
                                <Route path='registerIt/makeAgreementTemplate' element={<AgreementTemplate />} />
                                <Route path='registerIt/reviewAgreement' element={<ReviewAgreement />} />
                                <Route path='registerIt/differenceConfirmation' element={<DifferenceConfirmation />} />
                                <Route path='registerIt/reviewAgreement' element={<ReviewAgreement />} />
                                <Route path='registerIt/agreementDetails' element={<AgreementDetails />} />
                            </Route>
                        </Routes>
                    // </Authenticator>
                }
            />
        </Routes>
        </>
    );
}

export default App;
