import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, MenuItem, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import converter from "../../utils/converter";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

// ドロワー幅の定義
const drawerWidth = "30%";
const drawerWidthClosed = "10%";
const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-between',
}));

const DrawerFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    width: '100%',
    position: 'relative',
    bottom: 0,
    height: '100px'
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
                    borderRight: '1px solid #000',
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
                <MenuItem
                    sx={{
                        border: '1px solid #000',
                        borderRadius: '4px',
                        marginTop: '10px',
                        '&:hover': {
                            backgroundColor: '#f0f0f0', // マウスオーバー時の背景色
                            borderColor: 'darkblue', // マウスオーバー時のボーダー色
                            color: 'darkblue', // マウスオーバー時の文字色
                        },
                    }}
                >承認履歴</MenuItem>
            </IconButton>
        </Drawer>
    );
}

const OpenedSideMenu: any = (props: any) => {

    const [isInternalApproveListOpen, setIsInternalApproveListOpen] = useState(false);
    const [isCustomerApproveListOpen, setIsCustomerApproveListOpen] = useState(true);
    const [isNotificationListOpen, setIsNotificationListOpen] = useState(false);

    // 承認履歴（ユーザー）情報
    const [approveHistory, setApproveHistory] = useState({
        agreement_id: '',
        title: '',
        internal_pic: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
        internal_approver: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
        internal_authorizer: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
        internal_notifier: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
        customer_pic: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
        customer_approver: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
        customer_authorizer: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
        customer_notifier: {
            approved_time: '',
            company_name: '',
            user_name: '',
            email: '',
            approved: false,
        },
    });

    useEffect(() => {
        setApproveHistory(props.approveHistory.approveHistory);
    }, [props.approveHistory.approveHistory]);

    // 自社承認履歴
    const setIsInternalApproveListStatusChange = () => {
        setIsInternalApproveListOpen(!isInternalApproveListOpen);
    };

    // 相手方承認履歴
    const setIsCustomerApproveListStatusChange = () => {
        setIsCustomerApproveListOpen(!isCustomerApproveListOpen);
    };

    // 通知先リスト
    const setIsNotificationListStatusChange = () => {
        setIsNotificationListOpen(!isNotificationListOpen);
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
                    zIndex: 0,
                }
            }}
        >
            <DrawerHeader onClick={() => props.setIsOpen(false)}>
                <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', width: '90%', marginLeft: '4%' }}>
                    <h3>この書類の承認履歴</h3>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '10%' }}>
                    <ChevronLeft />
                </Box>
            </DrawerHeader>
            <Divider />
            <Box sx={{ overflow: 'auto', width: '100%' }}>
                {/* <DrawerHeader onClick={setIsInternalApproveListStatusChange}>
                    {isInternalApproveListOpen ? <ExpandMoreIcon /> : <ChevronRight />}
                    <h3>{approveHistory.internal_pic?.company_name}</h3>
                </DrawerHeader>
                <Divider />
                {isInternalApproveListOpen && (
                    <>
                        <Box sx={{ width: '100%' }}>
                            <Typography>
                                <Box sx={{ width: '100%' }}>
                                    <Accordion sx={{ borderBottom: '1px solid lightgray' }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, cursor: 'default', '&:hover': { backgroundColor: 'inherit' }, '&:active': { backgroundColor: 'inherit' } }} disableRipple >
                                                <ListItemIcon>
                                                    {
                                                        (approveHistory.internal_pic.approved)
                                                            ? <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: '#1565c0' }} />
                                                            : <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: 'grey' }} />
                                                    }
                                                </ListItemIcon>
                                                <Box display="flex" sx={{ width: '100%' }}>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Typography>{approveHistory.internal_pic.user_name}</Typography>
                                                    </Box>
                                                </Box>
                                            </MenuItem>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ width: '100%' }}>
                                            <Typography>
                                                <ListItem key='メールアドレス' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                    <ListItemText primary={`メールアドレス：${approveHistory.internal_pic.email}`} />
                                                </ListItem>
                                                <ListItem key='署名日時' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                    <ListItemText primary={`登録日時　　　：${converter.dateConverter_fromISO8601(approveHistory.internal_pic.approved_time)}`} />
                                                </ListItem>
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                                {Array.isArray(approveHistory.internal_approver) && approveHistory.internal_approver.map((approver, index) => (
                                    <Box sx={{ width: '100%' }}>
                                        <Accordion sx={{ borderBottom: '1px solid lightgray' }}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                            >
                                                <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, cursor: 'default', '&:hover': { backgroundColor: 'inherit' }, '&:active': { backgroundColor: 'inherit' } }} disableRipple >
                                                    <ListItemIcon>
                                                        {
                                                            approver.approved
                                                                ? <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: '#1565c0' }} />
                                                                : <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: 'grey' }} />
                                                        }
                                                    </ListItemIcon>
                                                    <Box display="flex" sx={{ width: '100%' }}>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Typography>{approver.user_name}</Typography>
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ width: '100%' }}>
                                                <Typography>
                                                    <ListItem key='メールアドレス' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                        <ListItemText primary={`メールアドレス：${approver.email}`} />
                                                    </ListItem>
                                                    <ListItem key='署名日時' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                        <ListItemText primary={`署名日時　　　：${converter.dateConverter_fromISO8601(approver.approved_time)}`} />
                                                    </ListItem>
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Box>
                                ))}
                                <Box sx={{ width: '100%' }}>
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, cursor: 'default', '&:hover': { backgroundColor: 'inherit' }, '&:active': { backgroundColor: 'inherit' } }} disableRipple >
                                                <ListItemIcon>
                                                    {
                                                        (approveHistory.internal_authorizer.approved)
                                                            ? <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: '#1565c0' }} />
                                                            : <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: 'grey' }} />
                                                    }
                                                </ListItemIcon>
                                                <Box display="flex" sx={{ width: '100%' }}>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Typography>{approveHistory.internal_authorizer.user_name}</Typography>
                                                    </Box>
                                                </Box>
                                            </MenuItem>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ width: '100%' }}>
                                            <Typography>
                                                <ListItem key='メールアドレス' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                    <ListItemText primary={`メールアドレス：${approveHistory.internal_authorizer.email}`} />
                                                </ListItem>
                                                <ListItem key='署名日時' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                    <ListItemText primary={`署名日時　　　：${converter.dateConverter_fromISO8601(approveHistory.internal_authorizer.approved_time)}`} />
                                                </ListItem>
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            </Typography>
                        </Box>
                    </>
                )} */}
                <DrawerHeader onClick={setIsCustomerApproveListStatusChange}>
                    {isCustomerApproveListOpen ? <ExpandMoreIcon /> : <ChevronRight />}
                    <h3>{approveHistory.customer_pic.company_name}</h3>
                </DrawerHeader>
                <Divider />
                {isCustomerApproveListOpen && (
                    <>
                        <Box sx={{ width: '100%' }}>
                            <Typography>
                                {Array.isArray(approveHistory.customer_approver) && approveHistory.customer_approver.map((approver, index) => (
                                    <Box sx={{ width: '100%' }}>
                                        <Accordion sx={{ borderBottom: '1px solid lightgray' }}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                            >
                                                <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, cursor: 'default', '&:hover': { backgroundColor: 'inherit' }, '&:active': { backgroundColor: 'inherit' } }} disableRipple >
                                                    <ListItemIcon>
                                                        {
                                                            approver.approved
                                                                ? <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: '#1565c0' }} />
                                                                : <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: 'grey' }} />
                                                        }
                                                    </ListItemIcon>
                                                    <Box display="flex" sx={{ width: '100%' }}>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Typography>{approver.user_name}</Typography>
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ width: '100%' }}>
                                                <Typography>
                                                    <ListItem key='メールアドレス' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                        <ListItemText primary={`メールアドレス：${approver.email}`} />
                                                    </ListItem>
                                                    <ListItem key='署名日時' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                        {approver.approved ? (
                                                            <ListItemText primary={`署名日時　　　：${converter.dateConverter_fromISO8601(approver.approved_time)}`} />
                                                        ) : (
                                                            <ListItemText primary="署名日時　　　：---" />
                                                        )}
                                                    </ListItem>
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Box>
                                ))}
                                <Box sx={{ width: '100%' }}>
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, cursor: 'default', '&:hover': { backgroundColor: 'inherit' }, '&:active': { backgroundColor: 'inherit' } }} disableRipple >
                                                <ListItemIcon>
                                                    {
                                                        (approveHistory.customer_authorizer.approved)
                                                            ? <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: '#1565c0' }} />
                                                            : <FileDownloadDoneIcon fontSize="medium" sx={{ color: 'white', bgcolor: 'grey' }} />
                                                    }
                                                </ListItemIcon>
                                                <Box display="flex" sx={{ width: '100%' }}>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Typography>{approveHistory.customer_authorizer.user_name}</Typography>
                                                    </Box>
                                                </Box>
                                            </MenuItem>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ width: '100%' }}>
                                            <Typography>
                                                <ListItem key='メールアドレス' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                    <ListItemText primary={`メールアドレス：${approveHistory.customer_authorizer.email}`} />
                                                </ListItem>
                                                <ListItem key='署名日時' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                    {approveHistory.customer_authorizer.approved ? (
                                                        <ListItemText primary={`署名日時　　　：${converter.dateConverter_fromISO8601(approveHistory.customer_authorizer.approved_time)}`} />
                                                    ) : (
                                                        <ListItemText primary="署名日時　　　：---" />
                                                    )}
                                                </ListItem>
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            </Typography>
                        </Box>
                    </>
                )}
                {Array.isArray(approveHistory.customer_notifier) && approveHistory.customer_notifier.length > 0 && (
                    <>
                        <DrawerHeader onClick={setIsNotificationListStatusChange}>
                            {isNotificationListOpen ? <ExpandMoreIcon /> : <ChevronRight />}
                            <h3>完了通知の送付先</h3>
                        </DrawerHeader>
                        <Divider />
                        {isNotificationListOpen && (
                            <Box sx={{ overflow: 'auto', width: '100%' }}>
                                {/* <Box sx={{ width: '100%', bgcolor: 'lightblue', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '2%' }}>
                                    <MenuItem sx={{ cursor: 'default', '&:hover': { backgroundColor: 'inherit' }, '&:active': { backgroundColor: 'inherit' } }} disableRipple>
                                        <Typography>{approveHistory.customer_pic?.company_name}</Typography>
                                    </MenuItem>
                                </Box> */}
                                <Box sx={{ width: '100%' }}>
                                    <>
                                        {approveHistory.customer_notifier.map((approver) => (
                                            <Box sx={{ display: 'flex', width: '100%', height: '40px', paddingLeft: '7%', borderBottom: '1px solid lightgray', alignItems: 'center' }}>
                                                <Box sx={{ width: '30%' }}>
                                                    <Typography>{approver.user_name}</Typography>
                                                </Box>
                                                <Box sx={{ width: '60%' }}>
                                                    <Typography>{`：${approver.email}`}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                </Box>
                            </Box >
                        )}
                    </>
                )}
            </Box>
            <DrawerFooter />
        </Drawer>
    );
}

const SignatureApproveListForGuest: any = (props: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        isOpen ?
            <OpenedSideMenu approveHistory={props} setIsOpen={setIsOpen} /> :
            <ClosedSideMenu setIsOpen={setIsOpen} />
    );
}

export default SignatureApproveListForGuest;