/**
 * API呼び出しのためのURLを定義
 */
namespace apiURL {
    /**
     * 
     * ブロックチェーン電子契約 API エンドポイント（共通）
     * 
     */
    // 検証環境
    const base_url = `https://cvz9034vze.execute-api.ap-northeast-1.amazonaws.com/dev_v2/`;

    // 本番環境
    // const base_url = `https://ltvi7xv92f.execute-api.ap-northeast-1.amazonaws.com/release/`;
    // 本番環境 - 6月リリース版
    // const base_url = `https://ltvi7xv92f.execute-api.ap-northeast-1.amazonaws.com/release-v2/`;

    /**
     * 
     * 社員アカウント向け定義
     * 
     */
    // 対応API: agreements（契約書）
    export const AGREEMENTS_URL = base_url + 'agreements';
    // 対応API: signature_templates（署名テンプレート）
    export const SIGN_TEMPLATE_URL = base_url + 'signature_templates';
    // 対応API: users（ユーザー情報 - 自社・顧客）
    export const USER_URL = base_url + 'users';
    // 対応API: companies（企業情報 - 自社・顧客）
    export const COMPANY_URL = base_url + 'companies';

    // 対応API: workflows（承認フロー情報 - 自社・顧客）
    export const CONCLUDEDAGREEMENT_URL = base_url + 'concluded_agreements';

    // 検証環境
    const test_base_url = `https://8sjufonhw0.execute-api.ap-northeast-1.amazonaws.com/test/`;
    // 対応API: workflows（承認フロー情報 - 自社・顧客）
    export const APPROVALFLOW_URL = test_base_url + 'approval_flow';
    export const APPROVALFLOWLIST_URL = test_base_url + 'approval_flow_list';
    export const REPRESENTATIVE_SEAL_URL = test_base_url + 'representative_seal';
    export const CONCLUDED_REPRESENTATIVE_SEAL_URL = test_base_url + 'concluded_representative_seal';

    /**
     * 
     * ゲストアカウント向け定義
     * 
     */
    export const AGREEMENTS_URL_GUEST = base_url + 'guest/agreements';

    /**
     * 
     * ブロックチェーン電子契約 生成AI API エンドポイント
     * 
     */
    // 検証環境
    const base_url_for_generativeAi = `https://cvz9034vze.execute-api.ap-northeast-1.amazonaws.com/dev_v2/`;
}

export default apiURL;