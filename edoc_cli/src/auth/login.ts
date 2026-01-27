import api from "../utils/apiAccessor";
import { fetchUserAttributes } from 'aws-amplify/auth';
import awsconfig from '../aws-exports';

// CognitoのクライアントID
const clientId = awsconfig.Auth.aws_user_pools_web_client_id;

// ログイン処理の結果
export const LOGIN_SUCCESS = "success";
export const COGNITO_ERROR = "cognitoError";
export const ATTRIBUTE_ERROR = "attributeError";
export const UNEXPECTED_ERROR = "unexpectedError";

/**
 * 概要：ログインユーザーの情報を登録する
 * 
 * 実行タイミング：
 * ・ログイン時（登録）
 * ・ページリロード時（更新）
 * 
 * @returns 認証結果（true/false）
 */
async function login(): Promise<string> {
    try {
        // Cognitoに認証情報を問い合わせる

        // ログインが成功した場合は、ユーザー情報を登録する

        return LOGIN_SUCCESS;
    } catch (e) {
        console.log('login: Unexpected exception occurred.');
        console.log(e);
        return UNEXPECTED_ERROR;
    }
};

/**
 * 概要：ログインユーザーの情報を登録する
 * 
 * 実行タイミング：
 * ・ログイン時（登録）
 * ・ページリロード時（更新）
 * 
 * @returns 設定結果（true/false）
 */
export async function setLoginUserData(): Promise<string> {
    try {
        // localStorageに保存されているaccessTokenを取得する
        const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
        const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`);
        if (!token) {
            // accessTokenが取得できなかった場合はエラーとする
            console.log('login: accessToken is not registered.');
            return COGNITO_ERROR;
        }
        api.setAuthorizationToken(token);

        return LOGIN_SUCCESS;
    } catch (e) {
        console.log('login: Unexpected exception occurred.');
        console.log(e);
        return UNEXPECTED_ERROR;
    }
};

/**
 * 概要：localStorageに保存されているidTokenからログインユーザーのメールアドレスを取得する
 * 
 * @returns メールアドレス
 */
export function getUserData(): string {
    try {
        // localStorageに保存されているidTokenを取得する
        const userName = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`) || '';
        const token = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userName}.idToken`);
        if (token === null) {
            return '';
        }

        // idTokenからメールアドレスを取得する
        const payload = token.split('.')[1];
        const jwt = JSON.parse(base64UrlDecode(payload));

        return jwt.email;
    } catch (e) {
        console.log('getUserData: Unexpected exception occurred.');
        console.log(e);
        return '';
    }
};

function base64UrlDecode(input: string) {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }
    return atob(base64);
}

/**
 * 概要：localStorageに保存されているidTokenからログインユーザーのメールアドレスを取得する
 * 
 * @returns メールアドレス
 */
export function getUserDataForDebug(agreementId: string): string {
    try {
        switch (agreementId) {
            // agreement_beforeFlow
            case "acde070d-8c4c-4f0d-9d8a-162843c10333":
                // return 'yamamoto@micros.com';
                return 'd.arai@micros.co.jp';
            // agreement_inInternalFlow INTERNAL_APPROVING（自社担当者）
            case "0f5ca003-1e4e-0fa1-3fd5-a2767c702992":
                // return 'yamamoto@micros.com';
                return 'd.arai@micros.co.jp';
            // agreement_inInternalFlow INTERNAL_APPROVING（自社担当者以外）
            case "bad88342-f757-214e-f0a7-7c759904140e":
                // return 'yoshida@micros.com';
                return 'd.arai@micros.co.jp';
            // agreement_inInternalFlow INTERNAL_REMANDING
            case "d73cab8e-fc49-e8cb-9113-476f357c6885":
                // return 'yamamoto@micros.com';
                return 'd.arai@micros.co.jp';
            // agreement_inInternalFlow INTERNAL_APPROVED
            case "b4486b19-78bd-d5f7-09a8-5e2923519cb0":
                // return 'yamamoto@micros.com';
                return 'd.arai@micros.co.jp';
            default:
        };
        // return 'yamamoto@micros.com';
        return 'd.arai@micros.co.jp';
        // return 'noreply@micros-software.com';
    } catch (e) {
        console.log('getUserData: Unexpected exception occurred.');
        console.log(e);
        return '';
    }
};

export default login;