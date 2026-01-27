import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { readOnlyTextFieldStyle_Register } from '../../../styles/fontStyles';
import { baseContentsStyle, pdfPreviewDialogStyle } from '../../../styles/styles';
import api from '../../../utils/apiAccessor';
import CircularProgress from '@mui/material/CircularProgress';

interface CommonTextFieldProps {
    value: string;
    label: string;
}

interface CommonTextAndPreviewFieldProps {
    value: string;
    label: string;
    onButtonClick: () => void;
}

const CommonTextField: React.FC<CommonTextFieldProps> = ({ value, label }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
            <TextField
                value={value}
                label={label}
                variant="standard"
                sx={readOnlyTextFieldStyle_Register}
                disabled={true}
                InputProps={{
                    disableUnderline: true,
                }}
            />
        </Box>
    );
};

const CommonTextAndPreviewField: React.FC<CommonTextAndPreviewFieldProps> = ({ value, label, onButtonClick }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
            <TextField
                value={value}
                label={label}
                variant="standard"
                sx={readOnlyTextFieldStyle_Register}
                disabled={true}
                InputProps={{
                    disableUnderline: true,
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '10px', width: '20%', paddingRight: '20px' }}>
                <Button variant="contained" onClick={onButtonClick} sx={{ '&:hover': { backgroundColor: 'darkblue' } }} >
                    全画面で表示する
                </Button>
            </Box>
        </Box>
    );
};

const PreviewBasicInfo: React.FC<{}> = (props: any) => {

    // data url形式のbase64にエンコードされたpdfファイル
    const [pdf_base64, setPdf_base64] = useState('');
    const [pdfLoading, setPdfLoading] = useState(true);

    // PDFファイルプレビュー
    // プレビューダイアログの開閉状態
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);

    // ダイアログを開く関数
    const openPdfPreviewDialog = () => {
        setPdfPreviewDialogOpen(true);
    };

    useEffect(() => {
        // 契約書を取得する
        async function fetchGetAgreementFile() {
            try {
                const res = await api.getAgreementFile(props.agreement_id)
                if (res.status !== api.HTTP_OK) {
                    console.log("API(fetchGetAgreementFile()) response failed. HTTP Status: " + res.status);
                }

                // 取得したユーザー情報を設定する
                const json = await res.json();
                setPdf_base64("data:application/pdf;base64," + json.file);
                setPdfLoading(false); // 読み込み完了
            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);
                setPdfLoading(false); // 読み込み完了
            }
        };

        fetchGetAgreementFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Box sx={{ flexGrow: 1, marginBottom: '20px', border: '1px solid lightgray' }}>
                <Box bgcolor="white" sx={{ flexGrow: 1, padding: '20px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '100%', marginBottom: '40px' }}>
                            <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>基本情報</Typography>
                            </Box>
                            <CommonTextAndPreviewField value={props.title} label="件名" onButtonClick={openPdfPreviewDialog} />
                            <CommonTextField value={props.type} label="契約書種別" />
                            <CommonTextField value={props.deal_amount} label="取引金額" />
                            <CommonTextField value={props.conclusion_date} label="契約開始日" />
                            <CommonTextField value={props.expiration_date} label="契約終了日" />
                            <CommonTextField value='{props.approval_flow.submission_period}' label="署名用URL有効期限（相手方企業向け）" />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '50%' }}>
                            <Box sx={{ marginBottom: '20px', marginRight: '10px' }}>
                                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>自社情報</Typography>
                                </Box>
                                <CommonTextField value='{props.own_company.company_name}' label="会社名" />
                                <CommonTextField value='{props.own_company.postal_code}' label="郵便番号" />
                                <CommonTextField value='{props.own_company.state}' label="都道府県" />
                                <CommonTextField value='{props.own_company.city}' label="市区町村" />
                                <CommonTextField value='{props.own_company.address_line}' label="町名番地" />
                                <CommonTextField value='{props.own_company.building}' label="建物名・部屋番号" />
                            </Box>
                        </Box>
                        <Box sx={{ width: '50%', marginLeft: '10px' }}>
                            <Box>
                                <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>相手方企業情報</Typography>
                                </Box>
                                <CommonTextField value='{props.customer_company.company_name}' label="会社名" />
                                <CommonTextField value='{props.customer_company.postal_code}' label="郵便番号" />
                                <CommonTextField value='{props.customer_company.state}' label="都道府県" />
                                <CommonTextField value='{props.customer_company.city}' label="市区町村" />
                                <CommonTextField value='{props.customer_company.address_line}' label="町名番地" />
                                <CommonTextField value='{props.customer_company.building}' label="建物名・部屋番号" />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            {/* ファイルプレビューダイアログ */}
            <div>
                <Modal
                    open={pdfPreviewDialogOpen}
                    onClose={handlePdfPreviewDialogClose}
                >
                    <Box sx={pdfPreviewDialogStyle} >
                        <Box
                            sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                            onClick={() => window.open(pdf_base64, '_blank')}
                        >
                            {pdfLoading ? (
                                <CircularProgress />
                            ) : (
                                <embed type='application/pdf' src={pdf_base64 + "#zoom=100"} height='100%' width='100%' />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                            <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={(handlePdfPreviewDialogClose)}>プレビュー終了</Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        </>
    );
}

export default PreviewBasicInfo;