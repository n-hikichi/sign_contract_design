/**
 * 入力フォームのバリデーションルールを定義する
 */
namespace validationRules {

    /**
     * 
     * 定数定義
     * 
     */
    // 郵便番号
    export const POSTAL_CODE_LENGTH = 8; // ハイフンを入れて8文字

    // ユーザー情報
    export const USER_FIELD_DEFAULT_LIMIT = 50; // 50文字

    // その他 テキストフィールドの最大値
    export const LOCATION_LIMIT = 20; // 20文字

    // その他 テキストフィールドの最大値
    export const TEXT_FIELD_DEFAULT_LIMIT = 128; // 128文字

    /**
     * 
     * 入力フィールド バリデーションルール
     * 
     */
    export const validationRules = {
        company_name: {
            required: `企業名は必須です。${TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`,
        },
        location_name: {
            required: `拠点名は必須です。${TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`,
        },
        postal_code: {
            required: '郵便番号は必須です。',
            minLength: {
                value: POSTAL_CODE_LENGTH,
                message: `郵便番号は7文字で入力してください`,
            },
        },
        city: {
            required: `市区町村は必須です。${TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`,
        },
        address_line: {
            required: `町名番地は必須です。${TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`,
        },
        building: {
            required: `建物名・部屋番号は必須です。${TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`,
        },
        user_name: {
            required: 'ユーザー名は必須です',
        },
        position: {
            required: '役職は必須です',
        },
        email: {
            required: 'メールアドレスは必須です',
        }
    };
}

export default validationRules;