import { internalSealImage } from './internalSealImage';

/***
 * 
 * 署名テンプレート一覧のモックデータ
 * src/mocks/signatureTemplate.js
 * 
 */
export const internalUserList = {
    company_1: [ // 配列をプロパティとして定義
        {
            "user_id": '647d5c34-c218-1861-fca8-3658ff6f88ba',
            "user_name": "山本和彦",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "社員",
            "email": "yamamoto@micros.com",
            "file": "",
            // "file": internalSealImage.yamamoto,
            "isRepresentativeSeal": false
        },
        {
            "user_id": '0eb1a664-fe6d-5350-df07-aebcef465db7',
            "user_name": "吉田由美子",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "社員",
            "email": "yoshida@micros.com",
            "file": internalSealImage.yoshida,
            "isRepresentativeSeal": false
        },
        {
            "user_id": '0b680670-58eb-d4b0-b6e8-82e8f28b966d',
            "user_name": "吉岡由美",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "社員",
            "email": "yoshioka@micros.com",
            "file": internalSealImage.yoshioka,
            "isRepresentativeSeal": false
        },
        {
            "user_id": '5d779039-f12b-0da6-357a-cd6a9c881d3d',
            "user_name": "松本真由美",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "代表取締役社長",
            "email": "matsumoto@micros.com",
            "file": internalSealImage.matsumoto,
            "isRepresentativeSeal": false
        },
        // {
        //     "user_id": '5d779039-f12b-0da6-357a-cd6a9c881d3d',
        //     "user_name": "事業部長印",
        //     "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //     "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
        //     "position": "AT事業部 事業部長印",
        //     "email": "---",
        //     "file": internalSealImage.matsumoto,
        //     "isRepresentativeSeal": true
            
        // },
        // {
        //     "user_id": '5d779039-f12b-0da6-357a-cd6a9c881d3d',
        //     "user_name": "事業部長印",
        //     "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
        //     "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
        //     "position": "ES事業部 事業部長印",
        //     "email": "---",
        //     "file": internalSealImage.matsumoto,
        //     "isRepresentativeSeal": true
            
        // },
        {
            "user_id": '5d779039-f12b-0da6-357a-cd6a9c881d3d',
            "user_name": "事業部長印",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "IT事業部 事業部長印",
            "email": "---",
            "file": internalSealImage.butyo,
            "isRepresentativeSeal": true
            
        },
        {
            "user_id": '5d779039-f12b-0da6-357a-cd6a9c881d3d',
            "user_name": "代表取締役印",
            "company_id": "805264ba-91f0-c1a8-1c26-88b237b2e7aa",
            "location_id": "7fcc0167-c308-807a-9ec3-9946bc0fc013",
            "position": "代表取締役",
            "email": "---",
            "file": internalSealImage.torishimariyaku,
            "isRepresentativeSeal": true
        },
    ]
};