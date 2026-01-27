import { ChevronLeft } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { Box, Button, Divider, Drawer, IconButton, ListItem, ListItemText, styled } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Font, PDFDownloadLink } from '@react-pdf/renderer';
import React, { useEffect, useState, useRef } from 'react';
import converter from "../../../utils/converter";
import SignatureHistoryPdf from './SignatureHistoryPdf';

// ドロワー幅の定義
const drawerWidth = '30%';
const drawerWidthClosed = '10%';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
}));

const DrawerFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    width: '100%',
    position: 'relative',
    bottom: 0,
    height: '30px',
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
                    borderRight: '1px solid grey.200',
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
                    }}>承認フロー</MenuItem>
            </IconButton>
        </Drawer>
    );
}

interface Signatures {
    user_name: string;
    company_name: string;
    position: string;
    email: string;
    role: string;
    signed_time: string;
    valid: boolean;
};

const OpenedSideMenu: any = (props: any) => {
    // 承認履歴（ユーザー）情報
    const [registerUser, setRegisterUser] = useState<Signatures>();
    const [approveUserList, setApproveUserList] = useState<Signatures[]>([]);
    const [isFileValid, setIsFileValid] = useState(false);
    const [isAgreementValid, setAgreementValid] = useState(false);

    const ownCompanyDisplayed = useRef(false);
    const otherCompanyDisplayed = useRef(false);

    useEffect(() => {
        setRegisterUser(props.approveResult.signatures[0]);
        setApproveUserList(props.approveResult.signatures.slice(1));
        setIsFileValid(props.approveResult.file_valid);
        setAgreementValid(props.approveResult.agreement_valid);
    }, []);

    // PDFファイルプレビューダイアログの開閉状態
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);

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
            <DrawerHeader onClick={() => props.setIsOpen(false)} sx={{ cursor: 'pointer' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <h3>この書類の承認フロー</h3>
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
                </Box>
            </DrawerHeader>
            <Divider />
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <>
                    <Box display="flex" sx={{ width: '100%', padding: '10px', paddingRight: '40px', paddingLeft: '15px', bgcolor: 'lightblue' }}>
                        <Box sx={{ width: '90%' }}>
                            <Typography>契約書</Typography>
                        </Box>
                    </Box>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel0-content`}
                            id={`panel0-header`}
                        >
                            <Box display="flex" sx={{ width: '100%' }}>
                                <Box sx={{ width: '90%' }}>
                                    <Typography>登録者：{registerUser?.user_name}</Typography>
                                </Box>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ width: '100%' }}>
                            <Typography>
                                <ListItem key='役職' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                    <ListItemText primary={`役職　　　　　：${registerUser?.position}`} />
                                </ListItem>
                                <ListItem key='メールアドレス' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                    <ListItemText primary={`メールアドレス：${registerUser?.email}`} />
                                </ListItem>
                                <ListItem key='登録日時' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                    <ListItemText primary={`登録日時　　　：${registerUser?.signed_time ? converter.dateConverter_fromISO8601(registerUser.signed_time) : '---'}`} />
                                </ListItem>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    {approveUserList.map((signature, index) => {
                        let displayBox = null;

                        if (signature.company_name === props.own_company && !ownCompanyDisplayed.current) {
                            displayBox = (
                                <Box display="flex" sx={{ width: '100%', padding: '10px', paddingRight: '40px', paddingLeft: '15px', bgcolor: '#e6ffe6', borderTop: '1px solid lightgray', borderBottom: '1px solid lightgray' }}>
                                    <Box sx={{ width: '90%' }}>
                                        <Typography>{signature.company_name}</Typography>
                                    </Box>
                                </Box>
                            );
                            ownCompanyDisplayed.current = true;
                        } else if (signature.company_name !== props.own_company && !otherCompanyDisplayed.current) {
                            displayBox = (
                                <Box display="flex" sx={{ width: '100%', padding: '10px', paddingRight: '40px', paddingLeft: '15px', bgcolor: 'lightyellow', borderTop: '1px solid lightgray', borderBottom: '1px solid lightgray' }}>
                                    <Box sx={{ width: '90%' }}>
                                        <Typography>{signature.company_name}</Typography>
                                    </Box>
                                </Box>
                            );
                            otherCompanyDisplayed.current = true;
                        }

                        return (
                            <React.Fragment key={index}>
                                {displayBox}
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`panel${index}-content`}
                                        id={`panel${index}-header`}
                                    >
                                        <Box display="flex" sx={{ width: '100%' }}>
                                            <Box sx={{ width: '90%' }}>
                                                <Typography>署名{index + 1}：{signature.user_name}</Typography>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ width: '100%' }}>
                                        <Typography>
                                            <ListItem key='役職' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                <ListItemText primary={`役職　　　　　：${signature.position}`} />
                                            </ListItem>
                                            <ListItem key='メールアドレス' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                <ListItemText primary={`メールアドレス：${signature.email}`} />
                                            </ListItem>
                                            <ListItem key='署名日時' sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
                                                <ListItemText primary={`署名日時　　　：${converter.dateConverter_fromISO8601(signature.signed_time)}`} />
                                            </ListItem>
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </React.Fragment>
                        );
                    })}
                </>
            </Box>
            <Box sx={{ marginBottom: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <DrawerFooter></DrawerFooter>
            </Box>
        </Drawer>
    );
}
const DiscardSignatureHistory: any = (props: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        isOpen ?
            <OpenedSideMenu setIsOpen={setIsOpen} approveFlowData={props.approveFlowData} approveResult={props.approveResult} agreement_id={props.agreement_id} title={props.title} own_company={props.own_company} customer_company={props.customer_company} /> :
            <ClosedSideMenu setIsOpen={setIsOpen} />
    );
}

export default DiscardSignatureHistory;