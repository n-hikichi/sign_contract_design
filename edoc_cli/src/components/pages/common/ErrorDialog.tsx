import React from 'react';
import { Modal, Box, Typography, TextField } from '@mui/material';
import HoverButton from '../../elements/EdocButton';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { approveStartDialogStyle } from '../../../styles/styles';
import appMessage from '../../../utils/appMessage';

interface ErrorDialogProps {
    open: boolean;
    handleClose: () => void;
    errorCode: number;
    errorProcess: string;
}

/**
 * 
 * API実行のエラーダイアログ
 * 
 */
const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, handleClose, errorCode, errorProcess }) => {
    return (
        <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{...approveStartDialogStyle, backgroundColor: '#ffeeee' }}>
                <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                    リクエスト処理中にエラーが発生しました
                </Typography>
                <Box>
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography sx={{ backgroundColor: '#FFCDD2', padding: '8px', borderRadius: '4px', fontWeight: 'bold', width: '30%', border: '1px solid lightgray', fontSize: '20px' }}>
                            エラー情報
                        </Typography>
                        <Box bgcolor='white' sx={{ border: '1px solid lightgray', padding: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    label="実行処理"
                                    value={errorProcess}
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    label="エラーコード"
                                    value={errorCode}
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle}
                                    disabled={true}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                <TextField
                                    label="エラーメッセージ"
                                    value={appMessage.errorMessage['errorMessage'][errorCode]}
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle}
                                    disabled={true}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <HoverButton text='閉じる' variant='contained' color='primary' handleClick={handleClose} />
                </Box>
            </Box>
        </Modal>
    );
};

export default ErrorDialog;