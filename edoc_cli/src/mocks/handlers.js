// src/mocks/handlers.js
import { rest } from 'msw'
import apiURL from '../utils/apiUrls'
import { signatureTemplateList } from './files/signatureTemplates/templateList';
import { basicAgreement } from './files/signatureTemplates/basicAgreement';
import { postAgreement, getAgreement, putAgreement, getAgreementFile, getAgreementFileConclude } from './files/agreements/agreement';
// 承認履歴
import { getApproval } from './files/agreements/approval';
import { getSignature } from './files/agreements/signature';
// 契約書一覧
import { agreement_beforeFlow } from './files/agreements/agreement_beforeFlow';
import { agreement_inInternalFlow } from './files/agreements/agreement_inInternalFlow';
import { agreement_inCustomerFlow } from './files/agreements/agreement_inCustomerFlow';
import { agreement_concluded } from './files/agreements/agreement_concluded';
import { agreement_discarded } from './files/agreements/agreement_discarded';
// ユーザー情報（自社）
import { internalUserList } from './files/internalUserInfo/internalUserList';
// ユーザー情報（相手方）
import { customerUserList } from './files/customerUserInfo/customerUserList';
// ゲストAPI
import { getGuestAgreement } from './guest/agreement';
// 承認フローAPI（自社）
// import { internal_workflow } from './files/workflows/internal_workflow';
// 承認フローAPI（相手方）
// import { agreement_workflow_customer, agreement_workflow_customer_with_internalFlow } from './files/workflows/customer_workflow';
// 承認フローAPI（自社）
// import { concluded_agreement } from './files/agreements/concluded_agreement';
import { internalSealImage } from './files/internalUserInfo/internalSealImage';
import { customerSealImage } from './files/customerUserInfo/customerSealImage';
import { representativeSealImage } from './development/representativeSealImage';

export const handlers = [
    /***
     * 
     * 契約書の件数を取得する
     * 
     */
    rest.get('https://kdzb1zcq73.execute-api.ap-northeast-1.amazonaws.com/api/chats/cf7e4da0-9417-40a2-bbd9-5b3ce55fdce2/messages', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                messages: [
                    {
                        "content": "例えば現場での口頭説明や写真撮影による漏洩リスクがあるため、現場内での情報管理ルールやSNS投稿の禁止などを契約に盛り込むことが有効です。",
                    }],
            })
        );
    }),
    /***
     * 
     * 契約書の件数を取得する
     * 
     */
    rest.get(apiURL.AGREEMENTS_URL + '/count', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ "before_flow": 1, "in_internal_flow": 4, "in_customer_flow": 2 })
        );
    }),
    /***
     * 
     * 契約書を登録する
     * 
     */
    rest.post(apiURL.AGREEMENTS_URL, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(postAgreement));
    }),
    /***
     * 
     * 1件の契約書情報を取得する
     * 
     */
    rest.get(apiURL.AGREEMENTS_URL + '/:agreement_id', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(getAgreement));
    }),
    /***
     * 
     * 契約書情報を更新する
     * 
     */
    rest.put(apiURL.AGREEMENTS_URL + '/:agreement_id', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(putAgreement));
    }),
    /***
     * 
     * 契約書を破棄する
     * 
     */
    rest.delete(apiURL.AGREEMENTS_URL + '*', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "agreement_id": "acde070d-8c4c-4f0d-9d8a-162843c10333",
                "deleted_time": "2025-04-01T12:34:56.789Z"
            }),
        )
    }),
    /***
     * 
     * 契約書ファイルを取得する
     * 
     */
    rest.get(apiURL.AGREEMENTS_URL + '/:agreement_id/file', (req, res, ctx) => {
        const { agreement_id } = req.params;

        if (agreement_id === 'd5568801-dd56-3317-31e6-f389c02d2412') {
            return res(ctx.status(200), ctx.json(getAgreementFileConclude));
        };
        return res(ctx.status(200), ctx.json(getAgreementFile));
    }),
    // 承認履歴
    // 契約の承認情報を取得するAPI
    rest.get(apiURL.AGREEMENTS_URL + '/:agreement_id/approvals', (req, res, ctx) => {
        const { agreement_id } = req.params;
        return res(ctx.status(200), ctx.json(getApproval(agreement_id)));
    }),
    /***
     * 
     * 契約書を承認する
     * 
     */
    rest.post(apiURL.AGREEMENTS_URL + '/:agreement_id/approvals', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ "approved_time": "2025-04-01T12:34:56.789Z" }),
        );
    }),
    /***
     * 
     * 承認フローを開始・再開する
     * 
     */
    rest.post(apiURL.AGREEMENTS_URL + '/:agreement_id/start_flow', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "started_time": "2025-04-01T12:34:56.789Z"
            })
        );
    }),
    // 検証結果
    // 契約の承認情報を取得するAPI
    rest.get(apiURL.AGREEMENTS_URL + '/:agreement_id/signatures', (req, res, ctx) => {
        const { agreement_id } = req.params;
        return res(ctx.status(200), ctx.json(getSignature(agreement_id)));
    }),
    // 書類を取得するAPI
    rest.get(apiURL.AGREEMENTS_URL + '?status=', (req, res, ctx) => {
        const agreementStatus = req.url.searchParams.get('status');

        if (agreementStatus === 'BEFORE_FLOW') {
            return res(ctx.status(200), ctx.json(agreement_beforeFlow.agreements));
        };

        if (agreementStatus === 'IN_INTERNAL_FLOW') {
            return res(ctx.status(200), ctx.json(agreement_inInternalFlow.agreements));
        };

        if (agreementStatus === 'IN_CUSTOMER_FLOW') {
            return res(ctx.status(200), ctx.json(agreement_inCustomerFlow.agreements));
        };

        if (agreementStatus === 'CONCLUDED') {
            return res(ctx.status(200), ctx.json(agreement_concluded.agreements));
        };

        if (agreementStatus === 'DISCARDED') {
            return res(ctx.status(200), ctx.json(agreement_discarded.agreements));
        };
    }),

    // 契約差戻し
    rest.post(apiURL.AGREEMENTS_URL + '/:agreementId/remands', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "remanded_time": "2025-04-01T12:41:12.789Z"
            })
        );
    }),
    // 取引先企業一覧取得
    // 契約の承認情報を取得するAPI
    // 選択できるType：approve_url、approve_flow、delete_document
    rest.get(apiURL.AGREEMENTS_URL + '/:agreement_id/remands', (req, res, ctx) => {

        const { agreement_id } = req.params;
        return res(
            ctx.status(200),
            ctx.json(
                {
                    "remand_id": "5f4e070d-8c4c-4f0d-9d8a-162843c10333",
                    "types": [
                        "ファイル修正"
                    ],
                    "requester_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333", // 差戻し依頼送信者
                    "responder_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333", // 差戻し依頼送信先
                    "comment": "コメント"
                }
                // "agreement_id": "acde070d-8c4c-4f0d-9d8a-162843c10333",
                // "remand_type": "approve_url",
                // "remand_reason": "電話でお伝えした通り契約書の文言を修正したいです。契約書の差戻しをお願いします。",
            )
        );
    }),

    /***
     * 
     * 承認用URLを発行する
     * 
     */
    rest.post(apiURL.AGREEMENTS_URL + '/:agreement_id/approval_url', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "issued_time": "2025-04-01T12:34:56.789Z"
            })
        );
    }),

    // ----- 署名情報（signature_templates） -----
    /***
     * 
     * 署名テンプレート一覧を取得する
     * 
     */
    rest.get(apiURL.SIGN_TEMPLATE_URL, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(signatureTemplateList));
    }),
    /***
     * 
     * 署名テンプレート一覧を取得する
     * 
     */
    // rest.get(apiURL.SIGN_TEMPLATE_URL + '*', (req, res, ctx) => {
    //     return res(
    //         ctx.status(200),
    //         ctx.json([
    //             {
    //                 "template_id": "34007f3c-507d-4f03-ba35-746672f3b69d",
    //                 "template_name": "テンプレート1",
    //                 "type": "基本契約"
    //             },
    //         ])
    //     );
    // }),
    /***
     * 
     * 署名テンプレートを取得する
     * 
     */
    rest.get(apiURL.SIGN_TEMPLATE_URL + '/:template_id', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(basicAgreement));
    }),


    // ----- ユーザー情報（users） -----
    /***
     * 
     * ユーザー情報を取得する
     * 
     */
    rest.get(apiURL.USER_URL, (req, res, ctx) => {
        const company_id = req.url.searchParams.get('company_id');
        if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
            return res(ctx.status(200), ctx.json(internalUserList.company_1));
        }

        return res(ctx.status(200), ctx.json(customerUserList.company_1));
    }),

    /***
     * 
     * ユーザーを登録する
     * 
     */
    rest.post(apiURL.USER_URL + '*', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "user_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "user_name": "ユーザー1",
                "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "location_id": "ba50743d-6fe3-4fb9-b2ff-dfd7f10f4230",
                "position": "代表取締役社長",
                "email": "xxx@xxx.co.jp",
                "user_attribute": "INTERNAL"
            })
        );
    }),
    /***
     * 
     * ユーザー情報を更新する
     * 
     */
    rest.put(apiURL.USER_URL + '*', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "user_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "user_name": "ユーザー1",
                "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "location_id": "ba50743d-6fe3-4fb9-b2ff-dfd7f10f4230",
                "position": "代表取締役社長",
                "email": "xxx@xxx.co.jp",
                "user_attribute": "INTERNAL"
            })
        );
    }),
    /***
     * 
     * ユーザーを削除する
     * 
     */
    rest.delete(apiURL.USER_URL + '*', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "user_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "deleted_time": "2025-04-01T12:34:56.789Z"
            }),
        )
    }),


    // ----- 企業情報（companies） -----
    /***
     * 
     * 企業情報一覧を取得する
     * 
     */
    rest.get(apiURL.COMPANY_URL, (req, res, ctx) => {
        const company_type = req.url.searchParams.get('company_type');
        if (company_type === 'INTERNAL') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": '805264ba-91f0-c1a8-1c26-88b237b2e7aa',
                        "company_type": "INTERNAL",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "postal_code": "123-1234",
                        "state": "神奈川県",
                        "city": "川崎市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                ])
            );
        }

        if (company_type === 'CUSTOMER') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": '4c57d40a-73f9-d465-11c4-d3bb37fd08a7',
                        "company_type": "CUSTOMER",
                        "company_name": "株式会社イースコントラクト",
                        "postal_code": "123-1234",
                        "state": "神奈川県",
                        "city": "川崎市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                    {
                        "company_id": '32eaf66f-048e-dabc-c1d8-f3b9d4c64a1a',
                        "company_type": "CUSTOMER",
                        "company_name": "株式会社イースコントラクト",
                        "postal_code": "123-1234",
                        "state": "神奈川県",
                        "city": "川崎市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                    // {
                    //     "company_id": '1b3f9de0-3139-e7be-84d2-7e264b9f2f49',
                    //     "company_type": "CUSTOMER",
                    //     "company_name": "株式会社MIC SIGN",
                    //     "postal_code": "123-1234",
                    //     "state": "神奈川県",
                    //     "city": "川崎市",
                    //     "address_line": "高津区坂戸",
                    //     "building": "KSPビル",
                    // },
                    // {
                    //     "company_id": '4343aeec-0c12-565a-2ab8-762c86354f85',
                    //     "company_type": "CUSTOMER",
                    //     "company_name": "株式会社MIC BOX",
                    //     "postal_code": "123-1234",
                    //     "state": "神奈川県",
                    //     "city": "川崎市",
                    //     "address_line": "高津区坂戸",
                    //     "building": "KSPビル",
                    // },
                    // {
                    //     "company_id": 'ec922e74-aca2-e2cb-96ba-4044e3cc2b83',
                    //     "company_type": "CUSTOMER",
                    //     "company_name": "株式会社イースコントラクト_支社",
                    //     "postal_code": "123-1234",
                    //     "state": "神奈川県",
                    //     "city": "川崎市",
                    //     "address_line": "高津区坂戸",
                    //     "building": "KSPビル",
                    // },
                    // {
                    //     "company_id": 'fd2ae24d-1949-b28b-415d-07d0261f4c81',
                    //     "company_type": "CUSTOMER",
                    //     "company_name": "株式会社MIC SIGN_支社",
                    //     "postal_code": "123-1234",
                    //     "state": "神奈川県",
                    //     "city": "川崎市",
                    //     "address_line": "高津区坂戸",
                    //     "building": "KSPビル",
                    // },
                    // {
                    //     "company_id": 'f5d59849-8be0-a66c-38c9-494118125b72',
                    //     "company_type": "CUSTOMER",
                    //     "company_name": "株式会社MIC BOX_支社",
                    //     "postal_code": "123-1234",
                    //     "state": "神奈川県",
                    //     "city": "川崎市",
                    //     "address_line": "高津区坂戸",
                    //     "building": "KSPビル",
                    // },
                ])
            )
        }
    }),
    /***
     * 
     * 企業を登録する
     * 
     */
    rest.post(apiURL.COMPANY_URL, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "company_type": "INTERNAL",
                "company_name": "会社1",
                "postal_code": "123-4567",
                "state": "東京都",
                "city": "渋谷区",
                "address_line": "1-1-1",
                "building": "○○ビル3階"
            })
        );
    }),
    /***
     * 
     * 企業情報を更新する
     * 
     */
    rest.put(apiURL.COMPANY_URL + '*', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "company_name": "会社1",
                "postal_code": "123-4567",
                "state": "東京都",
                "city": "渋谷区",
                "address_line": "1-1-1",
                "building": "○○ビル3階"
            })
        );
    }),
    /***
     * 
     * 企業を削除する
     * 
     */
    rest.delete(apiURL.COMPANY_URL + '*', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "deleted_time": "2025-04-01T12:34:56.789Z"
            }),
        )
    }),


    /***
     * 
     * 企業の拠点情報一覧を取得する
     * 
     */
    rest.get(apiURL.COMPANY_URL + '/:company_id' + '/locations', (req, res, ctx) => {
        const { company_id } = req.params
        if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "location_name": "川崎本社",
                        "postal_code": "123-1234",
                        "state": "神奈川県",
                        "city": "川崎市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                    {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "location_id": "8760c340-9d29-c832-81d7-f89918e58ebd",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "location_name": "大阪支社",
                        "postal_code": "123-1234",
                        "state": "大阪府",
                        "city": "川崎市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                    {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "location_id": "eab280dc-47f0-5027-1608-97101d404024",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "location_name": "北海道支社",
                        "postal_code": "123-1234",
                        "state": "北海道",
                        "city": "川崎市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                    {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "location_id": "b4814453-5b6d-b0fc-eb08-db6d8c303690",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "location_name": "北見事業所",
                        "postal_code": "123-1234",
                        "state": "北海道",
                        "city": "北見市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                    {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "location_id": "8d0e84a1-2ca4-cd0d-46c8-09982ddd69d8",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "location_name": "予備",
                        "postal_code": "123-1234",
                        "state": "神奈川県",
                        "city": "川崎市",
                        "address_line": "高津区坂戸",
                        "building": "KSPビル",
                    },
                ])
            );
        }
        return res(
            ctx.status(200),
            ctx.json([
                {
                    "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                    "location_id": "ca45be98-383a-6b6e-ba88-12410e2fe160",
                    "company_name": "株式会社イースコントラクト",
                    "location_name": "本社",
                    "postal_code": "123-4567",
                    "state": "東京都",
                    "city": "渋谷区あ",
                    "address_line": "1-1-1",
                    "building": "○○ビル3階"
                },
                {
                    "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                    "location_id": "c54cd400-5076-991c-969f-502d5360280e",
                    "company_name": "株式会社イースコントラクト",
                    "location_name": "支社１",
                    "postal_code": "123-4567",
                    "state": "東京都",
                    "city": "渋谷区い",
                    "address_line": "1-1-1",
                    "building": "○○ビル3階"
                },
                {
                    "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                    "location_id": "e5303879-5113-6cad-7593-3d0c46da9930",
                    "company_name": "株式会社イースコントラクト",
                    "location_name": "支社２",
                    "postal_code": "123-4567",
                    "state": "東京都",
                    "city": "渋谷区う",
                    "address_line": "1-1-1",
                    "building": "○○ビル3階"
                },
                {
                    "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                    "location_id": "1827c360-a4b8-b23e-8c6c-35d0026dc5c7",
                    "company_name": "株式会社イースコントラクト",
                    "location_name": "支社３",
                    "postal_code": "123-4567",
                    "state": "東京都",
                    "city": "渋谷区え",
                    "address_line": "1-1-1",
                    "building": "○○ビル3階"
                },
                {
                    "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                    "location_id": "19513514-b0e0-e001-d9d9-b857546f2f60",
                    "company_name": "株式会社イースコントラクト",
                    "location_name": "支社４",
                    "postal_code": "123-4567",
                    "state": "東京都",
                    "city": "渋谷区お",
                    "address_line": "1-1-1",
                    "building": "○○ビル3階"
                },
            ])
        )
    }),
    /***
     * 
     * 企業の拠点を登録する
     * 
     */
    rest.post(apiURL.COMPANY_URL + '/:company_id' + '/locations', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "location_id": "ba50743d-6fe3-4fb9-b2ff-dfd7f10f4230",
                "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "location_name": "本社",
                "company_name": "会社1",
                "postal_code": "123-4567",
                "state": "東京都",
                "city": "渋谷区",
                "address_line": "1-1-1",
                "building": "○○ビル3階"
            })
        );
    }),


    /***
     * 
     * 拠点情報を更新する
     * 
     */
    rest.put(apiURL.COMPANY_URL + '/:company_id' + '/locations' + '/:location_id', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "company_name": "会社1",
                "postal_code": "123-4567",
                "state": "東京都",
                "city": "渋谷区",
                "address_line": "1-1-1",
                "building": "○○ビル3階"
            })
        );
    }),

    /***
     * 
     * 拠点を削除する
     * 
     */
    rest.delete(apiURL.COMPANY_URL + '/' + '/:company_id' + '/locations' + '/:location_id', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                "location_id": "ba50743d-6fe3-4fb9-b2ff-dfd7f10f4230",
                "deleted_time": "2025-04-01T12:34:56.789Z"
            }),
        )
    }),


    // ----- 承認フロー情報（workflows） -----
    /***
     *
     * 承認フロー一覧を取得する（approval_flow_list）
     *
     */
    rest.get(apiURL.APPROVALFLOWLIST_URL, (req, res, ctx) => {
        const company_id = req.url.searchParams.get('company_id');
        return res(
            ctx.status(200),
            ctx.json([
                {
                    "company_id": company_id || "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                    "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                    "workflow_name": "自社メイン承認フロー",
                    "workflow_type": "internal",
                },
                {
                    "company_id": company_id || "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                    "workflow_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
                    "workflow_name": "相手方承認フロー",
                    "workflow_type": "customer",
                },
            ])
        );
    }),
    /***
     *
     * 承認フロー情報（workflows）を取得する
     *
     */
    rest.get(apiURL.APPROVALFLOW_URL + '?company_id=', (req, res, ctx) => {
        // const { company_id } = req.params
        // const { company_id } = req.url.searchParams.get('company_id');
        const company_id = req.url.searchParams.get('company_id');
        if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "company_name": "ミクロスソフトウエア",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "自社メイン承認フロー_internal1",
                        "workflow_type": "internal",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "ミクロスソフトウエア",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "自社メイン承認フロー_internal2",
                        "workflow_type": "internal",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "2"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                ])
            );
        }
        //　相手方承認フロー（イースコントラクト）
        if (company_id === '4c57d40a-73f9-d465-11c4-d3bb37fd08a7') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_customer1",
                        "workflow_type": "customer",
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "3"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_both1",
                        "workflow_type": "both",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "4"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "5"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "6"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                ])
            )
        }
        // 相手方承認フロー（イースコントラクト）
        if (company_id === '32eaf66f-048e-dabc-c1d8-f3b9d4c64a1a') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": "32eaf66f-048e-dabc-c1d8-f3b9d4c64a1a",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_customer1",
                        "workflow_type": "customer",
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "3"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_both1",
                        "workflow_type": "both",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "4"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "5"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "6"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_customer2",
                        "workflow_type": "customer",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "4"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "5"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "6"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                ])
            )
        }

        // const company_id = req.url.searchParams.get('company_id');
        // if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
        //     return res(ctx.status(200), ctx.json(getInternalWorkFlow));
        // }

        // return res(ctx.status(200), ctx.json(internal_workflow));
    }),

    /***
         * 
         * 承認フロー情報（workflows）を取得する
         * 
         */
    rest.get(apiURL.APPROVALFLOW_URL + '?company_id=', (req, res, ctx) => {
        // const { company_id } = req.params
        // const { company_id } = req.url.searchParams.get('company_id');
        const company_id = req.url.searchParams.get('company_id');
        if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "company_name": "ミクロスソフトウエア",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "自社メイン承認フロー_internal1",
                        "workflow_type": "internal",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "ミクロスソフトウエア",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "自社メイン承認フロー_internal2",
                        "workflow_type": "internal",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "2"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                ])
            );
        }
        //　相手方承認フロー（イースコントラクト）
        if (company_id === '4c57d40a-73f9-d465-11c4-d3bb37fd08a7') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_customer1",
                        "workflow_type": "customer",
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "3"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_both1",
                        "workflow_type": "both",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "4"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "5"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "6"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                ])
            )
        }
        // 相手方承認フロー（イースコントラクト）
        if (company_id === '32eaf66f-048e-dabc-c1d8-f3b9d4c64a1a') {
            return res(
                ctx.status(200),
                ctx.json([
                    {
                        "company_id": "32eaf66f-048e-dabc-c1d8-f3b9d4c64a1a",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_customer1",
                        "workflow_type": "customer",
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "3"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_both1",
                        "workflow_type": "both",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "4"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "5"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "6"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                    {
                        "company_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "company_name": "株式会社イースコントラクト",
                        "workflow_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "workflow_name": "相手方メイン承認フロー_customer2",
                        "workflow_type": "customer",
                        "internal_pic": {
                            "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                            "user_name": "山本和彦",
                            "email": "yamamoto@micros.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "internal_approver": [
                            {
                                "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                                "user_name": "吉田由美子",
                                "email": "yoshida@micros.com",
                                "position": "社員",
                                // "approval_order": "1"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "吉岡由美",
                                "email": "yoshioka@micros.com",
                                "position": "社員",
                                // "approval_order": "2"
                            },
                        ],
                        "internal_authorizer": {
                            "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                            "user_name": "松本真由美",
                            "email": "matsumoto@micros.com",
                            "position": "代表取締役社長",
                            "file": internalSealImage.yoshida,
                            // "approval_order": "3"
                        },
                        "internal_notifier": [
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "小川和也",
                                "email": "ogawa@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                                "user_name": "斎藤大和",
                                "email": "saito@micros.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                        "customer_pic": {
                            "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                            "user_name": "鈴木浩",
                            "email": "suzuki@micsign.com",
                            "position": "社員",
                            // "approval_order": "0"
                        },
                        "customer_approver": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山崎大輔",
                                "email": "yamazaki@micsign.com",
                                "position": "社員",
                                // "approval_order": "4"
                            },
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "山本大輔",
                                "email": "yamamoto@micsign.com",
                                "position": "社員",
                                // "approval_order": "5"
                            },
                        ],
                        "customer_authorizer": {
                            "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                            "user_name": "渡辺浩一",
                            "email": "watanabe@micsign.com",
                            "position": "代表取締役社長",
                            "file": customerSealImage.yamazaki,
                            // "approval_order": "6"
                        },
                        "customer_notifier": [
                            {
                                "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                                "user_name": "金子大雅",
                                "email": "kaneko@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                            {
                                "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                                "user_name": "青木友美",
                                "email": "aoki@micsign.com",
                                "position": "社員",
                                // "approval_order": "0"
                            },
                        ],
                    },
                ])
            )
        }

        // const company_id = req.url.searchParams.get('company_id');
        // if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
        //     return res(ctx.status(200), ctx.json(getInternalWorkFlow));
        // }

        // return res(ctx.status(200), ctx.json(internal_workflow));
    }),

    // rest.get(apiURL.WORKFLOW_URL, (req, res, ctx) => {
    //     const company_id = req.url.searchParams.get('company_id');
    //     if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
    //         return res(ctx.status(200), ctx.json(internalUserList.company_1));
    //     }

    //     return res(ctx.status(200), ctx.json(customerUserList.company_1));
    // }),


    // ----- ★検証中機能★：契約締結後の契約情報管理（concludedAgreement） -----
    /***
     * 
     * 契約締結後の契約情報管理（concludedAgreement）を取得する
     * 
     */
    rest.get(apiURL.CONCLUDEDAGREEMENT_URL + '/INTERNAL', (req, res, ctx) => {
        // const company_id = req.url.searchParams.get('company_id');
        // if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
        //     return res(ctx.status(200), ctx.json(getInternalWorkFlow));
        // }

        return res(ctx.status(200), ctx.json(internalSealImage));
    }),
    rest.get(apiURL.CONCLUDEDAGREEMENT_URL + '/CUSTOMER', (req, res, ctx) => {
        // const company_id = req.url.searchParams.get('company_id');
        // if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
        //     return res(ctx.status(200), ctx.json(getInternalWorkFlow));
        // }

        return res(ctx.status(200), ctx.json(customerSealImage));
    }),
    rest.get(apiURL.CONCLUDEDAGREEMENT_URL + '/representativeSealImage', (req, res, ctx) => {
        // const company_id = req.url.searchParams.get('company_id');
        // if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
        //     return res(ctx.status(200), ctx.json(getInternalWorkFlow));
        // }

        return res(ctx.status(200), ctx.json(representativeSealImage));
    }),




    // PDF取得（暫定） - 契約書（初版）
    rest.get(apiURL.AGREEMENTS_URL_GUEST + '/:agreementId/file', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(getGuestAgreement));
    }),

    // 承認履歴
    // 契約の承認情報を取得するAPI
    // IN_CUSTOMER_FLOW CONCLUDED
    rest.get(apiURL.AGREEMENTS_URL_GUEST + '/:agreementId', (req, res, ctx) => {

        const { agreementId } = req.params;
        if (agreementId === '0fb235c5-0ca2-47dc-a51c-6f1b1beaba74') {
            return res(
                ctx.status(200),
                ctx.json({
                    "agreement_id": "acde070d-8c4c-4f0d-9d8a-162843c10333",
                    "title": "ブロックチェーン電子契約 秘密保持契約書",
                    "own_company": {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "postal_code": "123-1234",
                        "state": "神奈川県",
                        "city": "川崎市",
                        "address_line": "高津区坂戸1-1-1",
                        "building": "KSPビル"
                    },
                    "customer_company": {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "company_name": "株式会社イースコントラクト",
                        "postal_code": "004-0051",
                        "state": "北海道",
                        "city": "札幌市",
                        "address_line": "厚別区厚別中央1条6丁目2-1",
                        "building": "D-スクエア新さっぽろ6F"
                    },
                    "type": "契約種別",
                    "deal_amount": 1000000,
                    "conclusion_date": "2021-01-01",
                    "expiration_date": "2021-01-01",
                    "internal_pic": {
                        "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
                        "user_name": "山本和彦",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                    },
                    "customer_pic": {
                        "approver_id": "025f93b5-6a76-b248-ff14-164a70d15b05",
                        "user_name": "鈴木浩",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "suzuki@micsign.com",
                    },
                    "status": "IN_CUSTOMER_FLOW"
                })
            );
        };

        if (agreementId === '2bc3b33f-b95e-336e-8215-46bf6965f7f1') {
            return res(
                ctx.status(200),
                ctx.json({
                    "agreement_id": "acde070d-8c4c-4f0d-9d8a-162843c10333",
                    "title": "ブロックチェーン電子契約 秘密保持契約書",
                    "own_company": {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "postal_code": "123-1234",
                        "state": "神奈川県",
                        "city": "川崎市",
                        "address_line": "高津区坂戸1-1-1",
                        "building": "KSPビル"
                    },
                    "customer_company": {
                        "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
                        "company_name": "株式会社イースコントラクト",
                        "postal_code": "004-0051",
                        "state": "北海道",
                        "city": "札幌市",
                        "address_line": "厚別区厚別中央1条6丁目2-1",
                        "building": "D-スクエア新さっぽろ6F"
                    },
                    "type": "契約種別",
                    "deal_amount": 1000000,
                    "conclusion_date": "2021-01-01",
                    "expiration_date": "2021-01-01",
                    "internal_pic": {
                        "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
                        "user_name": "山本和彦",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                    },
                    "customer_pic": {
                        "approver_id": "025f93b5-6a76-b248-ff14-164a70d15b05",
                        "user_name": "鈴木浩",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "suzuki@micsign.com",
                    },
                    "status": "CONCLUDED"
                })
            );
        };
    }),

    // PDF取得（暫定） - 契約書（初版）
    rest.get(apiURL.AGREEMENTS_URL_GUEST + '/:agreementId/approvals', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "internal_pic": {
                    "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "position": "社員",
                    "email": "yamamoto@micros.com",
                    "approved": true,
                    "approved_time": "2025-04-01T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "569b87e0-5447-984f-debc-a8bb219a9fa9",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "代表取締役社長",
                        "email": "yoshida@micros.com",
                        "approved": true,
                        "approved_time": "2025-04-01T02:12:56.789Z"
                    },
                    {
                        "approver_id": "569b87e0-5447-984f-debc-a8bb219a9fa9",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "yoshioka@micros.com",
                        "email": "xxx@xxx.co.jp",
                        "approved": true,
                        "approved_time": "2025-04-01T03:21:56.789Z"
                    }
                ],
                "internal_authorizer": {
                    "approver_id": "e5f0c571-31c9-0ad9-4aff-15b35f3f88e1",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "position": "代表取締役社長",
                    "email": "matsumoto@micros.com",
                    "approved": true,
                    "approved_time": "2025-04-01T06:56:56.789Z"
                },
                "internal_notifier": [
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "小川和也",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "ogawa@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "025f93b5-6a76-b248-ff14-164a70d15b05",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "position": "代表取締役社長",
                    "email": "suzuki@micsign.com",
                    "approved": true,
                    "approved_time": "2025-04-01T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "54b52492-9fef-d706-6598-4673a2aa77a0",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamazaki@micsign.com",
                        "approved": true,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                    {
                        "approver_id": "54b52492-9fef-d706-6598-4673a2aa77a0",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamazaki@micsign.com",
                        "approved": true,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c99c87b-4e23-3b20-e003-876bc0820a03",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "position": "代表取締役社長",
                    "email": "watanabe@micsign.com",
                    "approved": false,
                    "approved_time": "2025-04-01T12:41:12.789Z"
                },
                "customer_notifier": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "金子大雅",
                        "company_name": "株式会社イースコントラクト",
                        "email": "kaneko@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "1c99c87b-4e23-3b20-e003-876bc0820a03",
                "submission_period": 7
            })
        );
    }),
    // PDF取得（暫定） - 契約書（初版）
    rest.get(apiURL.AGREEMENTS_URL_GUEST + '/:agreementId/signatures', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "signatures": [
                    {
                        "user_name": "山本和彦",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                        "role": "internal_pic",
                        "signed_time": "2025-04-01T01:34:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yoshida@micros.com",
                        "role": "internal_approver",
                        "signed_time": "2025-04-01T02:12:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yoshioka@micros.com",
                        "role": "internal_approver",
                        "signed_time": "2025-04-01T03:21:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "松本真由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "代表取締役社長",
                        "email": "matsumoto@micros.com",
                        "role": "internal_authorizer",
                        "signed_time": "2025-04-01T06:56:56.789Z",
                        "valid": true
                    },
                    // {
                    //     "user_name": "鈴木浩",
                    //     "company_name": "株式会社イースコントラクト",
                    //     "position": "社員",
                    //     "email": "suzuki@micsign.com",
                    //     "role": "customer_pic",
                    //     "signed_time": "2025-04-01T08:21:11.789Z",
                    //     "valid": true
                    // },
                    {
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamazaki@micsign.com",
                        "role": "customer_approver",
                        "signed_time": "2025-04-01T09:51:52.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                        "role": "customer_approver",
                        "signed_time": "2025-04-01T12:12:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "渡辺浩一",
                        "company_name": "株式会社イースコントラクト",
                        "position": "代表取締役社長",
                        "email": "watanabe@micsign.com",
                        "role": "customer_authorizer",
                        "signed_time": "2025-04-01T12:41:12.789Z",
                        "valid": true
                    },
                ],
                "file_valid": true,
                "agreement_valid": true
            })
        );
    }),
    // 承認フローを開始するAPI
    rest.post(apiURL.AGREEMENTS_URL_GUEST + '/:agreementId/approvals', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "approved_time": "2025-04-01T12:41:12.789Z"
            })
        );
    }),







    // ----- アカウント情報取得（accounts） -----
    /***
     * 
     * ユーザー情報を取得する
     * 
     */
    rest.get(apiURL.USER_URL, (req, res, ctx) => {
        const company_id = req.url.searchParams.get('company_id');
        if (company_id === '805264ba-91f0-c1a8-1c26-88b237b2e7aa') {
            return res(ctx.status(200), ctx.json(internalUserList.company_1));
        }

        return res(ctx.status(200), ctx.json(customerUserList.company_1));
    }),
]