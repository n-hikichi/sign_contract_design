/**
 * ホーム画面に表示するメッセージを定義する
 */
export namespace appMessage {

    /**
     * HTTP レスポンスステータスコード
     */
    export const SUCCESS = 200;
    export const BAD_REQUEST = 400;
    export const UNAUTHORIZED = 401;
    export const FORBIDDEN = 403;
    export const NOT_FOUND = 404;
    export const INTERNAL_SERVER_ERROR = 500;
    export const SERVICE_UNAVAILABLE = 503;
    export const GATEWAY_TIMEOUT = 504;

    export const SUCCESS_ = '200';
    export const BAD_REQUEST_ = '400';
    export const UNAUTHORIZED_ = '401';
    export const FORBIDDEN_ = '403';
    export const NOT_FOUND_ = '404';
    export const INTERNAL_SERVER_ERROR_ = '500';
    export const SERVICE_UNAVAILABLE_ = '503';
    export const GATEWAY_TIMEOUT_ = '504';

    /**
     * 成功メッセージ
     */
    export function registerSuccessMessage(fileName: string) {
        return `${fileName}の登録が成功しました。`;
    }

    export function updateSuccessMessage(fileName: string) {
        return `${fileName}の更新が成功しました。`;
    }

    export function deleteSuccessMessage(filename: string) {
        return `${filename}の削除が成功しました。`;
    }

    export function restoreSuccessMessage(filename: string) {
        return `${filename}の復元が成功しました。`;
    }

    /**
     * 失敗メッセージ
     */
    export const errorMessage = {
        errorMessage: {
        400: '不正な入力内容があります。入力内容を確認の上、再度操作を行ってください。',
        401: 'リクエストした処理を行う権限がありません。操作に必要な権限を持っているか確認の上、再度操作を行ってください',
        403: 'リクエストした処理を行う権限がありません。操作に必要な権限を持っているか確認の上、再度操作を行ってください',
        404: '要求されたページは存在しません。入力内容を確認の上、再度操作を行ってください。',
        500: '予期せぬエラーが発生しました。しばらく待ってから再度操作を行ってください。',
        503: '現在サービスが利用できません。継続して問題が発生する場合はシステム管理者にお問い合わせください。',
        504: 'サーバーからの応答に時間がかかっています。ネットワーク機器の状態を確認してから再度操作を行ってください。',
        }  as Record<number, string>
    };

    // export const errorMessage: { [key: string]: string } = {
    //     BAD_REQUEST: '不正な入力内容があります。入力内容を確認の上、再度操作を行ってください。',
    //     UNAUTHORIZED: 'リクエストした処理を行う権限がありません。操作に必要な権限を持っているか確認の上、再度操作を行ってください',
    //     FORBIDDEN: 'リクエストした処理を行う権限がありません。操作に必要な権限を持っているか確認の上、再度操作を行ってください',
    //     NOT_FOUND: '要求されたページは存在しません。入力内容を確認の上、再度操作を行ってください。',
    //     INTERNAL_SERVER_ERROR: '予期せぬエラーが発生しました。しばらく待ってから再度操作を行ってください。',
    //     SERVICE_UNAVAILABLE: '現在サービスが利用できません。継続して問題が発生する場合はシステム管理者にお問い合わせください。',
    //     GATEWAY_TIMEOUT: 'サーバーからの応答に時間がかかっています。ネットワーク機器の状態を確認してから再度操作を行ってください。',
    // };

    /**
     * エラーウィンドウ名
     */
    export const processList = {
        BAD_REQUEST: '不正な入力内容があります。入力内容を確認の上、再度操作を行ってください。',
        UNAUTHORIZED: 'リクエストした処理を行う権限がありません。操作に必要な権限を持っているか確認の上、再度操作を行ってください',
        FORBIDDEN: 'リクエストした処理を行う権限がありません。操作に必要な権限を持っているか確認の上、再度操作を行ってください',
        NOT_FOUND: '要求されたページは存在しません。入力内容を確認の上、再度操作を行ってください。',
        INTERNAL_SERVER_ERROR: '予期せぬエラーが発生しました。しばらく待ってから再度操作を行ってください。',
        SERVICE_UNAVAILABLE: '現在サービスが利用できません。継続して問題が発生する場合はシステム管理者にお問い合わせください。',
        GATEWAY_TIMEOUT: 'サーバーからの応答に時間がかかっています。ネットワーク機器の状態を確認してから再度操作を行ってください。',
    };
}

export default appMessage;