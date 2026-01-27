/***
 * 
 * 署名テンプレート一覧のモックデータ
 * src/mocks/signatureTemplate.js
 * 
 */
export const getSignature = (signatureId) => {
    switch (signatureId) {
        case "acde070d-8c4c-4f0d-9d8a-162843c10333":
            return {
                "signatures": [
                    {
                        "user_name": "山本和彦",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                        "role": "internal_pic",
                        "signed_time": "2024-05-21T01:34:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yoshida@micros.com",
                        "role": "internal_approver",
                        "signed_time": "2024-05-21T03:12:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yoshioka@micros.com",
                        "role": "internal_approver",
                        "signed_time": "2024-05-21T03:12:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "松本真由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "代表取締役社長",
                        "email": "matsumoto@micros.com",
                        "role": "internal_authorizer",
                        "signed_time": "2024-05-21T06:56:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "鈴木浩",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "suzuki@micsign.com",
                        "role": "customer_pic",
                        "signed_time": "2024-05-21T08:21:11.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamazaki@micsign.com",
                        "role": "customer_approver",
                        "signed_time": "2024-05-22T00:51:52.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                        "role": "customer_approver",
                        "signed_time": "2024-05-21T03:12:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "渡辺浩一",
                        "company_name": "株式会社イースコントラクト",
                        "position": "代表取締役社長",
                        "email": "watanabe@micsign.com",
                        "role": "customer_authorizer",
                        "signed_time": "2024-05-22T04:41:12.789Z",
                        "valid": true
                    },
                ],
                "file_valid": true,
                "agreement_valid": true
            };
        case "93b464d8-2b00-1b71-f2ea-324e878eccb4":
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
                        "email": "d.arai@micros.co.jp",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "1e99fd8c-8b01-88e1-0384-5f5a6fc473da",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "9a912dc9-8754-21d3-454e-3dbd01f12b36",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
                    "approved": true,
                    "approved_time": "2024-05-21T06:56:56.789Z"
                },
                "internal_notifier": [
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉田由美子_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "1e99fd8c-8b01-88e1-0384-5f5a6fc473da",
                        "user_name": "吉岡由美_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "9a912dc9-8754-21d3-454e-3dbd01f12b36",
                        "user_name": "吉岡由美_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2024-05-21T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
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
                        "user_name": "山崎大輔_notifier",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "山本大輔_notifier",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                "submission_period": 1
            };
        case "d5568801-dd56-3317-31e6-f389c02d2412":
            return {
                "signatures": [
                    {
                        "user_name": "山本和彦",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                        "role": "internal_pic",
                        "signed_time": "2024-04-01T01:34:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yoshida@micros.com",
                        "role": "internal_approver",
                        "signed_time": "2024-04-01T02:12:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "社員",
                        "email": "yoshioka@micros.com",
                        "role": "internal_approver",
                        "signed_time": "2024-04-01T03:21:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "松本真由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "position": "代表取締役社長",
                        "email": "matsumoto@micros.com",
                        "role": "internal_authorizer",
                        "signed_time": "2024-04-01T06:56:56.789Z",
                        "valid": true
                    },
                    // {
                    //     "user_name": "鈴木浩",
                    //     "company_name": "株式会社イースコントラクト",
                    //     "position": "社員",
                    //     "email": "suzuki@micsign.com",
                    //     "role": "customer_pic",
                    //     "signed_time": "2024-04-01T08:21:11.789Z",
                    //     "valid": true
                    // },
                    {
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamazaki@micsign.com",
                        "role": "customer_approver",
                        "signed_time": "2024-04-01T09:51:52.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "position": "社員",
                        "email": "yamamoto@micros.com",
                        "role": "customer_approver",
                        "signed_time": "2024-04-01T12:12:56.789Z",
                        "valid": true
                    },
                    {
                        "user_name": "渡辺浩一",
                        "company_name": "株式会社イースコントラクト",
                        "position": "代表取締役社長",
                        "email": "watanabe@micsign.com",
                        "role": "customer_authorizer",
                        "signed_time": "2024-04-01T12:41:12.789Z",
                        "valid": true
                    },
                ],
                "file_valid": true,
                "agreement_valid": true
            };
            case "e34fab9f-9dee-1d0d-d4c8-bd3354c9c02e":
                return {
                    "signatures": [
                        {
                            "user_name": "山本和彦",
                            "company_name": "株式会社ミクロスソフトウエア",
                            "position": "社員",
                            "email": "yamamoto@micros.com",
                            "role": "internal_pic",
                            "signed_time": "2023-04-01T01:34:56.789Z",
                            "valid": true
                        },
                        {
                            "user_name": "吉田由美子",
                            "company_name": "株式会社ミクロスソフトウエア",
                            "position": "社員",
                            "email": "yoshida@micros.com",
                            "role": "internal_approver",
                            "signed_time": "2023-04-01T02:12:56.789Z",
                            "valid": true
                        },
                        {
                            "user_name": "吉岡由美",
                            "company_name": "株式会社ミクロスソフトウエア",
                            "position": "社員",
                            "email": "yoshioka@micros.com",
                            "role": "internal_approver",
                            "signed_time": "2023-04-01T03:21:56.789Z",
                            "valid": true
                        },
                        {
                            "user_name": "松本真由美",
                            "company_name": "株式会社ミクロスソフトウエア",
                            "position": "代表取締役社長",
                            "email": "matsumoto@micros.com",
                            "role": "internal_authorizer",
                            "signed_time": "2023-04-01T06:56:56.789Z",
                            "valid": true
                        },
                        // {
                        //     "user_name": "鈴木浩",
                        //     "company_name": "株式会社イースコントラクト",
                        //     "position": "社員",
                        //     "email": "suzuki@micsign.com",
                        //     "role": "customer_pic",
                        //     "signed_time": "2023-04-01T08:21:11.789Z",
                        //     "valid": true
                        // },
                        {
                            "user_name": "山崎大輔",
                            "company_name": "株式会社イースコントラクト",
                            "position": "社員",
                            "email": "yamazaki@micsign.com",
                            "role": "customer_approver",
                            "signed_time": "2023-04-01T09:51:52.789Z",
                            "valid": true
                        },
                        {
                            "user_name": "山本大輔",
                            "company_name": "株式会社イースコントラクト",
                            "position": "社員",
                            "email": "yamamoto@micros.com",
                            "role": "customer_approver",
                            "signed_time": "2023-04-01T12:12:56.789Z",
                            "valid": true
                        },
                        {
                            "user_name": "渡辺浩一",
                            "company_name": "株式会社イースコントラクト",
                            "position": "代表取締役社長",
                            "email": "watanabe@micsign.com",
                            "role": "customer_authorizer",
                            "signed_time": "2023-04-01T12:41:12.789Z",
                            "valid": true
                        },
                    ],
                    "file_valid": true,
                    "agreement_valid": true
                };
            // return {
            //     "internal_pic": {
            //         "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
            //         "user_name": "山本和彦",
            //         "company_name": "株式会社ミクロスソフトウエア",
            //         "email": "yamamoto@micros.com",
            //         "position": "社員",
            //         "approved": true,
            //         "approved_time": "2024-05-21T01:34:56.789Z"
            //     },
            //     "internal_approver": [
            //         {
            //             "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
            //             "user_name": "吉田由美子",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "d.arai@micros.co.jp",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //         {
            //             "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
            //             "user_name": "吉岡由美",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "yoshioka@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //         {
            //             "approver_id": "1e99fd8c-8b01-88e1-0384-5f5a6fc473da",
            //             "user_name": "吉岡由美",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "yoshioka@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //         {
            //             "approver_id": "9a912dc9-8754-21d3-454e-3dbd01f12b36",
            //             "user_name": "吉岡由美",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "yoshioka@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //     ],
            //     "internal_authorizer": {
            //         "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
            //         "user_name": "松本真由美",
            //         "company_name": "株式会社ミクロスソフトウエア",
            //         "email": "matsumoto@micros.com",
            //         "position": "代表取締役社長",
            //         "approved": true,
            //         "approved_time": "2024-05-21T06:56:56.789Z"
            //     },
            //     "internal_notifier": [
            //         {
            //             "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
            //             "user_name": "吉田由美子_notifier",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "yoshida@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //         {
            //             "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
            //             "user_name": "吉岡由美_notifier",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "yoshioka@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //         {
            //             "approver_id": "1e99fd8c-8b01-88e1-0384-5f5a6fc473da",
            //             "user_name": "吉岡由美_notifier",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "yoshioka@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //         {
            //             "approver_id": "9a912dc9-8754-21d3-454e-3dbd01f12b36",
            //             "user_name": "吉岡由美_notifier",
            //             "company_name": "株式会社ミクロスソフトウエア",
            //             "email": "yoshioka@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //     ],
            //     "customer_pic": {
            //         "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
            //         "user_name": "鈴木浩",
            //         "company_name": "株式会社イースコントラクト",
            //         "email": "suzuki@micsign.com",
            //         "position": "社員",
            //         "approved": true,
            //         "approved_time": "2024-05-21T08:21:11.789Z"
            //     },
            //     "customer_approver": [
            //         {
            //             "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
            //             "user_name": "山崎大輔",
            //             "company_name": "株式会社イースコントラクト",
            //             "email": "yamazaki@micsign.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-22T00:51:52.789Z"
            //         },
            //         {
            //             "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
            //             "user_name": "山本大輔",
            //             "company_name": "株式会社イースコントラクト",
            //             "email": "yamamoto@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //     ],
            //     "customer_authorizer": {
            //         "approver_id": "1c9c9716-a329-3261-a115-df3793337ea9",
            //         "user_name": "渡辺浩一",
            //         "company_name": "株式会社イースコントラクト",
            //         "email": "watanabe@micsign.com",
            //         "position": "代表取締役社長",
            //         "approved": false,
            //         "approved_time": "2024-05-22T04:41:12.789Z"
            //     },
            //     "customer_notifier": [
            //         {
            //             "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
            //             "user_name": "山崎大輔_notifier",
            //             "company_name": "株式会社イースコントラクト",
            //             "email": "yamazaki@micsign.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-22T00:51:52.789Z"
            //         },
            //         {
            //             "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
            //             "user_name": "山本大輔_notifier",
            //             "company_name": "株式会社イースコントラクト",
            //             "email": "yamamoto@micros.com",
            //             "position": "社員",
            //             "approved": true,
            //             "approved_time": "2024-05-21T03:12:56.789Z"
            //         },
            //     ],
            //     "present_approver": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
            //     "submission_period": 1
            // };
        default:
            return {
                "internal_pic": {
                    "approver_id": "307ec2f2-0dd0-664f-090f-71d20c5b4738",
                    "user_name": "山本和彦",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "d.arai@micros.co.jp",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2024-05-21T01:34:56.789Z"
                },
                "internal_approver": [
                    {
                        "approver_id": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                        "user_name": "吉田由美子",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "d.arai@micros.co.jp",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "1e99fd8c-8b01-88e1-0384-5f5a6fc473da",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "9a912dc9-8754-21d3-454e-3dbd01f12b36",
                        "user_name": "吉岡由美",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "internal_authorizer": {
                    "approver_id": "f3e38973-1ded-47fe-295f-d8399b693800",
                    "user_name": "松本真由美",
                    "company_name": "株式会社ミクロスソフトウエア",
                    "email": "matsumoto@micros.com",
                    "position": "代表取締役社長",
                    "approved": true,
                    "approved_time": "2024-05-21T06:56:56.789Z"
                },
                "internal_notifier": [
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉田由美子_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshida@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "67678eb2-232a-1f30-a4ad-e215e1066d70",
                        "user_name": "吉岡由美_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "1e99fd8c-8b01-88e1-0384-5f5a6fc473da",
                        "user_name": "吉岡由美_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                    {
                        "approver_id": "9a912dc9-8754-21d3-454e-3dbd01f12b36",
                        "user_name": "吉岡由美_notifier",
                        "company_name": "株式会社ミクロスソフトウエア",
                        "email": "yoshioka@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "customer_pic": {
                    "approver_id": "378a838d-ce95-1678-7de7-4c1a5a68cc43",
                    "user_name": "鈴木浩",
                    "company_name": "株式会社イースコントラクト",
                    "email": "suzuki@micsign.com",
                    "position": "社員",
                    "approved": true,
                    "approved_time": "2024-05-21T08:21:11.789Z"
                },
                "customer_approver": [
                    {
                        "approver_id": "5ffc7d53-6814-6d41-b472-bf5b3fd62e92",
                        "user_name": "山崎大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "山本大輔",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
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
                        "user_name": "山崎大輔_notifier",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamazaki@micsign.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-22T00:51:52.789Z"
                    },
                    {
                        "approver_id": "157bed3e-5fa6-9e64-be8b-ac434c0a2b10",
                        "user_name": "山本大輔_notifier",
                        "company_name": "株式会社イースコントラクト",
                        "email": "yamamoto@micros.com",
                        "position": "社員",
                        "approved": true,
                        "approved_time": "2024-05-21T03:12:56.789Z"
                    },
                ],
                "present_approver": "922d3ab8-8d8c-4035-e637-6d079eee7fac",
                "submission_period": 1
            };
    };
};
