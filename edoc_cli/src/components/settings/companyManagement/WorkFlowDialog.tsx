import { Box, Button, Grid } from "@mui/material";
import { useState } from 'react';
import { CustomDinamicCardForRepresentativeSeal } from '../CustomDinamicCard';
import RegisterWorkFlowDialog from "../RegisterWorkFlowDialog";
import WorkFlowView from './WorkFlowView';
import apiExecutor from "../../../utils/apiExecutor";

const WorkFlowDialog = (props: any) => {

    const [registerUserDialog, setRegisterUserDialogOpen] = useState(false);

    const [workflowInfo, setWorkflowInfo] = useState(props.workflowInfo);

    const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

    // 承認フロー一覧の再取得関数
    const fetchWorkflowInfo = async () => {
        const res = await apiExecutor.fetchGetApprovalFlowList(props.companyInfo.company_id);
        const workflowListJson = await res.json();

        setWorkflowInfo(workflowListJson); // 取得した最新データでstateを更新
    };

    // 登録成功時にIDを受け取る
    const handleRegisterSuccessWithId = (workflowId: string) => {
        setHighlightedRowId(workflowId);
        setTimeout(() => setHighlightedRowId(null), 15000); // 3秒後に解除
        // データ再取得などもここで
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
                            <WorkFlowView
                                companyInfo={props.companyInfo}
                                documentList={props.userInfo}
                                workflowInfo={workflowInfo}
                                userInfo={props.userInfo.filter((user: any) => user.isRepresentativeSeal === false)}
                                representativeInfo={props.userInfo.filter((user: any) => user.isRepresentativeSeal === true)}
                                onRegisterSuccess={fetchWorkflowInfo}
                                // highlightedRowId={highlightedRowId}
                                onRegisterSuccessWithId={handleRegisterSuccessWithId}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
            {registerUserDialog ?
                <RegisterWorkFlowDialog
                    companyInfo={props.companyInfo}
                    locationList={props.locationMappedData}
                    userInfo={props.userInfo.filter((user: any) => user.isRepresentativeSeal === false)}
                    representativeInfo={props.userInfo.filter((user: any) => user.isRepresentativeSeal === true)}
                    setDialogOpen={setRegisterUserDialogOpen}
                    workflowInfo={props.workflowInfo}
                    onRegisterSuccess={fetchWorkflowInfo}
                    onRegisterSuccessWithId={handleRegisterSuccessWithId}
                /> : null}
        </>
    );
}

export default WorkFlowDialog;