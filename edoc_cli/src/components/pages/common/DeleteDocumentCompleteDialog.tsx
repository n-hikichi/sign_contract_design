import { Box, Button, Grid, Modal, TextField } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { basePageStyle, deleteModalStyle } from '../../../styles/styles';
import converter from '../../../utils/converter';
import EdocButton from "../../elements/EdocButton";
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * 契約書の破棄完了画面のコンポーネント
 */
const DeleteDocumentCompleteDialog = () => {
    const location = useLocation();
    const { selectedInfo, deleteResponse, flowStatus, approveFlowData } = location.state;

    const navigate = useNavigate();

    const status = flowStatus?.includes('INTERNAL') ? '社内承認リストに戻る' : '相手方承認リストに戻る';
    const redirectTarget = flowStatus?.includes('INTERNAL') ? 'internalDocument' : 'customerDocument';

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);
    }, []);

    // チェックボックスの状態を管理する
    const [isReregisterChecked, setIsReregisterChecked] = useState(false);

    // チェックボックスの状態を更新する
    const handleReregisterCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsReregisterChecked(event.target.checked);
    };

    /***
     * 
     * 契約書破棄要求
     * ※「自社担当者」権限を持つ人だけ操作出来る
     * 
     */
    // 破棄確認ダイアログの開閉状態
    const [createNewDocumentDialogOpen, setCreateNewDocumentDialogOpen] = useState(false);
    const handleCreateNewDocumentDialogClose = () => setCreateNewDocumentDialogOpen(false);

    // ダイアログを開く関数
    const createNewDocument = () => {
        setCreateNewDocumentDialogOpen(true);
    };

    // 契約書の削除要求
    const onCreateDocumet = async (operation: string) => {
        try {
            if (operation === 'newDocument') { // 新規登録

                navigate('/documentManagement/register');
            } else if (operation === 'reUseDocument') { // 破棄したデータを再利用する

                const internalCompanyData = selectedInfo.own_company;
                const customerCompanyData = selectedInfo.customer_company;

                navigate('/documentManagement/internalDocument/deleteAndRegisterDocument', { state: { selectedInfo, internalCompanyData, customerCompanyData, approveFlowData } });
            };
        } catch (error) {
            console.log("An unexpected error has occurred.");
        }
    };

    return (
        <>
            <Box sx={{ bgcolor: '#ffeeee', height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <CssBaseline />
                    <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '10%', paddingRight: '10%', width: '100%' }} px={4}>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '30px', marginBottom: '20px' }}>
                            <Typography sx={{ backgroundColor: 'darkred', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em' }}>
                                契約書を破棄しました
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, marginBottom: '40px', border: '1px solid lightgray' }}>
                            <Box bgcolor="white" sx={{ flexGrow: 1, padding: '30px', paddingTop: '60px' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                    <Box sx={{ width: '100%', marginBottom: '40px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={selectedInfo.title}
                                                label="件名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={selectedInfo.type}
                                                label="契約種別"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={`${selectedInfo.internal_pic.company_name}　${selectedInfo.internal_pic.user_name}`}
                                                label="自社担当者"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                value={`${selectedInfo.customer_pic.company_name}  ${selectedInfo.customer_pic.user_name}`}
                                                label="相手方担当者"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' } }}>
                                            <TextField
                                                value={converter.dateConverter_fromISO8601(deleteResponse.deleted_time)}
                                                label="受付時刻"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'end', width: '100%', fontSize: '15em', marginBottom: '20px' }}>
                            <Button variant="contained" color="primary" sx={{ width: '15em', height: '50px', '&:hover': { backgroundColor: 'darkblue' }, marginRight: '10px' }} onClick={() => navigate(`/documentManagement/${redirectTarget}`)}>{status}</Button>
                            <Button variant="contained" color="primary" sx={{ width: '15em', height: '50px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(createNewDocument)}>契約書を作成する</Button>
                        </Box>
                    </Box>
                </Box>
            </Box >
            <Footer />
            {/* 契約書新規登録確認ダイアログ */}
            <div>
                <Modal
                    open={createNewDocumentDialogOpen}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{ ...deleteModalStyle, backgroundColor: '#eeffee' }} >
                        <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '20px' }}>
                            登録方法を選択してください
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', backgroundColor: 'white', paddingTop: '40px', paddingBottom: '40px' }}>
                            <WarningIcon sx={{ color: 'darkorange', fontSize: '4em', textAlign: 'center' }} />
                            <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '1.5em' }}>
                                「破棄データから作成する」を選択すると、破棄した契約書情報を引き継いで作成できます。
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant="contained" color="success" sx={{ width: '15em', height: '40px', '&:hover': { backgroundColor: 'darkgreen' }, marginRight: '10px' }} onClick={() => onCreateDocumet('newDocument')}>新規作成する</Button>
                            <Button variant="contained" color="success" sx={{ width: '15em', height: '40px', '&:hover': { backgroundColor: 'darkgreen' }, marginRight: '10px' }} onClick={() => onCreateDocumet('reUseDocument')}>破棄データから作成する</Button>
                            <Button variant="contained" color="primary" sx={{ width: '15em', height: '40px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={(handleCreateNewDocumentDialogClose)}>キャンセル</Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        </>
    );
};

export default DeleteDocumentCompleteDialog;