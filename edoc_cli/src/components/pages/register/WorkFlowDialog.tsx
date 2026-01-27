import { Box } from "@mui/material";
import { useState } from 'react';
import WorkFlowView from './WorkFlowView';

const WorkFlowDialog = (props: any) => {

    const [internalWorkflowData] = useState<any[]>([
        ...(props.internalWorkflowData || []),
        ...(props.customerWorkflowData || [])
    ]);

    return (
        <>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1 }}>
                    <Box bgcolor='white' sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1, border: '1px solid lightgray' }} >
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <WorkFlowView
                                internalInfo={props.internalInfo}
                                selectedValue={props.selectedValue}
                                selectedCompanyData={props.selectedCompanyData}
                                signTemplateList={props.signTemplateList}
                                internalWorkflowData={internalWorkflowData}
                                customerWorkflowData={props.customerWorkflowData}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default WorkFlowDialog;