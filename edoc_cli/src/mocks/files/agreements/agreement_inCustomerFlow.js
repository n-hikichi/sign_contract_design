/***
 * 
 * 署名テンプレート一覧のモックデータ
 * src/mocks/signatureTemplate.js
 * 
 */
export const agreement_inCustomerFlow = {
    agreements: [ // 配列をプロパティとして定義
        {
            "agreement_id": '1fc0d9d2-cb1b-0ab2-9b3c-efbd21210545',
            "title": "ブロックチェーン電子契約_テレワーク覚書",
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
                "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                "company_name": "株式会社イースコントラクト",
                "postal_code": "004-0051",
                "state": "北海道",
                "city": "札幌市",
                "address_line": "厚別区厚別中央1条6丁目2-1",
                "building": "D-スクエア新さっぽろ6F"
            },
            "deal_amount": 200000,
            "type": "基本契約",
            "conclusion_date": "2025-04-01",
            "expiration_date": "2026-03-31",
            "internal_pic": {
                "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
                "user_name": "山本和彦",
                "company_name": "株式会社ミクロスソフトウエア",
                "position": "社員",
                "email": "yamamoto@micros.com"
            },
            "customer_pic": {
                "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
                "user_name": "鈴木浩",
                "company_name": "株式会社イースコントラクト",
                "position": "社員",
                "email": "suzuki@micsign.com"
            },
            "status": "CUSTOMER_APPROVING",
        },
        {
            "agreement_id": '3dc4d9a6-e405-959d-8d9e-83897fff258f',
            "title": "ブロックチェーン電子契約_秘密保持契約書",
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
                "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
                "company_name": "株式会社イースコントラクト",
                "postal_code": "004-0051",
                "state": "北海道",
                "city": "札幌市",
                "address_line": "厚別区厚別中央1条6丁目2-1",
                "building": "D-スクエア新さっぽろ6F"
            },
            "deal_amount": 90000000,
            "type": "基本契約",
            "conclusion_date": "2025-04-01",
            "expiration_date": "2026-03-31",
            "internal_pic": {
                "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
                "user_name": "山本和彦",
                "company_name": "株式会社ミクロスソフトウエア",
                "position": "社員",
                "email": "yamamoto@micros.com"
            },
            "customer_pic": {
                "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
                "user_name": "鈴木浩",
                "company_name": "株式会社イースコントラクト",
                "position": "社員",
                "email": "suzuki@micsign.com"
            },
            "status": "CUSTOMER_REMANDING",
        },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　秘密保持契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 4000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_APPROVING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　aaa契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 20000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_APPROVING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　bbb契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 1000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_APPROVING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　ccc契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 7000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_APPROVING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　ddd契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 400000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_APPROVING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　fff契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 1000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_REMANDING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　ggg契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 30000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_REMANDING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　hhh契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 75000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_REMANDING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　iii契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 41000000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_REMANDING",
        // },
        // {
        //     "agreement_id": 'acde070d-8c4c-4f0d-9d8a-162843c10333',
        //     "title": "電子契約アプリケーション　jjj契約書",
        //     "own_company": {
        //         "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "postal_code": "123-1234",
        //         "state": "神奈川県",
        //         "city": "川崎市",
        //         "address_line": "高津区坂戸1-1-1",
        //         "building": "KSPビル"
        //     },
        //     "customer_company": {
        //         "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
        //         "company_name": "株式会社イースコントラクト",
        //         "postal_code": "123-4567",
        //         "state": "東京都",
        //         "city": "渋谷区",
        //         "address_line": "1-1-1",
        //         "building": "○○ビル3階"
        //     },
        //     "deal_amount": 6800000,
        //     "type": "基本契約",
        //     "conclusion_date": "2024-10-15",
        //     "expiration_date": "2025-10-14",
        //     "internal_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "山本和彦",
        //         "company_name": "株式会社ミクロスソフトウエア",
        //         "position": "社員",
        //         "email": "yamamoto@micros.com"
        //     },
        //     "customer_pic": {
        //         "approver_id": "3f4e070d-8c4c-4f0d-9d8a-162843c10333",
        //         "user_name": "鈴木浩",
        //         "company_name": "株式会社イースコントラクト",
        //         "position": "社員",
        //         "email": "suzuki@micsign.com"
        //     },
        //     "status": "CUSTOMER_REMANDING",
        // },
    ]
};