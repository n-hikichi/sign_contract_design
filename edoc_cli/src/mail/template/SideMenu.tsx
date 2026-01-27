import { ChevronLeft, Description, Group, Menu } from '@mui/icons-material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CottageIcon from '@mui/icons-material/Cottage';
import MailIcon from '@mui/icons-material/Mail';
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
import MailOutlineIcon from '@mui/icons-material/MailOutline';


// ドロワー幅の定義
const drawerWidth = 300;

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

type DocumentCount = {
    before_flow: number;
    in_internal_flow: number;
    in_customer_flow: number;
};

const OpenedSideMenu: any = (props: any) => {
    const location = useLocation();

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

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                top: 64,
                flexShrink: 0,
            }}
            variant="persistent"
            anchor="left"
            open={true}
            PaperProps={{
                sx: {
                    width: drawerWidth,
                    top: 64,
                    borderRight: '1px solid #0D47A1',
                }
            }}
        >
            <Divider />
            <Box sx={{ height: 'calc(100vh - 130px)', overflow: 'auto' }}>
                <List>
                    <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px' }}>
                        <Typography fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: '#0D47A1' }}>　</Typography>
                        <Typography>
                            <Link to='/'>
                                <ListItem key='ダッシュボード' sx={getLinkStyle(['/'])}>
                                    <ListItemIcon><CottageIcon sx={{ color: getLinkStyle(['/']).color }} /></ListItemIcon>
                                    <ListItemText primary='ダッシュボード' sx={{ color: getLinkStyle(['/']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                        </Typography>
                    </Box>
                    <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px' }}>
                        <Typography fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: '#0D47A1' }}>山本 和彦</Typography>
                        <Typography>
                            <Link to='/develop/mailBox'>
                                <ListItem key='受信トレイ' sx={getLinkStyle(['/develop/mailBox'])}>
                                    <ListItemIcon><MailOutlineIcon sx={{ color: getLinkStyle(['/develop/mailBox']).color }} /></ListItemIcon>
                                    <ListItemText primary='受信トレイ' sx={{ color: getLinkStyle(['/develop/mailBox']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                        </Typography>
                    </Box>
                    <Box sx={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '30px' }}>
                        <Typography fontWeight="bold" fontSize="1.3em" sx={{ borderBottom: '2px solid black', color: '#0D47A1' }}>ゲストアカウント</Typography>
                        <Typography>
                            <Link to='/develop/mailBoxGuest'>
                                <ListItem key='受信トレイ' sx={getLinkStyle(['/develop/mailBoxGuest'])}>
                                    <ListItemIcon><MailOutlineIcon sx={{ color: getLinkStyle(['/develop/mailBoxGuest']).color }} /></ListItemIcon>
                                    <ListItemText primary='受信トレイ' sx={{ color: getLinkStyle(['/develop/mailBoxGuest']).color }} primaryTypographyProps={{ fontWeight: 'bold' }} />
                                </ListItem>
                            </Link>
                        </Typography>
                    </Box>
                </List>
            </Box>
        </Drawer >
    );
}

const SideMenu: any = () => {

    // localStorageからオープン状態を読み込み、なければfalseを初期値とする
    const [isOpen, setIsOpen] = useState(() => {
        const savedIsOpen = localStorage.getItem('sideMenuIsOpen');
        return savedIsOpen ? JSON.parse(savedIsOpen) : false;
    });

    // isOpenが変更されたら、その値をlocalStorageに保存する
    useEffect(() => {
        localStorage.setItem('sideMenuIsOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    return (
        <OpenedSideMenu setIsOpen={setIsOpen} />
    );
}

export default SideMenu;