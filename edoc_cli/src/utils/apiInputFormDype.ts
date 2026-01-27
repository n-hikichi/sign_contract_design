import { Dayjs } from 'dayjs';

namespace apiInputFormDype {
    export type User = {
        user_id: string,
        post: string,
        user_name: string,
        company_name: string,
        email: string,
        user_attribute: 'INTERNAL' | 'CUSTOMER',
    }
    
    // 承認者の情報
    export type Approver = {
        // 会社名
        company_name: string,
        // 役職
        post: string,
        // 氏名
        user_name: string,
        // メールアドレス
        email: string,
    };
    
    // 承認者の初期値
    export const initialApprover: Approver = {
        company_name: '',
        post: '',
        user_name: '',
        email: '',
    };
    
    // フォームの入力値
    export interface FormInput {
        title: string,
        company_name: string,
        type: string,
        deal_amount: number | null,
        conclusion_date: Dayjs | null,
        expiration_date: Dayjs | null,
        internal_select: string,
        internal_companyInfo: {
            company_name: string,
            postal_code: string,
            state: string,
            city: string,
            address_line: string,
            building: string,
        },
        customer_companyInfo: {
            company_name: string,
            postal_code: string,
            state: string,
            city: string,
            address_line: string,
            building: string,
        },
        approval_flow: {
            internal_pic: User,
            internal_approver: User,
            internal_authorizer: User,
            customer_pic: User,
            customer_approver: User,
            customer_authorizer: User,
            submission_period: number,
        }
    };
};

export default apiInputFormDype;
