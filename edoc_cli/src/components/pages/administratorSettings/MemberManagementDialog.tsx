import { Box, Button, Grid } from "@mui/material";
import { useState } from 'react';
import RegisterNewMemberDialog from "./RegisterNewMemberDialog";
import MemberManagementView from './MemberManagementView';

const MemberManagementDialog = (props: any) => {

    // 契約書リストを管理
    const [documentList, setDocumentList] = useState(true);

    const [registerUserDialog, setRegisterUserDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleEditDialogOpen = () => {
        setEditDialogOpen(true);
    };

    const handleDeleteDialogOpen = () => {
        setDeleteDialogOpen(true);
    };

    return (
        <>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '5px' }}>
                            <Button variant='contained' size='large' onClick={() => setRegisterUserDialogOpen(true)}>承認フロー登録</Button>
                        </Box>
                    </Box>
                    <Box bgcolor='white' sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1, border: '1px solid lightgray' }} >
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <MemberManagementView companyInfo={props.companyInfo} documentList={props.userInfo} />
                        </Box>
                    </Box>
                </Box>
            </Box>
            {registerUserDialog ? <RegisterNewMemberDialog companyInfo={props.companyInfo} locationList={props.locationMappedData} setDialogOpen={setRegisterUserDialogOpen} /> : null}
        </>
    );
}

export default MemberManagementDialog;