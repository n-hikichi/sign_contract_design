import { Link, Typography } from "@mui/material";
import React from 'react';
import ModernFooter from './ModernFooter';

/**
 * 
 * フッターコンポーネント
 * ログイン中のフッターとして表示する
 * 
 */
const Footer: React.FC = () => {
    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        window.open('/documentManagement/howToPage', '_blank', 'noopener');
    };

    return (
        <footer style={{
            color: 'white',
            backgroundColor: '#002060',
            position: 'relative',
            bottom: 0,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
        }}>
            <Typography sx={{ fontSize: '11px', marginRight: '10px' }}>
                <Link onClick={handleLinkClick} sx={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', '&:hover': { color: 'orange' } }}>
                    ブロックチェーン電子契約利用マニュアル
                </Link>
            </Typography>
            <Typography sx={{ fontSize: '15px', marginRight: '10px', fontWeight: 'bold' }}>|</Typography>
            <Typography sx={{ fontSize: '11px', marginRight: '10px' }}>
                <Link href="https://www.micros.co.jp/privacy.html" target="_blank" rel="noopener" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'orange' } }}>
                    個人情報の取り扱い
                </Link>
            </Typography>
            <Typography sx={{ fontSize: '15px', marginRight: '10px', fontWeight: 'bold' }}>|</Typography>
            <Typography sx={{ fontSize: '11px', marginRight: '10px' }}>
                <Link href="https://www.micros.co.jp/service.html" target="_blank" rel="noopener" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'orange' } }}>
                    サービス利用規約
                </Link>
            </Typography>
            <Typography sx={{ fontSize: '15px', marginRight: '10px', fontWeight: 'bold' }}>|</Typography>
            <Typography sx={{ fontSize: '11px', marginRight: '40px' }}>
                Copyright © 2025, MICROS SOFTWARE, Inc. All Rights Reserved.
            </Typography>
        </footer>
    )
};

// モダナイズ版フッターを使用
// 旧版に戻す場合は下記を `export default Footer;` に変更
export default ModernFooter;
// export default Footer;