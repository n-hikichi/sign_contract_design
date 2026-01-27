import { Box, Modal, TextField, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { approveStartDialogStyle } from '../../../styles/styles';
import HoverButton from '../../elements/EdocButton';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';

/**
 * 
 * API実行のエラーダイアログ
 * 
 */
const ClientSideErrorDialog: React.FC = () => {

    const navigate = useNavigate();
    const [open, setOpen] = React.useState(true);

    const redirectTopPage = async () => {
        navigate('/');
    };

    return (
        <>
            <Modal
                open={open}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{ ...approveStartDialogStyle, backgroundColor: '#ffeeee' }}>
                    <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                        不正なリクエストが行われました。最初からやり直してください。
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
                                        value="契約書ファイル取得処理"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                    <TextField
                                        label="エラーコード"
                                        value="404"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                    <TextField
                                        label="エラーメッセージ"
                                        value="選択されたリソースが見つかりません。正しいURLが入力されている事を確認してください。"
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle}
                                        disabled={true}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <HoverButton text='閉じる' variant='contained' color='primary' handleClick={redirectTopPage} />
                    </Box>
                </Box>
            </Modal >
        </>
    );
};

export default ClientSideErrorDialog;