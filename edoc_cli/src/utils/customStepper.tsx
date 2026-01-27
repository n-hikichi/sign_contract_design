import React from 'react';
import { Box, Stepper, Step, StepLabel, StepConnector, stepConnectorClasses } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { styled } from '@mui/system';
import LinkIcon from '@mui/icons-material/Link';
import NotStartedIcon from '@mui/icons-material/NotStarted';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface CommonStepperProps {
    activeStep: number;
}

const steps = [
    { label: '書類登録' },
    { label: '承認フロー開始前' },
    { label: '社内承認フロー中' },
    { label: '相手方承認フロー中' },
];

const StepIcon = (props: { icon: number; active: boolean; completed: boolean }) => {
    const icons: { [index: string]: React.ReactElement } = {
        1: <UploadFileIcon style={{ fontSize: '40px', color: props.completed ? 'green' : props.active ? 'red' : 'gray' }} />,
        2: <NotStartedIcon style={{ fontSize: '40px', color: props.completed ? 'green': props.active ? 'red' : 'gray' }} />,
        3: <CheckCircleIcon style={{ fontSize: '40px', color: props.completed ? 'green': props.active ? 'red' : 'gray' }} />,
        4: <CheckCircleOutlineIcon style={{ fontSize: '40px', color: props.completed ? 'green': props.active ? 'red' : 'gray' }} />,
    };

    return icons[props.icon] || <AssignmentIcon style={{ fontSize: '40px', color: 'gray' }} />;
};

const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: 'green', // アクティブな線の色
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: 'green', // 完了した線の色
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: 'gray', // デフォルトの線の色
        borderTopWidth: 4, // 線の太さ
        // borderStyle: 'dashed', // 線のスタイル（例: 実線、破線）
    },
}));

const customStepper: React.FC<CommonStepperProps> = ({ activeStep }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', marginBottom: '10px' }}>
            <Box bgcolor='white' sx={{ height: '140px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid lightgray' }}>
                <Stepper activeStep={activeStep} alternativeLabel connector={<CustomStepConnector />}>
                    {steps.map((step, index) => (
                        <Step key={index}>
                            {/* <StepLabel
                                StepIconProps={{
                                    style: {
                                        fontSize: '40px',
                                        transform: 'translateY(-5px)',
                                    },
                                }}
                            > */}
                            <StepLabel
                                StepIconComponent={() => (
                                    <StepIcon
                                        icon={index + 1}
                                        active={index === activeStep}
                                        completed={index < activeStep} // indexがactiveStepより小さい場合にcompletedをtrueに設定
                                    />
                                )}
                            >
                                {/* <StepLabel
                                StepIconComponent={() => <StepIcon icon={index + 1} active={index === activeStep} />}
                            > */}
                                <Box sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                    {step.label}
                                </Box>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
        </Box>
    );
}

export default customStepper;