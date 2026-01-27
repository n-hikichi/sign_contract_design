namespace apiDataType {
    // 承認者情報
    export type Approver = {
        approver_id: string;
        user_name: string;
        company_name: string;
        position: string;
        email: string;
        approved: boolean;
        approved_time?: string;
    };

    export function createInitialApprover(): Approver {
        return {
            approver_id: '',
            user_name: '',
            company_name: '',
            position: '',
            email: '',
            approved: false,
            approved_time: '',
        };
    };

    // 承認フロー情報
    export type AgreementFlow = {
        internal_pic: Approver;
        internal_approver: Approver;
        internal_authorizer: Approver;
        customer_pic: Approver;
        customer_approver: Approver;
        customer_authorizer: Approver;
        present_approver: string;
        submission_period: number;
    };

    export function createInitialAgreementFlow(): AgreementFlow {
        return {
            internal_pic: createInitialApprover(),
            internal_approver: createInitialApprover(),
            internal_authorizer: createInitialApprover(),
            customer_pic: createInitialApprover(),
            customer_approver: createInitialApprover(),
            customer_authorizer: createInitialApprover(),
            present_approver: "",
            submission_period: 1,
        };
    };

    // 契約書情報
    export type AgreementData = {
        agreement_id: string,
        title: string,
        company_name: string,
        deal_amount: number,
        conclusion_date: string,
        expiration_date: string,
        internal_pic: {
            user_name: string,
            company_name: string,
            email: string
        },
        customer_pic: {
            user_name: string,
            company_name: string,
            email: string
        },
        status: string
    };

    export function createInitialAgreementData(): AgreementData {
        return {
            agreement_id: "",
            title: "",
            company_name: "",
            deal_amount: 0,
            conclusion_date: "",
            expiration_date: "",
            internal_pic: {
                user_name: "",
                company_name: "",
                email: ""
            },
            customer_pic: {
                user_name: "",
                company_name: "",
                email: ""
            },
            status: ""
        };
    };

    // 承認完了時のユーザー情報
    export type ApproveInfo = {
        agreement_id: string;
        title: string;
        user_name: string;
        company_name: string;
        email: string;
        approved_time: string;
    };

    export function createInitialApproverInfo(): ApproveInfo {
        return {
            agreement_id: '',
            title: '',
            user_name: '',
            company_name: '',
            email: '',
            approved_time: '',
        };
    };

    // 書類情報一覧の表の列名を示すインタフェース
    export interface DocumentListColumns {
        // 件名
        title: string,
        // 契約会社名
        customer_company_name: string,
        // 取引担当者名
        customer_user_name: string,
        // 取引金額
        deal_amount: number,
        // 契約締結日
        conclusion_date: string,
        // 契約期限
        expiration_date: string,
        // ステータス
        status: string,
    };

    // 差戻し要求情報
    export type RemandInfo = {
        remand_id: string;
        types: string[];
        requester_id: string;
        responder_id: string;
        comment: string[];
    };

    export function createInitialRemandRequest(): RemandInfo {
        return {
            remand_id: '',
            types: [],
            requester_id: '',
            responder_id: '',
            comment: [],
        };
    };


    /**
     * 
     * 企業情報（company）
     * 
     */
    // 企業情報を示すインタフェース
    export interface CompanyInfo {
        // 企業ID
        company_id: string,
        // 企業種別（INTERNAL／CUSTOMER）
        company_type: string,
        // 企業名
        company_name: string,
        // 郵便番号
        postal_code: number,
        // 都道府県
        state: string,
        // 都市
        city: string,
        // 地名
        address_line: string,
        // 建物名
        building: string,
    };

    // 企業情報を示すインタフェース
    export interface PutCompanyData {
        // 企業名
        company_name: string,
        // 郵便番号
        postal_code: number,
        // 都道府県
        state: string,
        // 都市
        city: string,
        // 地名
        address_line: string,
        // 建物名
        building: string,
    };

    // 拠点情報を示すインタフェース
    export interface LocationInfo {
        // 拠点ID
        location_id: string,
        // 企業ID
        company_id: string,
        // 拠点名
        location_name: string,
        // 企業名
        company_name: string,
        // 郵便番号
        postal_code: number,
        // 都道府県
        state: string,
        // 都市
        city: string,
        // 地名
        address_line: string,
        // 建物名
        building: string,
    };
};

export default apiDataType;
