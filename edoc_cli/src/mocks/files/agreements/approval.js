/***
 * 
 * 署名テンプレート一覧のモックデータ
 * src/mocks/signatureTemplate.js
 * 
 */
export const getApproval = (agreementId) => {
    switch (agreementId) {
        // 社内承認中のデータ（ステータス：社内承認中） - １
        case "0f5ca003-1e4e-0fa1-3fd5-a2767c702992":
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "yamamoto@micros.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2025-04-01T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T02:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T03:21:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
                    "approved": false,
                    "approved_time": "2025-04-01T06:56:56.789Z"
                },
                "internal_notifier": [
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "小川和也",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "ogawa@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": false,
                    "approved_time": "2025-04-01T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "email": "watanabe@micsign.com",
                    "position": "代表取締役社長",
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
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                "submission_period": 1
            };
        // 社内承認中のデータ（ステータス：社内承認中） - ２
        case "bad88342-f757-214e-f0a7-7c759904140e":
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "yamamoto@micros.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2025-04-01T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T02:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T03:21:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
                    "approved": false,
                    "approved_time": "2025-04-01T06:56:56.789Z"
                },
                "internal_notifier": [
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "小川和也",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "ogawa@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": false,
                    "approved_time": "2025-04-01T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "email": "watanabe@micsign.com",
                    "position": "代表取締役社長",
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
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                "submission_period": 1
            };
        // 社内承認中のデータ（ステータス：社内差戻し）
        case "d73cab8e-fc49-e8cb-9113-476f357c6885":
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "yamamoto@micros.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2025-04-01T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T02:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T03:21:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
                    "approved": false,
                    "approved_time": "2025-04-01T06:56:56.789Z"
                },
                "internal_notifier": [
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "小川和也",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "ogawa@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": false,
                    "approved_time": "2025-04-01T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "email": "watanabe@micsign.com",
                    "position": "代表取締役社長",
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
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                "submission_period": 1
            };
        // 社内承認中のデータ（ステータス：社内承認完了）
        case "b4486b19-78bd-d5f7-09a8-5e2923519cb0":
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "yamamoto@micros.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2025-04-01T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-04-01T02:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-04-01T03:21:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
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
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": false,
                    "approved_time": "2025-04-01T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "email": "watanabe@micsign.com",
                    "position": "代表取締役社長",
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
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                "submission_period": 1
            };
        // 相手方承認中のデータ（ステータス：相手方承認中）
        case "1fc0d9d2-cb1b-0ab2-9b3c-efbd21210545":
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "yamamoto@micros.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2025-04-01T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-04-01T02:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-04-01T03:21:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
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
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": false,
                    "approved_time": "2025-04-01T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "email": "watanabe@micsign.com",
                    "position": "代表取締役社長",
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
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                "submission_period": 1
            };
        // 相手方承認中のデータ（ステータス：相手方差戻し）
        case "3dc4d9a6-e405-959d-8d9e-83897fff258f":
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "yamamoto@micros.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2025-04-01T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-04-01T02:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2025-04-01T03:21:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
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
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": false,
                    "approved_time": "2025-04-01T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2025-04-01T09:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "email": "watanabe@micsign.com",
                    "position": "代表取締役社長",
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
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                "submission_period": 1
            };
        default:
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "yamamoto@micros.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2024-05-21T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
                    "approved": false,
                    "approved_time": "2024-05-21T06:56:56.789Z"
                },
                "internal_notifier": [
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "小川和也",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "ogawa@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "斎藤大和",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "saito@micros.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": false,
                    "approved_time": "2024-05-21T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                ],
                "customer_authorizer": {
                    "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
                    "user_name": "渡辺浩一",
                    "company_name": "株式会社イースコントラクト",
                    "email": "watanabe@micsign.com",
                    "position": "代表取締役社長",
                    "approved": false,
                    "approved_time": "2024-05-22T04:41:12.789Z"
                },
                "customer_notifier": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "金子大雅",
                        "company_name": "株式会社イースコントラクト",
                        "email": "kaneko@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "青木友美",
                        "company_name": "株式会社イースコントラクト",
                        "email": "aoki@micsign.com",
                        "position": "社員",
                        "approved": false,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                "submission_period": 1
            };
    };
};
