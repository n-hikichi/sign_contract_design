import { Link, Typography } from "@mui/material";

/**
 * フッターコンポーネント
 * 会社名を表示する
 * @returns  
 */
const Footer: React.FC = () => {
    return (
        <footer style={{ 
            color: 'white', 
            backgroundColor: '#002060', 
            position: 'relative', 
            bottom: 0, 
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Typography sx={{ fontSize: '11px' }}>
                Copyright © 2025, MICROS SOFTWARE, Inc. All Rights Reserved.
            </Typography>
        </footer>
    )
};

export default Footer;