/***
 * 
 * 開発環境
 * 
 */
const awsconfig = {
    Auth: {
        "aws_project_region": "ap-northeast-1",
        "aws_cognito_region": "ap-northeast-1",
        "aws_user_pools_id": "ap-northeast-1_V771zu8iW",
        "aws_user_pools_web_client_id": "6kk1ih9pi73iqgm65a6r13663n",
        "authenticationFlowType": "USER_SRP_AUTH",
        "mfaConfiguration": "OPTIONAL",
        "mfaTypes": ["EMAIL", "SOFTWARE_TOKEN_MFA"],
    },
    // 長期認証用ユーザープール
    GuestOneTimeAuth: {
        "region": "ap-northeast-1",
        "aws_user_pools_id": "ap-northeast-1_FtauLU84l",
        "aws_user_pools_web_client_id": "7tk9ljvaml1jlah706339kmv8b",
        "secret_key": "L7gW3pX9KdE2RqVZ6CfB8YNmJ4HsQaT5PXbMDkLVoR7cW9z8tJY",
    },
    // パスワードレス認証用ユーザープール
    GuestPassWordLessAuth: {
        "region": "ap-northeast-1",
        "aws_user_pools_id": "ap-northeast-1_DpwekVOhZ",
        "aws_user_pools_web_client_id": "475llji7f3idc4vqnqi5veun5c",
        "secret_key": "X3Jf9TgY2RpLVoW7kMdE8NbQa6C4HzPXcBK5WmY9J7VZR8Q3TbL",
    }
};

// export const awsconfig_generativeai = {
//     Auth: {
//         "aws_project_region": "ap-northeast-1",
//         "aws_cognito_region": "ap-northeast-1",
//         "aws_user_pools_id": "ap-northeast-1_PAxAiIMrB",
//         "aws_user_pools_web_client_id": "6g9ai81f2vrj1u2dajsobn7jen",
//     },
//     // 長期認証用ユーザープール
//     GuestOneTimeAuth: {
//         "region": "ap-northeast-1",
//         "aws_user_pools_id": "ap-northeast-1_FtauLU84l",
//         "aws_user_pools_web_client_id": "7tk9ljvaml1jlah706339kmv8b",
//         "secret_key": "L7gW3pX9KdE2RqVZ6CfB8YNmJ4HsQaT5PXbMDkLVoR7cW9z8tJY",
//     },
//     // パスワードレス認証用ユーザープール
//     GuestPassWordLessAuth: {
//         "region": "ap-northeast-1",
//         "aws_user_pools_id": "ap-northeast-1_DpwekVOhZ",
//         "aws_user_pools_web_client_id": "475llji7f3idc4vqnqi5veun5c",
//         "secret_key": "X3Jf9TgY2RpLVoW7kMdE8NbQa6C4HzPXcBK5WmY9J7VZR8Q3TbL",
//     }
// };

/***
 * 
 * 本番環境
 * 
 */
// const awsconfig = {
//     Auth: {
//         "aws_project_region": "ap-northeast-1",
//         "aws_cognito_region": "ap-northeast-1",
//         "aws_user_pools_id": "ap-northeast-1_RCVIQEi26",
//         "aws_user_pools_web_client_id": "23knugoulvplbaegkdlgjh2n5t",
//     },
//     // 長期認証用ユーザープール
//     GuestOneTimeAuth: {
//         "region": "ap-northeast-1",
//         "aws_user_pools_id": "ap-northeast-1_eMsusPVOM",
//         "aws_user_pools_web_client_id": "58mpgll45b0h6batqkh9pmilbj",
//         "secret_key": "L7gW3pX9KdE2RqVZ6CfB8YNmJ4HsQaT5PXbMDkLVoR7cW9z8tJY",
//     },
//     // パスワードレス認証用ユーザープール
//     GuestPassWordLessAuth: {
//         "region": "ap-northeast-1",
//         "aws_user_pools_id": "ap-northeast-1_ZKWXRUVef",
//         "aws_user_pools_web_client_id": "5id37ocu72mb47hs75l8namcal",
//         "secret_key": "X3Jf9TgY2RpLVoW7kMdE8NbQa6C4HzPXcBK5WmY9J7VZR8Q3TbL",
//     }
// };

export default awsconfig;
