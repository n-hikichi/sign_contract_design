import api from "../../../utils/apiAccessor";
import queryString from 'query-string';

/**
 * 概要：ゲストユーザーの認証処理を行う
 * 
 * 実行タイミング：
 * ・ログイン時（登録）
 * ・ページリロード時（更新）
 * 
 * @returns 設定結果（true/false）
 */
export async function setLoginUserData() {
    try {
        // アクセスURLから認証トークンを取得する
        const authToken = getAuthTokenFromUrl();

        // 認証トークンを解析する
        // 認証トークンを使ってサーバーに認証リクエストを送信する


        // 適切なユーザーから来たリクエストを処理する
        // アクセストークンを使ってファイルを取得する

        return;
    } catch (e) {
        console.log('login: Unexpected exception occurred.');
        console.log(e);
        return ;
    }
};

function getAuthTokenFromUrl() {
    const url = window.location.href;
    const parsedUrl = queryString.parse(url);
    const authToken = parsedUrl['authToken'];
  
    return authToken;
  }

export default setLoginUserData;