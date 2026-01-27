import "amazon-cognito-passwordless-auth/passwordless.css";
import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import login, {setLoginUserData} from './auth/login';
import HowToPage from './components/howTo/HowToPage';
import ApproveFlowStartPage from './components/pages/beforeList/ApproveFlowStartPage';
import RegisterPage from './components/pages/beforeList/BeforePage';
import DeleteCompleteDialog from './components/pages/beforeList/DeleteCompleteDialog';
import ModifyCompleteDialog from "./components/pages/beforeList/ModifyCompleteDialog";
import ModifyHome from "./components/pages/beforeList/ModifyHome";
import ApproveFlowModifyPage from "./components/pages/common/ApproveFlowModifyPage";
import ApproveFlowStartDialog from './components/pages/common/ApproveFlowStartDialog';
import CommonDeleteCompleteDialog from './components/pages/common/DeleteDocumentCompleteDialog';
import DeleteAndRegisterDocumentPage from './components/pages/common/DeleteAndRegisterDocumentPage';
import RequestResourceNotFoundErrorDialog from "./components/pages/common/RequestResourceNotFoundErrorDialog";
import ConcludeDocumentPage from './components/pages/concludeList/ConcludeDocumentPage';
import ConcludePage from './components/pages/concludeList/ConcludePage';
import DiscardDocumentPage from './components/pages/concludeList/DiscardDocumentPage';
import MicBoxPage from './components/pages/concludeList/MicBoxPage';
import CustomerApprovePage from './components/pages/customerList/CustomerApprovePage';
import CustomerRemandPage from './components/pages/customerList/CustomerRemandPage';
import CustomerPage from './components/pages/customerList/CustomerPage';
import ReissueSignedUrlRequestComplete_User from './components/pages/customerList/ReissueSignedUrlRequestComplete';
import ReissueSignedUrlRequestComplete_InternalUser from './components/pages/internalList/ReissueSignedUrlRequestComplete';
import HomePage from './components/pages/HomePage';
import ApproveCompleteDialog from './components/pages/internalList/ApproveCompleteDialog';
import InternalApprovePage from './components/pages/internalList/InternalApprovePage';
import InternalRemandPage from './components/pages/internalList/InternalRemandPage';
import InternalCompletePage from './components/pages/internalList/InternalCompletePage';
import InternalPage from './components/pages/internalList/InternalPage';
import RemandRequestCompleteDialog from './components/pages/internalList/RemandRequestCompleteDialog';
import RegisterCompleteDialog from "./components/pages/register/RegisterCompleteDialog";
import RegisterHome from "./components/pages/register/RegisterHome";
import RegisterTop from "./components/pages/register/RegisterTop";
import RegisterCompleteDialogIT from "./components/pages/registerItCompany/RegisterCompleteDialogIt";
import AgreementTemplate from "./components/pages/registerItCompany/AgreementTemplate";
import AgreementDetails from "./components/pages/registerItCompany/AgreementDetails";
import DifferenceConfirmation from "./components/pages/registerItCompany/DifferenceConfirmation";
import ReviewAgreement from "./components/pages/registerItCompany/ReviewAgreement";
import RegisterHomeIT from "./components/pages/registerItCompany/RegisterHomeIt";
import RegisterTopIT from "./components/pages/registerItCompany/RegisterTopIt";
import CompanyManagePage from './components/settings/companyManagement/CompanyManagePage';
import CompanyLocationManagePage from './components/settings/customerManagement/CompanyManagePage';
import CustomerCompanyManagePage from './components/settings/customerManagement/CustomerManagePage';
import TermsOfUseForGuest from './components/guest/TermsOfUseForGuest';
import ApproveDocumentPageForGuest from './components/guest/ApproveDocumentPageForGuest';
import ConcludeDocumentPageForGuest from './components/guest/ConcludeDocumentPageForGuest';
import MailBox from './mail/MailBox';
import MailBoxGuest from './mail/MailBoxGuest';
import ApproveCompleteDialogForGuest from './components/guest/ApproveCompleteDialogForGuest';
import UserAccountSettings from './components/pages/administratorSettings/UserAccountSettings';
import AdministratorSettings from './components/pages/administratorSettings/AdministratorSettings';
import ApplicationSettings from './components/pages/administratorSettings/OrganizationSettings';
import LisenceAndCopyright from './components/pages/administratorSettings/LisenceAndCopyright';

// デバッグ：メール画面
import InternalApproveFlowApproveRequestMail from "./mail/userMail/CustomerApproveFlowCompleteMail";

const LOGIN_STATE_LOADING = 'loading';

const App: React.FC = () => {
    const location = useLocation();
    const [status, setStatus] = useState(LOGIN_STATE_LOADING);

    useEffect(() => {
        const fetchLogin = async () => {
            const result = await setLoginUserData();
            setStatus(result);
        };

        fetchLogin();
    }, []);

    return (
        <Routes>
            {/* ログイン画面 */}
            {/* TODO：CognitoのマネージドUIではなく、独自のログイン画面を作成する */}
            {/* 独自実装をした場合のルーティングに障害があるため、社内リリース開始時はCognitoのマネージドUIを使用する */}
            {/* <Route path='/login' element={<UserLogin />} /> */}
            {/* 認証が必要なルート */}
            <Route path='/*' element={
                    // <Authenticator hideSignUp>
                        <Routes>
                            <Route path='/' element={<HomePage />} />
                            <Route path='*' element={<HomePage />} />
                            {/* <Route path='/RequestResourceNotFoundErrorDialog' element={<RequestResourceNotFoundErrorDialog />} /> */}
                            {/* 契約書管理画面 */}
                            <Route path='documentManagement/*'>
                                {/* ダッシュボードへリダイレクト */}
                                <Route path='*' element={<Navigate to='/' />} />
                                {/* 電子契約アプリケーションの使い方画面 */}
                                <Route path='howToPage' element={<HowToPage />} />
                                {/* 登録・更新画面 */}
                                <Route path='register' element={<RegisterTop />} />
                                <Route path='registerDocument' element={<RegisterHome />} />
                                <Route path='register/registerComplete' element={<RegisterCompleteDialog />} />
                                <Route path='registerList' element={<RegisterPage />} />
                                <Route path='registerList/checkFileDetails' element={<ApproveFlowStartPage />} />
                                <Route path='registerList/approveFlowStart' element={<ApproveFlowStartDialog />} />
                                <Route path='registerList/deleteComplete' element={<DeleteCompleteDialog />} />
                                <Route path='modifyDocument' element={<ModifyHome />} />
                                <Route path='modifyDocument/modifyComplete' element={<ModifyCompleteDialog />} />
                                {/* 社内承認フロー画面 */}
                                <Route path='internalDocument' element={<InternalPage />} />
                                <Route path='internalDocument/:agreementId' element={<InternalPage />} />
                                <Route path='internalDocument/checkFileDetails' element={<InternalApprovePage />} />
                                <Route path="internalDocument/checkFileDetails/:agreementId" element={<InternalApprovePage />} />
                                <Route path='internalDocument/remandDetails' element={<InternalRemandPage />} />
                                <Route path='internalDocument/remandDetails/:agreementId' element={<InternalRemandPage />} />
                                <Route path='internalDocument/complete' element={<InternalCompletePage />} />
                                <Route path='internalDocument/complete/:agreementId' element={<InternalCompletePage />} />
                                <Route path='internalDocument/modify' element={<ApproveFlowModifyPage />} />
                                <Route path='internalDocument/deleteComplete' element={<CommonDeleteCompleteDialog />} />
                                <Route path='internalDocument/deleteAndRegisterDocument' element={<DeleteAndRegisterDocumentPage />} />
                                <Route path='internalDocument/approveComplete' element={<ApproveCompleteDialog />} />
                                <Route path='internalDocument/startCustomerApproveFlow' element={<ApproveFlowStartDialog />} />
                                <Route path='internalDocument/remandComplete' element={<RemandRequestCompleteDialog />} />
                                <Route path='internalDocument/reissueSignedUrlRequestComplete' element={<ReissueSignedUrlRequestComplete_InternalUser />} />
                                {/* 顧客承認フロー画面 */}
                                <Route path='customerDocument' element={<CustomerPage />} />
                                <Route path='customerDocument/:agreementId' element={<CustomerPage />} />
                                <Route path='customerDocument/checkFileDetails' element={<CustomerApprovePage />} />
                                <Route path='customerDocument/checkFileDetails/:agreementId' element={<CustomerApprovePage />} />
                                <Route path='customerDocument/remandDetails' element={<CustomerRemandPage />} />
                                <Route path='customerDocument/remandDetails/:agreementId' element={<CustomerRemandPage />} />
                                <Route path='customerDocument/deleteComplete' element={<CommonDeleteCompleteDialog />} />
                                <Route path='customerDocument/reissueSignedUrlRequestComplete' element={<ReissueSignedUrlRequestComplete_User />} />
                                {/* 処理済みファイル画面 */}
                                <Route path='conclusionDocument' element={<ConcludePage />} />
                                <Route path='conclusionDocument/:agreementId' element={<ConcludePage />} />
                                <Route path='conclusionDocument/checkFileDetails' element={<ConcludeDocumentPage />} />
                                <Route path="conclusionDocument/checkFileDetails/:agreementId" element={<ConcludeDocumentPage />} />
                                <Route path='discardDocument/checkFileDetails' element={<DiscardDocumentPage />} />
                                <Route path='conclusionDocument/micbox' element={<MicBoxPage />} />
                                {/* 登録・更新画面（IT企業特化 - 生成AI対応） */}
                                {/* <Route path='registerIt' element={<RegisterTopIT />} /> */}
                                {/* <Route path='registerIt' element={<RegisterHomeIT />} />
                                <Route path='registerItDocument' element={<RegisterHomeIT />} />
                                <Route path='registerIt/registerComplete' element={<RegisterCompleteDialogIT />} /> */}
                                {/* <Route path='registerList' element={<RegisterPage />} />
                                <Route path='registerList/checkFileDetails' element={<ApproveFlowStartPage />} />
                                <Route path='registerList/approveFlowStart' element={<ApproveFlowStartDialog />} />
                                <Route path='registerList/deleteComplete' element={<DeleteCompleteDialog />} /> */}
                            </Route>
                            {/* ユーザー管理画面 */}
                            <Route path='manage/*'>
                                {/* ダッシュボードへリダイレクト */}
                                <Route path='*' element={<Navigate to='/' />} />
                                {/* 自社情報管理 */}
                                <Route path='company' element={<CompanyManagePage />} />
                                {/* 相手方情報管理 */}
                                <Route path='clientCompany' element={<CustomerCompanyManagePage />} />
                                <Route path='clientCompanyLocation' element={<CompanyLocationManagePage />} />
                            </Route>
                            {/* 管理者画面 */}
                            <Route path='advancedSettings/*'>
                                {/* ダッシュボードへリダイレクト */}
                                <Route path='*' element={<Navigate to='/' />} />
                                <Route path='userSettings' element={<UserAccountSettings />} />
                                <Route path='accountSettings' element={<AdministratorSettings />} />
                                <Route path='administratorSettings' element={<ApplicationSettings />} />
                                <Route path='lisenceAndCopyright' element={<LisenceAndCopyright />} />
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
    );
}

export default App;
