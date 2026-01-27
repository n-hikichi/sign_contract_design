import { Box, Button, Grid, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useState } from 'react';
import { CustomDinamicCardForLocation } from "../CustomDinamicCard";
import RegisterLocationDialog from "../RegisterLocationDialog";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const LocationView = (props: any) => {

    const [registerLocationDialog, setRegisterLocationDialogOpen] = useState(false);
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
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Button variant='contained' size='large' onClick={() => setRegisterLocationDialogOpen(true)}>拠点登録</Button>
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
                <Box bgcolor='white' sx={{ padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <Grid container spacing={2}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                <CustomDinamicCardForLocation companyInfo={props.companyInfo} locationList={props.locationInfo} onEditDialogOpen={handleEditDialogOpen} onDeleteDialogOpen={handleDeleteDialogOpen} />
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            </Box>
            {registerLocationDialog ? <RegisterLocationDialog companyInfo={props.companyInfo} setDialogOpen={setRegisterLocationDialogOpen} /> : null}
        </>
    );
}

export default LocationView;