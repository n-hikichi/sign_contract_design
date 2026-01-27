import appMessage from './appMessage';
import api from './apiAccessor';

export namespace generativeAiApiExecutor {
    /***
     * 
     * API定義 （POST、PUT、DELETEメソッド向け）
     * 
     */
    export const executeApiRequest = async (apiFunction: () => Promise<Response>, onSuccess: (json: any) => void, onError: (errorCode: number) => void) => {
        console.log("Execute API Request.");
        try {
            const res = await apiFunction();
            if (res.status !== appMessage.SUCCESS) {
                console.log("API response failed. HTTP Status: " + res.status);
                onError(res.status); // エラーコードを渡す
                return;
            }

            const json = await res.json();
            onSuccess(json);
        } catch (error) {
            console.log("An unexpected error has occurred.");
            onError(appMessage.INTERNAL_SERVER_ERROR); // ネットワークエラーなどの場合、500を渡す
        }
    };

    /***
     * 
     * API定義 （GETメソッド向け）
     * 
     */
    // 
    // ----- 契約書情報(agreements) -----
    // 
    // 契約書情報一覧を取得
    export const fetchGetAgreementList = async (status: string) => {
        return await api.getAgreementList(status);
    };

    // 契約書の件数を取得
    export const fetchGetCount = async () => {
        return await api.getAgreementCount();
    };

    // 1件の契約書情報を取得
    export const fetchGetAgreement = async (agreementId: string) => {
        return await api.getAgreement(agreementId);
    };

    // 契約書ファイルを取得
    export const fetchGetAgreementFile = async (agreementId: string) => {
        return await api.getAgreementFile(agreementId)
    };

    // 契約書の承認フロー情報を取得
    export const fetchGetAgreementApprovals = async (agreementId: string) => {
        return await api.getAgreementApprovals(agreementId);
    };

    // 契約書の差戻し情報を取得
    export const fetchGetRemandRequest = async (agreementId: string) => {
        return await api.getRemandRequest(agreementId);
    };

    // 契約書の署名一覧を検証・取得
    export const fetchGetAgreementSignatures = async (agreementId: string) => {
        return await api.getAgreementSignatures(agreementId);
    };
 
    // 
    // ----- 署名情報 (signature_templates) -----
    // 
    // 署名テンプレートを取得
    export const fetchGetSignedTemplateFile = async (templateId: string) => {
        return await api.getSignedTemplateFile(templateId);
    };

    // 署名テンプレート一覧を取得
    export const fetchGetSignedTemplateList = async () => {
        return await api.getSignedTemplateList();
    };

    // 
    // ----- ユーザー情報(users) -----
    // 
    // ユーザー情報を取得
    export const fetchGetUserData = async (companyId: string): Promise<Response> => {
        return await api.getUserData(companyId);
    };

    // 
    // ----- 企業情報（company） -----
    // 
    // 企業情報を取得
    export const fetchGetCompanyList = async (companyType: string): Promise<Response> => {
        return await api.getCompanyList(companyType);
    };

    // 
    // ----- 拠点情報（location） -----
    // 
    // 企業の拠点情報一覧を取得
    export const fetchGetLocationList = async (companyId: string): Promise<Response> => {
        return await api.getLocationList(companyId);
    };




    /***
     * 
     * API定義 （ゲストユーザー向け）
     * 
     */
    // 
    // ----- 契約書情報(agreements) -----
    // 
    // 1件の契約書情報を取得
    export const fetchGetAgreementForGuest = async (agreementId: string) => {
        return await api.getAgreementForGuest(agreementId);
    };

    // 契約書ファイルを取得
    export const fetchGetAgreementFileForGuest = async (agreementId: string) => {
        return await api.getAgreementFileForGuest(agreementId)
    };

    // 契約書の承認フロー情報を取得
    export const fetchGetAgreementApprovalsForGuest = async (agreementId: string) => {
        return await api.getAgreementApprovalsForGuest(agreementId);
    };

    // 契約書の差戻し情報を取得
    export const fetchGetRemandRequestForGuest = async (agreementId: string) => {
        return await api.getRemandRequestForGuest(agreementId);
    };

    // 契約書の署名一覧を検証・取得
    export const fetchGetAgreementSignaturesForGuest = async (agreementId: string) => {
        return await api.getAgreementSignaturesForGuest(agreementId);
    };
};

export default generativeAiApiExecutor;