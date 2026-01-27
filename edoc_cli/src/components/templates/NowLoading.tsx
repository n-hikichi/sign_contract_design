import { CircularProgress } from '@mui/material';
import React from 'react';

export const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey', // 背景色を変更
    zIndex: 9999,
  };
  
export const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px 40px',
    borderRadius: '4px',
    textAlign: 'center',
  };

const NowLoading: React.FC = () => {
    return (
        <div>
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