import { Box, CircularProgress, Modal, Typography } from "@mui/material";
import { processingDialogStyle } from '../../../styles/styles';

interface ApiProcessingDialogProps {
    open: boolean;
    handleClose: () => void;
}

/***
 * 
 * API処理中ダイアログ
 * 
 */
const ApiProcessingDialog: React.FC<ApiProcessingDialogProps> = ({ open, handleClose }) => {

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={{ ...processingDialogStyle, zIndex: 9999 }} >
                    <Typography sx={{ backgroundColor: 'darkblue', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                        リクエストの処理中
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                処理が終わるまでしばらくお待ちください。
                            </Typography>
                            <CircularProgress />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

/***
 * 
 * API処理中ダイアログ
 * 
 */
export const ApiWaitingDialog: React.FC<ApiProcessingDialogProps> = ({ open, handleClose }) => {

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={{ ...processingDialogStyle, zIndex: 9999 }} >
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                追加のデータを取得しています。処理が終わるまで今しばらくお待ちください。
                            </Typography>
                            <CircularProgress />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

/***
 * 
 * API処理中ダイアログ
 * 
 */
export const ApiGetAdditionalDataDialog: React.FC<ApiProcessingDialogProps> = ({ open, handleClose }) => {

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={{ ...processingDialogStyle, zIndex: 9999 }} >
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                リクエストの処理中...
                            </Typography>
                            <CircularProgress />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default ApiProcessingDialog;