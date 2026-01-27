import { CircularProgress } from '@mui/material';
import React from 'react';
import Dialog, { modalContentStyle, modalStyle } from "./Dialog";

const NowLoading: React.FC = () => {
    return (
        <div>
            <Dialog />
            <div style={modalStyle}>
                <div style={modalContentStyle}>
                    <p>Now Loading...</p>
                    <CircularProgress />
                </div>
            </div>
        </div>
    );
}

export default NowLoading;