import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useEffect } from 'react';

export const approveStartDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    minHeight: '40%',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};


interface ErrorDialogProps {
    open: boolean;
    handleClose: () => void;
}

const SuccessDialog: React.FC<ErrorDialogProps> = ({ open, handleClose }) => {

    return (
        <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={approveStartDialogStyle}>
                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '50px' }}>
                    成功しました
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '50px' }}>
                    <CheckCircleIcon sx={{ fontSize: 150, color: 'green' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Button variant='contained' size='large' sx={{ width: '10rem' }} onClick={handleClose}>閉じる</Button>
                </Box>
            </Box>
        </Modal>
    );
};

interface ErrorDialogWithModalDialogProps {
    open: boolean;
    handleClose: () => void;
    handleCloseModalDialog: () => void;
}

export const SettingsSuccessDialog: React.FC<ErrorDialogWithModalDialogProps> = ({ open, handleClose, handleCloseModalDialog }) => {

    const CloseDialog = () => {
        handleClose();
        handleCloseModalDialog();
    };

    return (
        <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={approveStartDialogStyle}>
                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '50px' }}>
                    成功しました
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '50px' }}>
                    <CheckCircleIcon sx={{ fontSize: 150, color: 'green' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Button variant='contained' size='large' sx={{ width: '10rem' }} onClick={CloseDialog}>閉じる</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export const AutoCloseSuccessDialog: React.FC<{ open: boolean; handleClose: () => void; handleCloseModalDialog: () => void }> = ({ open, handleClose, handleCloseModalDialog }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                handleCloseModalDialog();
                handleClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [open, handleClose, handleCloseModalDialog]);

    return (
        <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={approveStartDialogStyle}>
                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginBottom: '50px' }}>
                    成功しました
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '50px' }}>
                    <CheckCircleIcon sx={{ fontSize: 150, color: 'green' }} />
                </Box>
            </Box>
        </Modal>
    );
};

export default SuccessDialog;