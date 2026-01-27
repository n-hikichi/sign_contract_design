import { customerSealImage } from './customerSealImage';

/***
 * 
 * 署名テンプレート一覧のモックデータ
 * src/mocks/signatureTemplate.js
 * 
 */
export const customerUserList = {
    company_1: [ // 配列をプロパティとして定義
        {
            "user_id": '6f8837f0-3d2a-5292-ab31-f0faece75831',
            "user_name": "鈴木浩",
            "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
            "location_id": "ca45be98-383a-6b6e-ba88-12410e2fe160",
            "position": "社員",
            "email": "suzuki@micsign.com",
            "file": "",
            // "file": customerSealImage.suzuki
            "isRepresentativeSeal": false
        },
        {
            "user_id": '08c617d5-f905-2b70-556c-f1d5bf3dbc3e',
            "user_name": "山崎大輔",
            "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
            "location_id": "ca45be98-383a-6b6e-ba88-12410e2fe160",
            "position": "社員",
            "email": "yamazaki@micsign.com",
            "file": customerSealImage.yamazaki,
            "isRepresentativeSeal": false
        },
        {
            "user_id": '77619fd7-dcba-2144-b181-ec03f9136edb',
            "user_name": "山本大輔",
            "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
            "location_id": "ca45be98-383a-6b6e-ba88-12410e2fe160",
            "position": "社員",
            "email": "yamamoto@micsign.com",
            "file": customerSealImage.yamamoto,
            "isRepresentativeSeal": false
        },
        {
            "user_id": '7a2713d9-398a-9d99-e24a-4b88f07997dc',
            "user_name": "渡辺浩一",
            "company_id": "4c57d40a-73f9-d465-11c4-d3bb37fd08a7",
            "location_id": "ca45be98-383a-6b6e-ba88-12410e2fe160",
            "position": "代表取締役社長",
            "email": "watanabe@micsign.com",
            "file": customerSealImage.watanabe,
            "isRepresentativeSeal": false
        },
        {
            "user_id": '5d779039-f12b-0da6-357a-cd6a9c881d3d',
            "user_name": "事業部長印",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "IT事業部 事業部長印",
            "email": "---",
            "file": customerSealImage.butyo,
            "isRepresentativeSeal": true
            
        },
        {
            "user_id": '5d779039-f12b-0da6-357a-cd6a9c881d3d',
            "user_name": "代表取締役印",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "代表取締役",
            "email": "---",
            "file": customerSealImage.torishimariyaku,
            "isRepresentativeSeal": true
        },
    ]
};