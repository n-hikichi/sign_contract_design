import { signOut } from 'aws-amplify/auth';

/**
 * 概要：ログインユーザー情報を破棄し、ログイン画面へリダイレクトする
 */
export const Logout = () => async () => {
    // 不要な情報を削除する
    localStorage.removeItem('sideMenuIsOpen');
    // localStorage.removeItem('loginInfo');
    // Amplify管理外のユーザー属性情報を削除する
    localStorage.removeItem('CognitoIdentityServiceProvider.locale');
    localStorage.removeItem('CognitoIdentityServiceProvider.authority');

    // Cognitoからログアウトする（グローバルサインアウト）
    await cognitoSignOut();
};

async function cognitoSignOut() {
    try {
        await signOut({ global: true });
    } catch (error) {
        console.log('Sign out error: ', error);
    }
}

export default Logout;