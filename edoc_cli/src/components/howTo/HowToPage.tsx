import { Box, CssBaseline } from '@mui/material';
import { baseContentsStyle } from '../../styles/styles';

/**
 * 処理が完了（契約締結済み／破棄）している契約書情報を扱うページ
 * @param props 
 * @returns 
 */
const HowToPage = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
                <embed src="/manual.pdf" type="application/pdf" width="100%" height="100%" />
            </Box>
        </Box>
    );
}

export default HowToPage;