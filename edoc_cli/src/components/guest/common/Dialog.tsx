import { basePageStyle } from './Styles';
import Box from '@mui/material/Box';
import Footer from './Footer';
import Header from './Header';

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
    zIndex: 9999,
  };
  
export const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px 40px',
    borderRadius: '4px',
    textAlign: 'center',
  };

const Dialog: any = () => {

    return (
        <>
            <Box sx={{ ...basePageStyle }}>
                <Header />
            </Box>
            <Footer />
        </>
    );
};

export default Dialog;