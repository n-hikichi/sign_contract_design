import apiURL from "../utils/apiUrls";
import awsconfig from '../aws-exports';

// CognitoのクライアントID
const clientId = awsconfig.Auth.aws_user_pools_web_client_id;

namespace apiForGenerativeAi {
    let authorizationToken: string = '';

    export const HTTP_OK: number = 200;
    export const HTTP_BAD_REQUEST: number = 400;
    export const HTTP_UNAUTHORIZED: number = 401;
    export const HTTP_NOT_FOUND: number = 404;
    export const HTTP_INTERNAL_SERVER_ERROR: number = 500;
    export const HTTP_GATEWAY_TIMEOUT: number = 504;

    export type DeleteObject = { document_id: string, reason: string };
    export type ApproveObject = { email: string };
    export type RemandObject = { email: string, comment: string };
    export type RemandObject_debug = { responderId: string, types: string, comment: string };
    export type ReissueApprovalUrlObject = { recipient_id: string, comment: string };

    // 
    // ----- 認証情報 -----
    // 
    /**
     * 
     * 認証に関わる情報を定義する
     * 
     */
    // Authorizationヘッダに付与するアクセストークンを設定する
    export function setAuthorizationToken(token: string): void {
        authorizationToken = token;
    };

    // Getリクエストの共通オプション
    const getRequestOptions = () => {
        // アクセストークンが未設定の場合は、ローカルストレージから取得する
        if (`${authorizationToken}` === '') {
            const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
            const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`) || '';

            setAuthorizationToken(token);
        }
        return {
            method: 'GET',
            headers: { ...getAuthorizationHeader() },
        };
    };

    // AuthorizationHeaderを設定する共通関数
    const getAuthorizationHeader = () => {
        return { 'Authorization': `${authorizationToken}` };
    };

    // 
    // ----- 契約書情報(agreements) -----
    // 
    /**
     * 書類情報一覧を取得するAPI
     * 対応API：Get /agreements
     * @param queryParam クエリパラメータ
     * @returns レスポンス
     */
    export const getAgreementList = async (status: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL + '?status=' + status, getRequestOptions());
    };
    /**
     * 契約書を登録するAPI
     * 対応API：Post /agreements
     * @param body リクエストボディ
     * @returns レスポンス
     */
    export const postAgreement = async (body: object): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.AGREEMENTS_URL, requestOptions);
    };
    /**
     * 契約の件数を取得するAPI
     * 対応API：Get /agreements/count
     * @returns レスポンス
     */
    export const getAgreementCount = async (): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL + '/count', getRequestOptions());
    };
    /**
     * 書類情報を取得するAPI
     * 対応API：Get /agreements/{agreement_id}
     * @param queryParam クエリパラメータ
     * @returns レスポンス
     */
    export const getAgreement = async (agreement_id: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreement_id, getRequestOptions());
    };
    /**
     * 契約書を更新するAPI
     * 対応API：Put /agreements/{agreement_id}
     * @param agreementId 書類ID
     * @param body リクエストボディ
     * @returns レスポンス
     */
    export const putAgreement = async (agreementId: string, body: object): Promise<Response> => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId, requestOptions);
    };
    /**
     * 契約書を削除するAPI
     * 対応API:Delete /agreements/{agreement_id}
     * @param deleteObjects 削除対象の書類IDと削除理由
     */
    export const deleteAgreement = async (agreementId: string): Promise<Response> => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId, requestOptions);
    };
    /**
     * 契約ファイルを取得する
     * 対応API：Get /agreements/{agreement_id}/file
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getAgreementFile = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/file', getRequestOptions());
    };
    /**
     * 契約の承認情報を取得する
     * 対応API：Get /agreements/{agreement_id}/approvals
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getAgreementApprovals = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/approvals', getRequestOptions());
    };
    /**
     * 契約を承認する
     * 対応API：Post /agreements/{agreement_id}/approvals
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postAgreementApprovals = async (agreementId: string): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/approvals', requestOptions);
    };
    /**
     * 承認フローを開始する（承認フロー開始）
     * 対応API：Post /agreements/{agreement_id}/start_flow
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postStartApprovalFlow = async (agreementId: string): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/start_flow', requestOptions);
    };
    /**
     * 承認フローを開始する（承認フロー再開）
     * 対応API：Post /agreements/{agreement_id}/start_flow
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postRestartApprovalFlow = async (agreementId: string, comment: string): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(comment),
        };
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/start_flow', requestOptions);
    };
    /**
     * 契約書の差し戻し情報を取得する
     * 対応API：Get /agreements/{agreement_id}/remand
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getRemandRequest = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/remands', getRequestOptions());
    };
    /**
     * 契約を差し戻す
     * 対応API：Post /agreements/{agreement_id}/remand
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postAgreementRemand = async (agreementId: string, body: object): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/remands', requestOptions);
    };
    /**
     * 承認用URLを発行する
     * 対応API：Post /agreements/{agreement_id}/approval_url
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    // export const postApprovalUrl = async (agreementId: string, body: ReissueApprovalUrlObject[]): Promise<Response> => {
    //     const requestOptions = {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
    //         body: JSON.stringify(body),
    //     };
    //     return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/approval_url', requestOptions);
    // };
    export const postApprovalUrl = async (agreementId: string): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/approval_url', requestOptions);
    };
    /**
     * 契約の署名一覧を検証・取得する
     * 対応API：
     * ・Get /agreements/{agreement_id}/signatures
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getAgreementSignatures = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL + '/' + agreementId + '/signatures', getRequestOptions());
    };


    // 
    // ----- 署名情報 (signature_templates) -----
    // 
    /**
     * 署名テンプレート一覧を取得するAPI
     * 対応API：Get /signature_templates
     * @returns レスポンス
     */
    export const getSignedTemplateFile = async (templateId: string): Promise<Response> => {
        return await fetch(apiURL.SIGN_TEMPLATE_URL + '/' + templateId, getRequestOptions());
    };
    /**
     * 署名テンプレート一覧を取得するAPI
     * 対応API：Get /signature_templates/{template_id}
     * @returns レスポンス
     */
    export const getSignedTemplateList = async (): Promise<Response> => {
        return await fetch(apiURL.SIGN_TEMPLATE_URL, getRequestOptions());
    };


    // 
    // ----- ユーザー情報(users) -----
    // 
    /**
     * ユーザー情報を取得するAPI
     * 対応API：Get /users
     * @returns レスポンス
     */
    export const getUserData = async (companyId: string): Promise<Response> => {
        return await fetch(apiURL.USER_URL + '?company_id=' + companyId, getRequestOptions());
    };
    /**
     * ユーザー情報を登録するAPI
     * 対応API：Post /users
     * @returns レスポンス
     */
    export const postUserData = async (body: object): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.USER_URL, requestOptions);
    };
    /**
     * ユーザー情報を更新するAPI
     * 対応API：Put /users
     * @returns レスポンス
     */
    export const putUserData = async (userId: string, body: object): Promise<Response> => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.USER_URL + '/' + userId, requestOptions);
    };
    /**
     * ユーザー情報を削除するAPI
     * 対応API：Delete /users
     * @returns レスポンス
     */
    export const deleteUserData = async (userId: string): Promise<Response> => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.USER_URL + '/' + userId, requestOptions);
    };


    // 
    // ----- 企業情報（company） -----
    // 
    /**
     * 企業情報を取得するAPI
     * 対応API：Get /company
     * @returns レスポンス
     */
    export const getCompanyList = async (companyType: string): Promise<Response> => {
        return await fetch(apiURL.COMPANY_URL + '?company_type=' + companyType, getRequestOptions());
    };
    /**
     * 企業情報を登録するAPI
     * 対応API：Post /users
     * @returns レスポンス
     */
    export const postCompanyData = async (body: object): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.COMPANY_URL, requestOptions);
    };
    /**
     * 企業情報を更新するAPI
     * 対応API：Post /users
     * @returns レスポンス
     */
    export const putCompanyData = async (companyId: string, body: object): Promise<Response> => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.COMPANY_URL + '/' + companyId, requestOptions);
    };
    /**
     * 企業情報を削除するAPI
     * 対応API：Post /users
     * @returns レスポンス
     */
    export const deleteCompanyData = async (companyId: string): Promise<Response> => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.COMPANY_URL + '/' + companyId, requestOptions);
    };


    // 
    // ----- 拠点情報（location） -----
    // 
    /**
     * 拠点情報を取得するAPI
     * 対応API：Get /company
     * @returns レスポンス
     */
    export const getLocationList = async (locationId: string): Promise<Response> => {
        return await fetch(apiURL.COMPANY_URL + '/' + locationId + '/locations', getRequestOptions());
    };
    /**
     * 拠点情報を登録するAPI
     * 対応API：Post /users
     * @returns レスポンス
     */
    export const postLocationData = async (locationId: string, body: object): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.COMPANY_URL + '/' + locationId + '/locations', requestOptions);
    };
    /**
     * 拠点情報を更新するAPI
     * 対応API：Post /users
     * @returns レスポンス
     */
    export const putLocationData = async (companyId: string, locationId: string, body: object): Promise<Response> => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.COMPANY_URL + '/' + companyId + '/locations/' + locationId, requestOptions);
    };
    /**
     * 拠点情報を削除するAPI
     * 対応API：Post /users
     * @returns レスポンス
     */
    export const deleteLocationData = async (companyId: string, locationId: string): Promise<Response> => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.COMPANY_URL + '/' + companyId + '/locations/' + locationId, requestOptions);
    };






    // 
    // ----- ゲストユーザー向けAPI -----
    // 
    /**
     * 書類情報を取得するAPI
     * 対応API：Get /agreements/{agreement_id}
     * @param queryParam クエリパラメータ
     * @returns レスポンス
     */
    export const getAgreementForGuest = async (agreement_id: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreement_id, getRequestOptions());
    };

    /**
     * 契約ファイルを取得する
     * 対応API：Get /agreements/{agreement_id}/file
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getAgreementFileForGuest = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/file', getRequestOptions());
    };

    /**
     * 契約の承認情報を取得する
     * 対応API：Get /agreements/{agreement_id}/approvals
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getAgreementApprovalsForGuest = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/approvals', getRequestOptions());
    };

    /**
     * 契約を承認する
     * 対応API：Post /agreements/{agreement_id}/approvals
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postAgreementApprovalsForGuest = async (agreementId: string): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/approvals', requestOptions);
    };

    /**
     * 承認フローを開始する（承認フロー開始）
     * 対応API：Post /agreements/{agreement_id}/start_flow
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postStartApprovalFlowForGuest = async (agreementId: string): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
        };
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/start_flow', requestOptions);
    };

    /**
     * 契約書の差し戻し情報を取得する
     * 対応API：Get /agreements/{agreement_id}/remand
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getRemandRequestForGuest = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/remands', getRequestOptions());
    };

    /**
     * 契約を差し戻す
     * 対応API：Post /agreements/{agreement_id}/remand
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postAgreementRemandForGuest = async (agreementId: string, body: RemandObject[]): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/remands', requestOptions);
    };

    /**
     * 承認用URLを発行する
     * 対応API：Post /agreements/{agreement_id}/approval_url
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const postApprovalUrlForGuest = async (agreementId: string, body: ReissueApprovalUrlObject[]): Promise<Response> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthorizationHeader() },
            body: JSON.stringify(body),
        };
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/approval_url', requestOptions);
    };

    /**
     * 契約の署名一覧を検証・取得する
     * 対応API：
     * ・Get /agreements/{agreement_id}/signatures
     * @param agreementId 書類ID
     * @returns レスポンス
     */
    export const getAgreementSignaturesForGuest = async (agreementId: string): Promise<Response> => {
        return await fetch(apiURL.AGREEMENTS_URL_GUEST + '/' + agreementId + '/signatures', getRequestOptions());
    };

};

export default apiForGenerativeAi;