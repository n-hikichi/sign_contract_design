
namespace converter {

    /***
     *
     * 日付
     *
     */
    // yyyymmdd形式の日付を返却する
    export const getCurrentDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = ("00" + (date.getMonth() + 1)).slice(-2);
        const day = ("00" + date.getDate()).slice(-2);
        const hours = ("00" + date.getHours()).slice(-2);
        const minutes = ("00" + date.getMinutes()).slice(-2);
        const second = ("00" + date.getSeconds()).slice(-2);
        return `${year}${month}${day}${hours}${minutes}${second}`;
    }

    export const dateConverter_fromISO8601 = (dateString: string) => {
        const date = new Date(dateString);
        return date.getFullYear() + '年' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '月' +
            ('0' + date.getDate()).slice(-2) + '日 ' +
            ('0' + date.getHours()).slice(-2) + '時' +
            ('0' + date.getMinutes()).slice(-2) + '分' +
            ('0' + date.getSeconds()).slice(-2) + '秒'
    };

    /***
     *
     * 郵便番号
     *
     */
    export const postalCodeConverter = (value: string) => {
        let formatalue = value.replace(/[^0-9]/g, '');
        if (formatalue.length > 7) {
            formatalue = formatalue.slice(0, 7); // 7桁以上を切り捨て
        }
        if (formatalue.length > 3) {
            formatalue = `${formatalue.slice(0, 3)}-${formatalue.slice(3)}`; // 3桁以上でハイフンを追加
        }
        return formatalue;
    };
};

export default converter;
