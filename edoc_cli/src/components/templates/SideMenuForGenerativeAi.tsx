import { ChevronLeft, Description, Group, Menu } from '@mui/icons-material';
import CottageIcon from '@mui/icons-material/Cottage';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotStartedIcon from '@mui/icons-material/NotStarted';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import api from "../../utils/apiAccessor";
import { getUserData, getUserDataForDebug } from '../../auth/login';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

// ドロワー幅の定義
const drawerWidth = 400;
const drawerWidthClosed = 50;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const Link = styled(RouterLink)({
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    width: '100%',
    borderBottom: '1px solid lightgray',
    '&:hover': {
        backgroundColor: '#f5f5f5',
    },
});

const DrawerFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    width: '100%',
    position: 'relative',
    bottom: 0,
    height: '35px',
    marginBottom: '70px',
}));

const ClosedSideMenu = (props: any) => {
    return (
        <Drawer
            sx={{
                width: drawerWidthClosed,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidthClosed,
                    top: 64,
                    zIndex: 0,
                }
            }}
            variant="persistent"
            anchor="left"
            open={true}
            PaperProps={{
                sx: {
                    borderRight: '1px solid grey',
                    zIndex: 0,
                }
            }}
        >
            <IconButton
                onClick={() => props.setIsOpen(true)}
                sx={{
                    backgroundColor: 'transparent', // 背景を透明に設定
                    '&:hover': {
                        backgroundColor: 'transparent', // hover時も背景を透明に設定
                    },
                }}
            >
                <Menu fontSize='large' />
            </IconButton>
        </Drawer>
    );
}

type DocumentCount = {
    before_flow: number;
    in_internal_flow: number;
    in_customer_flow: number;
};

const OpenedSideMenu: any = (props: any) => {
    const location = useLocation();

    const [loginUser, setLoginUser] = useState('');
    // 契約書idに対する契約書情報
    const [agreement_Data, setAgreement_Data] = useState<DocumentCount>();

    // isOpenが変更されたら、その値をlocalStorageに保存する
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [agreement] = await Promise.all([
                    fetchGetAgreement()
                ]);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
            }
        };

        // 契約書情報を取得する
        async function fetchGetAgreement() {
            try {
                const res = await api.getAgreementCount();
                if (res.status !== api.HTTP_OK) {
                    console.log("API(api.getAgreement()) response failed. HTTP Status: " + res.status);
                }

                // 取得したユーザー情報を設定する
                const json = await res.json();
                setAgreement_Data(json);
            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);
            }
        };

        fetchData();
        // ログインユーザーの情報を取得する
        setLoginUser(getUserData());
    }, []);

    const getLinkStyle = (paths: string[]) => {
        const currentPath = window.location.pathname;
        const isActive = paths.includes(currentPath);

        return {
            color: isActive ? 'white' : '#0D47A1',
            backgroundColor: isActive ? '#0D47A1' : 'white',
            '&:hover': {
                backgroundColor: isActive ? '#0D47A1' : '#F4F4F4'
            }
        };
    };

    const getLinkStyleForSettings = (paths: string[]) => {
        const currentPath = window.location.pathname;
        const isActive = paths.includes(currentPath);

        return {
            color: isActive ? 'white' : 'darkgreen',
            backgroundColor: isActive ? 'darkgreen' : 'white',
            '&:hover': {
                backgroundColor: isActive ? 'darkgreen' : '#F4F4F4'
            }
        };
    };

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                top: 64,
                flexShrink: 0,
                zIndex: 0,
            }}
            variant="persistent"
            anchor="left"
            open={true}
            PaperProps={{
                sx: {
                    width: drawerWidth,
                    top: 64,
                    borderRight: '1px solid grey',
                    zIndex: 0,
                }
            }}
        >
            <DrawerHeader onClick={() => props.setIsOpen(false)} sx={{ cursor: 'pointer' }}>
                <IconButton
                    sx={{
                        backgroundColor: 'transparent', // 背景を透明に設定
                        '&:hover': {
                            backgroundColor: 'transparent', // hover時も背景を透明に設定
                        },
                    }}
                >
                    <ChevronLeft />
                </IconButton>
            </DrawerHeader>
            <Divider />
            <Box sx={{ height: 'calc(100vh - 130px)', overflow: 'auto' }}>
                <List>
                    <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px' }}>
                        <Typography component="div" fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: '#0D47A1' }}></Typography>
                        <Typography component="div">
                            <Link to='/'>
                                <ListItem key='ダッシュボードへ戻る' sx={getLinkStyle(['/'])}>
                                    <ListItemIcon><KeyboardReturnIcon sx={{ color: getLinkStyle(['/']).color }} /></ListItemIcon>
                                    <ListItemText primary='ダッシュボードへ戻る' sx={{ color: getLinkStyle(['/']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                        </Typography>
                    </Box>
                    {/* <Link to='https://d4jk84il5lb86.cloudfront.net/use-case-builder/execute/d56d1304-9b52-4945-bbb7-e561f7aa0ab2' target="_blank" rel="noopener noreferrer">
                                <ListItem key='文書管理（生成AI）' sx={getLinkStyle(['/documentManagement/register_'])}>
                                    <ListItemIcon><UploadFileIcon sx={{ color: getLinkStyle(['/documentManagement/register_']).color }} /></ListItemIcon>
                                    <ListItemText primary='文書管理（生成AI）' sx={{ color: getLinkStyle(['/documentManagement/register_']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link> */}
                    {/* 不要 */}
                    {/* <Link to='https://d4jk84il5lb86.cloudfront.net/chat' target="_blank" rel="noopener noreferrer">
                                <ListItem key='生成AI連携（チャット）' sx={getLinkStyle(['/documentManagement/conclusionDocument'])}>
                                    <ListItemIcon><Description sx={{ color: getLinkStyle(['/documentManagement/conclusionDocument']).color }} /></ListItemIcon>
                                    <ListItemText primary='生成AI連携（チャット）' sx={{ color: getLinkStyle(['/documentManagement/conclusionDocument']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='https://d4jk84il5lb86.cloudfront.net/generate' target="_blank" rel="noopener noreferrer">
                                <ListItem key='生成AI連携（文章生成）' sx={getLinkStyle(['/documentManagement/conclusionDocument'])}>
                                    <ListItemIcon><Description sx={{ color: getLinkStyle(['/documentManagement/conclusionDocument']).color }} /></ListItemIcon>
                                    <ListItemText primary='生成AI連携（文章生成）' sx={{ color: getLinkStyle(['/documentManagement/conclusionDocument']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='https://d4jk84il5lb86.cloudfront.net/use-case-builder/execute/d56d1304-9b52-4945-bbb7-e561f7aa0ab2' target="_blank" rel="noopener noreferrer">
                                <ListItem key='生成AI連携（リーガルチェック）' sx={getLinkStyle(['/documentManagement/conclusionDocument'])}>
                                    <ListItemIcon><Description sx={{ color: getLinkStyle(['/documentManagement/conclusionDocument']).color }} /></ListItemIcon>
                                    <ListItemText primary='生成AI連携（リーガルチェック）' sx={{ color: getLinkStyle(['/documentManagement/conclusionDocument']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link> */}
                    <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px' }}>
                        <Typography component="div" fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: '#0D47A1' }}>生成AI活用機能</Typography>
                        <Typography component="div">
                            <Link to='/generativeai/registerIt'>
                                <ListItem key='AI OCR機能' sx={getLinkStyle(['/generativeai/registerIt'])}>
                                    <ListItemIcon><UploadFileIcon sx={{ color: getLinkStyle(['/generativeai/registerIt']).color }} /></ListItemIcon>
                                    <ListItemText primary='AI OCR機能' sx={{ color: getLinkStyle(['/generativeai/registerIt']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='/generativeai/registerIt/makeAgreementTemplate'>
                                <ListItem key='契約書テンプレート作成支援機能' sx={getLinkStyle(['/generativeai/registerIt/makeAgreementTemplate'])}>
                                    <ListItemIcon><UploadFileIcon sx={{ color: getLinkStyle(['/generativeai/registerIt/makeAgreementTemplate']).color }} /></ListItemIcon>
                                    <ListItemText primary='契約書テンプレート作成支援機能' sx={{ color: getLinkStyle(['/generativeai/registerIt/makeAgreementTemplate']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='/generativeai/registerIt/reviewAgreement'>
                                <ListItem key='契約書レビュー支援機能' sx={getLinkStyle(['/generativeai/registerIt/reviewAgreement'])}>
                                    <ListItemIcon><NotStartedIcon sx={{ color: getLinkStyle(['/generativeai/registerIt/reviewAgreement']).color }} /></ListItemIcon>
                                    <ListItemText primary='契約書レビュー支援機能' sx={{ color: getLinkStyle(['/generativeai/registerIt/reviewAgreement']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='/generativeai/registerIt/agreementDetails'>
                                <ListItem key='契約内容(期限など)確認機能' sx={getLinkStyle(['/generativeai/registerIt/agreementDetails'])}>
                                    <ListItemIcon><PendingIcon sx={{ color: getLinkStyle(['/generativeai/registerIt/agreementDetails']).color }} /></ListItemIcon>
                                    <ListItemText primary='契約内容(期限など)確認機能' sx={{ color: getLinkStyle(['/generativeai/registerIt/agreementDetails']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            {/* <Link to='/documentManagement/internalDocument'>
                                <ListItem key='差戻し／URL再発行依頼（社内）' sx={getLinkStyle(['/documentManagement/internalDocument'])}>
                                    <ListItemIcon><PendingIcon sx={{ color: getLinkStyle(['/documentManagement/internalDocument']).color }} /></ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between" width="100%">
                                                <span>差戻し依頼（社内）</span>
                                                <span style={{ color: 'red', backgroundColor: 'white', paddingLeft: '7px', paddingRight: '7px' }}>{agreement_Data?.in_internal_flow ?? ''}</span>
                                            </Box>
                                        }
                                        sx={{ color: getLinkStyle(['/documentManagement/internalDocument']).color }}
                                        primaryTypographyProps={{ fontWeight: 'bold' }}
                                    />
                                </ListItem>
                            </Link> */}
                            <Link to='/generativeai/registerIt/differenceConfirmation'>
                                <ListItem key='差分確認機能' sx={getLinkStyle(['/generativeai/registerIt/differenceConfirmation'])}>
                                    <ListItemIcon><PendingIcon sx={{ color: getLinkStyle(['/generativeai/registerIt/differenceConfirmation']).color }} /></ListItemIcon>
                                    <ListItemText primary='差分確認機能' sx={{ color: getLinkStyle(['/generativeai/registerIt/differenceConfirmation']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            {/* <Link to='/documentManagement/internalDocument'>
                                <ListItem key='差戻し／URL再発行依頼（社内）' sx={getLinkStyle(['/documentManagement/internalDocument'])}>
                                    <ListItemIcon><PendingIcon sx={{ color: getLinkStyle(['/documentManagement/internalDocument']).color }} /></ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between" width="100%">
                                                <span>差戻し依頼（相手方）</span>
                                                <span style={{ color: 'red', backgroundColor: 'white', paddingLeft: '7px', paddingRight: '7px' }}>{agreement_Data?.in_internal_flow ?? ''}</span>
                                            </Box>
                                        }
                                        sx={{ color: getLinkStyle(['/documentManagement/internalDocument']).color }}
                                        primaryTypographyProps={{ fontWeight: 'bold' }}
                                    />
                                </ListItem>
                            </Link> */}
                        </Typography>
                    </Box>
                    <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '30px' }}>
                        <Typography component="div" fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: 'darkgreen' }}>開発中機能（ベータ版）</Typography>
                        <Typography component="div">
                            <Link to='/develop/makeWorkload'>
                                <ListItem key='ワークロード作成' sx={getLinkStyleForSettings(['/develop/makeWorkload'])}>
                                    <ListItemIcon><PersonIcon sx={{ color: getLinkStyleForSettings(['/develop/makeWorkload']).color }} /></ListItemIcon>
                                    <ListItemText primary='ワークロード作成' sx={{ color: getLinkStyleForSettings(['/develop/makeWorkload']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='/develop/makeSeal'>
                                <ListItem key='印影作成' sx={getLinkStyleForSettings(['/develop/makeSeal'])}>
                                    <ListItemIcon><Group sx={{ color: getLinkStyleForSettings(['/develop/makeSeal']).color }} /></ListItemIcon>
                                    <ListItemText primary='印影作成' sx={{ color: getLinkStyleForSettings(['/develop/makeSeal']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='/develop/mail'>
                                <ListItem key='メール画面' sx={getLinkStyleForSettings(['/develop/mail'])}>
                                    <ListItemIcon><Group sx={{ color: getLinkStyleForSettings(['/develop/mail']).color }} /></ListItemIcon>
                                    <ListItemText primary='メール画面' sx={{ color: getLinkStyleForSettings(['/develop/mail']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                        </Typography>
                    </Box>
                    {/* <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '30px' }}>
                        <Typography component="div" fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: '#0D47A1' }}>管理機能</Typography>
                        <Typography component="div">
                            <Link to='https://d4jk84il5lb86.cloudfront.net/use-case-builder/execute/1ee7aaa1-5d14-4cca-a580-6d62ce1a28f7' target="_blank" rel="noopener noreferrer">
                                <ListItem key='ワークフロー管理' sx={getLinkStyle(['/manage/template'])}>
                                    <ListItemIcon><PersonIcon sx={{ color: getLinkStyle(['/manage/template']).color }} /></ListItemIcon>
                                    <ListItemText primary='ワークフロー管理' sx={{ color: getLinkStyle(['/manage/template']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='https://d4jk84il5lb86.cloudfront.net/use-case-builder/execute/1ee7aaa1-5d14-4cca-a580-6d62ce1a28f7' target="_blank" rel="noopener noreferrer">
                                <ListItem key='契約書テンプレート（生成AI）' sx={getLinkStyle(['/manage/template'])}>
                                    <ListItemIcon><PersonIcon sx={{ color: getLinkStyle(['/manage/template']).color }} /></ListItemIcon>
                                    <ListItemText primary='契約書テンプレート（生成AI）' sx={{ color: getLinkStyle(['/manage/template']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='https://d4jk84il5lb86.cloudfront.net/use-case-builder/execute/ddb0b1de-e6bb-42e7-852d-eae682abfe0a' target="_blank" rel="noopener noreferrer">
                                <ListItem key='差分チェック（生成AI）' sx={getLinkStyle(['/manage/template'])}>
                                    <ListItemIcon><PersonIcon sx={{ color: getLinkStyle(['/manage/template']).color }} /></ListItemIcon>
                                    <ListItemText primary='差分チェック（生成AI）' sx={{ color: getLinkStyle(['/manage/template']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='https://micbot.azurewebsites.net/ja' target="_blank" rel="noopener noreferrer">
                                <ListItem key='MIC Bot連携' sx={getLinkStyle(['/documentManagement/micbot'])}>
                                    <ListItemIcon><Description sx={{ color: getLinkStyle(['/documentManagement/micbot']).color }} /></ListItemIcon>
                                    <ListItemText primary='MIC Bot連携' sx={{ color: getLinkStyle(['/documentManagement/micbot']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='https://d4jk84il5lb86.cloudfront.net/' target="_blank" rel="noopener noreferrer">
                                <ListItem key='AIアシスタント（生成AI）' sx={getLinkStyle(['/documentManagement/aiassistant'])}>
                                    <ListItemIcon><Description sx={{ color: getLinkStyle(['/documentManagement/aiassistant']).color }} /></ListItemIcon>
                                    <ListItemText primary='AIアシスタント（生成AI）' sx={{ color: getLinkStyle(['/documentManagement/aiassistant']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                        </Typography>
                    </Box> */}
                    {/* ゲストユーザー向け画面のデバッグ用：開発者機能 */}
                    {/* <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px' }}>
                        <Typography component="div" fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: '#0D47A1' }}>開発者機能</Typography>
                        <Typography component="div">
                            <Link to='/develop/terms/0fb235c5-0ca2-47dc-a51c-6f1b1beaba74'>
                                <ListItem key='利用規約（承認依頼）' sx={getLinkStyle(['/develop/terms/0fb235c5-0ca2-47dc-a51c-6f1b1beaba74'])}>
                                    <ListItemIcon><UploadFileIcon sx={{ color: getLinkStyle(['/develop/terms/0fb235c5-0ca2-47dc-a51c-6f1b1beaba74']).color }} /></ListItemIcon>
                                    <ListItemText primary='利用規約（承認依頼）' sx={{ color: getLinkStyle(['/develop/terms/0fb235c5-0ca2-47dc-a51c-6f1b1beaba74']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='/develop/terms/2bc3b33f-b95e-336e-8215-46bf6965f7f1'>
                                <ListItem key='利用規約（契約締結）' sx={getLinkStyle(['/develop/terms/2bc3b33f-b95e-336e-8215-46bf6965f7f1'])}>
                                    <ListItemIcon><UploadFileIcon sx={{ color: getLinkStyle(['/develop/terms/2bc3b33f-b95e-336e-8215-46bf6965f7f1']).color }} /></ListItemIcon>
                                    <ListItemText primary='利用規約（契約締結）' sx={{ color: getLinkStyle(['/develop/terms/2bc3b33f-b95e-336e-8215-46bf6965f7f1']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                            <Link to='/develop/mailBoxGuest'>
                                <ListItem key='メールボックス' sx={getLinkStyle(['/develop/mailBoxGuest'])}>
                                    <ListItemIcon><UploadFileIcon sx={{ color: getLinkStyle(['/develop/mailBoxGuest']).color }} /></ListItemIcon>
                                    <ListItemText primary='メールボックス' sx={{ color: getLinkStyle(['/develop/mailBoxGuest']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                        </Typography>
                    </Box> */}
                </List>
            </Box>
            <DrawerFooter />
        </Drawer >
    );
}

const SideMenuForGenerativeAi: any = () => {

    // localStorageからオープン状態を読み込み、なければtrue（表示）を初期値とする
    const [isOpen, setIsOpen] = useState(() => {
        const savedIsOpen = localStorage.getItem('sideMenuIsOpen');
        return savedIsOpen ? JSON.parse(savedIsOpen) : true;
    });

    // isOpenが変更されたら、その値をlocalStorageに保存する
    useEffect(() => {
        localStorage.setItem('sideMenuIsOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    return (
        isOpen ?
            <OpenedSideMenu setIsOpen={setIsOpen} /> :
            <ClosedSideMenu setIsOpen={setIsOpen} />
    );
}

export default SideMenuForGenerativeAi;