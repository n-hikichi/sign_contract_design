import { Font, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import converter from "../../utils/converter";

Font.register({
    family: 'Noto Sans JP',
    src: `/fonts/NotoSansJP-Regular.ttf`,
});

// スタイルシートを作成
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 30,
        width: '100%',
        height: '100%',
    },
    text: {
        fontSize: 12,
        textAlign: 'justify',
        fontFamily: 'Noto Sans JP',
    },
    signatureBox: {
        marginTop: 10,
        borderBottom: '1px solid #000',
        textAlign: 'center',
    },
    header1: {
        marginButtom: 10,
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Noto Sans JP',
        backgroundColor: '#808080',
    },
    header2: {
        marginTop: 20,
        marginButtom: 10,
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Noto Sans JP',
        backgroundColor: '#808080',
    },
});

// PDFドキュメントの定義
const SignatureHistoryPdfForGuest = ({ approveFlow_Data, approveResult, agreement_id, title }: { approveFlow_Data: any, approveResult: any, agreement_id: string, title: string }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* 契約書情報 */}
            <Text style={styles.header1}>契約書情報</Text>
            <Text style={styles.text}>ファイル名：{String(title)}</Text>
            <Text style={styles.text}>契約書ID：{String(agreement_id)}</Text>
            <Text style={styles.header2}>契約締結情報</Text>
            {/* 契約締結権限保持者 */}
            <View style={styles.signatureBox}>
                <Text style={styles.text}>署名日：{converter.dateConverter_fromISO8601(approveFlow_Data.internal_authorizer.approved_time)}</Text>
                <Text style={styles.text}>署名者：{approveFlow_Data.internal_authorizer.company_name}　{approveFlow_Data.internal_authorizer.user_name}（{approveFlow_Data.internal_authorizer.email}）</Text>
            </View>
            <View style={styles.signatureBox}>
                <Text style={styles.text}>署名日：{converter.dateConverter_fromISO8601(approveFlow_Data.customer_authorizer.approved_time)}</Text>
                <Text style={styles.text}>署名者：{approveFlow_Data.customer_authorizer.company_name}　{approveFlow_Data.customer_authorizer.user_name}（{approveFlow_Data.customer_authorizer.email}）</Text>
            </View>
            {/* 署名欄 */}
            <Text style={styles.header2}>署名履歴</Text>
            {approveResult.map((history: any, index: number) => (
                <View style={styles.signatureBox}>
                    <Text style={styles.text}>署名日：{converter.dateConverter_fromISO8601(history.signed_time)}</Text>
                    <Text style={styles.text}>署名者：{history.company_name}　{history.user_name}（{history.email}）</Text>
                </View>
            ))}
        </Page>
    </Document >
);

export default SignatureHistoryPdfForGuest;