import { Box, Button, Grid, Modal } from "@mui/material";
import { useState } from "react";
import { baseContentsStyle, pdfPreviewDialogStyle } from '../../../styles/styles';

interface PreviewDocumentProps {
    pdf_base64: string;
}

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const PreviewDocument: React.FC<PreviewDocumentProps> = ({ pdf_base64 }) => {

    // PDFファイルプレビュー
    // プレビューダイアログの開閉状態
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
    const handlePdfPreviewDialogOpen = () => setPdfPreviewDialogOpen(true);
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);

    // ダイアログを開く関数
    const openPdfPreviewDialog = () => {
        setPdfPreviewDialogOpen(true);
    };

    return (
        <>
            <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
                <Grid item md={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'end', paddingBottom: '10px', alignItems: 'center' }}>
                        <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={(openPdfPreviewDialog)}>全画面プレビュー</Button>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', height: '1200px' }}>
                        <Box sx={{ ...baseContentsStyle, width: '100%', height: '100%', border: 'solid 2px black' }}>
                            <embed type='application/pdf' src={pdf_base64 + "#zoom=100"} height='100%' width='100%' />
                        </Box>
                    </Box>
                </Grid>
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
                            <embed type='application/pdf' src={pdf_base64 + "#zoom=100"} height='100%' width='100%' />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                            <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={(handlePdfPreviewDialogClose)}>プレビュー終了</Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        </>
    );
};

export default PreviewDocument;