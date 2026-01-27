import { Box, Button, Grid, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useState } from 'react';
import { CustomDinamicCardForUser } from '../CustomDinamicCard';
import RegisterUserDialog from "../RegisterUserDialog";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const UserView = (props: any) => {

    const [registerUserDialog, setRegisterUserDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleEditDialogOpen = () => {
        setEditDialogOpen(true);
    };

    const handleDeleteDialogOpen = () => {
        setDeleteDialogOpen(true);
    };

    const [view, setView] = useState('list');
    const handleChange = (event: React.MouseEvent<HTMLElement>, value: string) => {
        if (value !== null) setView(value);
    };

    return (
        <>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '5px' }}>
                            <Button variant='contained' size='large' onClick={() => setRegisterUserDialogOpen(true)}>ユーザー登録</Button>
                            {/* <Box sx={{ marginLeft: '10px' }}>
                                <ToggleButtonGroup
                                    orientation="horizontal"
                                    value={view}
                                    exclusive
                                    onChange={handleChange}
                                >
                                    <ToggleButton value="list" aria-label="list">
                                        <FormatListBulletedIcon />
                                    </ToggleButton>
                                    <ToggleButton value="module" aria-label="module">
                                        <ViewModuleIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box> */}
                        </Box>
                    </Box>
                    <Box bgcolor='white' sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1, marginBottom: '20px', padding: '20px', border: '1px solid lightgray' }} px={4} pb='5px'>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <Grid container spacing={2}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                    <CustomDinamicCardForUser companyInfo={props.companyInfo} locationList={props.locationMappedData} userList={props.userInfo} onEditDialogOpen={handleEditDialogOpen} onDeleteDialogOpen={handleDeleteDialogOpen} />
                                </Box>
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            </Box>
            {registerUserDialog ? <RegisterUserDialog companyInfo={props.companyInfo} locationList={props.locationMappedData} setDialogOpen={setRegisterUserDialogOpen} /> : null}
        </>
    );
}

export default UserView;