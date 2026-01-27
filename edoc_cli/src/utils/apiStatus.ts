/**
 * 電子契約アプリで管理するステータスを定義する
 */
namespace apiStatus {

    export const agreementStatus = {
        BEFORE_FLOW: 'BEFORE_FLOW', // 社内承認フロー中'
        IN_INTERNAL_FLOW: 'IN_INTERNAL_FLOW', // '社内確認中',
        INTERNAL_REMANDING: 'INTERNAL_REMANDING', // '社内差し戻し中',
        INTERNAL_APPROVED: 'INTERNAL_APPROVED', // '社内承認済み',
        INTERNAL_APPROVING: 'INTERNAL_APPROVING', // '社内承認済み',
        IN_CUSTOMER_FLOW: 'IN_CUSTOMER_FLOW', // '契約先承認フロー中',
        CUSTOMER_REMANDING: 'CUSTOMER_REMANDING', // '契約先差し戻し中',
        CUSTOMER_APPROVING: 'CUSTOMER_APPROVING', // '契約先差し戻し中',
        CONCLUDED: 'CONCLUDED', // '契約締結',
        CONCLUDED_: 'CONCLUDED_', // '破棄',
    };

    // export const agreementStatus = {
    //     BEFORE_FLOW: '社内承認フロー中', // 社内承認フロー中'
    //     IN_INTERNAL_FLOW: '社内確認中', // '社内確認中',
    //     INTERNAL_REMANDING: '社内差し戻し中', // '社内差し戻し中',
    //     INTERNAL_APPROVED: '社内承認済み', // '社内承認済み',
    //     IN_CUSTOMER_FLOW: '契約先承認フロー中', // '契約先承認フロー中',
    //     CUSTOMER_REMANDING: '契約先差し戻し中', // '契約先差し戻し中',
    //     CONCLUDED: '契約締結', // '契約締結',
    //     CONCLUDED_: '破棄', // '破棄',
    // };

    export const agreementType = {
      0: '　',
      1: '基本契約',
      2: '個別契約',
      3: '派遣契約',
      4: '年間契約',
      5: 'その他',
    };

    export const expiredDate: Record<number, string> = {
        0: '　',
        1: '1日',
        2: '2日',
        3: '3日',
        4: '4日',
        5: '5日',
        6: '6日',
        7: '7日',
        8: '8日',
        9: '9日',
        10: '10日',
      };

      export const flowTarget = {
        0: 'INTERNAL',
        1: 'CUSTOMER',
      };

      export const userRole = {
        'internal_pic': '担当者',
        'internal_approver': '承認者',
        'internal_authorizer': '代表者',
        'internal_notifier': '関係者',
        'customer_pic': '担当者',
        'customer_approver': '承認者',
        'customer_authorizer': '代表者',
        'customer_notifier': '関係者',
      };

    //   export const role = {
    //     INTERNAL_PIC: 'internal_pic',
    //     INTERNAL_APPROVER: 'internal_approver',
    //     INTERNAL_AUTHORIZER: 'internal_authorizer',
    //     CUSTOMER_PIC: 'customer_pic',
    //     CUSTOMER_APPROVER: 'customer_approver',
    //     CUSTOMER_AUTHORIZER: 'customer_authorizer',
    //   };

    //   export const role = {
    //     0: 'internal_pic',
    //     1: 'internal_approver',
    //     2: 'internal_authorizer',
    //     3: 'customer_pic',
    //     4: 'customer_approver',
    //     5: 'customer_authorizer',
    //   };

    //   export const role = {
    //     0: 'INTERNAL_PIC',
    //     1: 'INTERNAL_APPROVER',
    //     2: 'INTERNAL_AUTHORIZER',
    //     3: 'CUSTOMER_PIC',
    //     4: 'CUSTOMER_APPROVER',
    //     5: 'CUSTOMER_AUTHORIZER',
    //   };
}

export default apiStatus;