import { Box, Grid, TextField, Typography } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import apiDataType from "../../../utils/apiDataType";

// 共通スタイルの定義
const disabledTextFieldStyle = {
    width: '100%',
    '& .Mui-disabled': {
        color: 'black',
        opacity: 1,
        '-webkit-text-fill-color': 'black',
        fontSize: '20px',
    },
    '& .MuiInputBase-input.Mui-disabled': {
        color: 'black',
        opacity: 1,
        '-webkit-text-fill-color': 'black',
        fontSize: '20px',
        paddingLeft: '20px',
        fontWeight: 'bold',
    },
};

interface ApproverInfoForUserProps {
    isChecked: boolean;
    handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    present_approver?: apiDataType.Approver;
    isPresentApprover: boolean;
    isAgreementDetailChecked?: boolean;
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
const ApproverInfo: React.FC<ApproverInfoForUserProps> = ({ isChecked, handleCheckboxChange, present_approver, isPresentApprover, isAgreementDetailChecked }) => {
    return (
        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                <Grid item md={12}>
                    <Box sx={{ flexGrow: 0, width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                        <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                            {isPresentApprover === true && '承認者情報' || '現在の承認者'}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item md={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.company_name}
                            id="title"
                            label="会社名"
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                ...disabledTextFieldStyle,
                                '& .MuiInputBase-input.Mui-disabled': {
                                    color: isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    opacity: 1,
                                    '-webkit-text-fill-color': isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    fontSize: '20px',
                                    paddingLeft: '20px',
                                    fontWeight: 'bold',
                                },
                            }}
                            disabled={true}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.user_name}
                            id="title"
                            label="氏名"
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                ...disabledTextFieldStyle,
                                '& .MuiInputBase-input.Mui-disabled': {
                                    color: isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    opacity: 1,
                                    '-webkit-text-fill-color': isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    fontSize: '20px',
                                    paddingLeft: '20px',
                                    fontWeight: 'bold',
                                },
                            }}
                            disabled={true}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.position}
                            id="title"
                            label="役職"
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                ...disabledTextFieldStyle,
                                '& .MuiInputBase-input.Mui-disabled': {
                                    color: isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    opacity: 1,
                                    '-webkit-text-fill-color': isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    fontSize: '20px',
                                    paddingLeft: '20px',
                                    fontWeight: 'bold',
                                },
                            }}
                            disabled={true}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.email}
                            id="title"
                            label="メールアドレス"
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                ...disabledTextFieldStyle,
                                '& .MuiInputBase-input.Mui-disabled': {
                                    color: isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    opacity: 1,
                                    '-webkit-text-fill-color': isPresentApprover ? (isAgreementDetailChecked ? 'black' : 'gray') : 'black',
                                    fontSize: '20px',
                                    paddingLeft: '20px',
                                    fontWeight: 'bold',
                                },
                            }}
                            disabled={true}
                        />
                    </Box>
                    {isPresentApprover === true && (
                        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'start', width: '90%', marginRight: '5%', marginLeft: '5%', marginTop: '10px' }}>
                            {isAgreementDetailChecked ? (
                                <FormControlLabel
                                    required
                                    control={
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={handleCheckboxChange}
                                            disabled={!isAgreementDetailChecked}
                                        />}
                                    label={
                                        <Typography sx={{ display: 'inline-flex', alignItems: 'center', color: 'darkred', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            承認者情報が正しい事を確認しました。
                                        </Typography>
                                    }
                                />
                            ) : (
                                <Typography sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'darkred', fontWeight: 'bold', fontSize: '1.2rem', width: '100%', textAlign: 'center' }}>
                                    始めに「契約書を閲覧する」をクリックして、契約書の内容を確認してください。
                                </Typography>
                            )}
                        </Box>
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

interface NotificationInfoForUserProps {
    present_approver?: apiDataType.Approver;
    isPresentApprover: boolean;
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
export const NotificationInfo: React.FC<NotificationInfoForUserProps> = ({ present_approver, isPresentApprover }) => {
    return (
        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 0, width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                    <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                        相手方担当者情報
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                    <TextField
                        value={present_approver?.company_name}
                        id="title"
                        label="会社名"
                        variant="standard"
                        sx={disabledTextFieldStyle}
                        disabled={true}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                    <TextField
                        value={present_approver?.user_name}
                        id="title"
                        label="氏名"
                        variant="standard"
                        sx={disabledTextFieldStyle}
                        disabled={true}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                    <TextField
                        value={present_approver?.position}
                        id="title"
                        label="役職"
                        variant="standard"
                        sx={disabledTextFieldStyle}
                        disabled={true}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                    <TextField
                        value={present_approver?.email}
                        id="title"
                        label="メールアドレス"
                        variant="standard"
                        sx={disabledTextFieldStyle}
                        disabled={true}
                    />
                </Box>
            </Box>
        </Box>
    );
};

/**
 * 
 * 【承認者情報確認】
 * 
 * 現在の承認ユーザー情報を表示する
 * ユーザーは確かに自分である事を確認（チェック）する
 * 
 */
export const PresentApproverInfo: React.FC<NotificationInfoForUserProps> = ({ present_approver }) => {
    return (
        <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid lightgray' }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
                <Grid item md={12}>
                    <Box sx={{ flexGrow: 0, width: '90%', marginRight: '5%', marginLeft: '5%' }}>
                        <Typography sx={{ backgroundColor: 'lightblue', padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', fontSize: '1.5rem', width: '100%' }}>
                            現在の承認者
                        </Typography>
                    </Box>
                </Grid>
                <Grid item md={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.company_name}
                            id="title"
                            label="会社名"
                            variant="standard"
                            sx={disabledTextFieldStyle}
                            disabled={true}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.user_name}
                            id="title"
                            label="氏名"
                            variant="standard"
                            sx={disabledTextFieldStyle}
                            disabled={true}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.position || '-----'}
                            id="title"
                            label="役職"
                            variant="standard"
                            sx={disabledTextFieldStyle}
                            disabled={true}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '90%', '& .Mui-disabled': { color: 'black' }, marginRight: '5%', marginLeft: '5%', marginBottom: '20px' }}>
                        <TextField
                            value={present_approver?.email}
                            id="title"
                            label="メールアドレス"
                            variant="standard"
                            sx={disabledTextFieldStyle}
                            disabled={true}
                        />
                    </Box>
                </Grid>
            </Box>
        </Box>
    );
};

export default ApproverInfo;