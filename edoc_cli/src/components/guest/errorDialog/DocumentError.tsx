import { Box, Button, DialogTitle, Grid } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';

/**
 * 削除した書類の復元画面のコンポーネント
 * 書類情報を表示し、復元ボタンを押すとAPIに復元リクエストを送信する
 */
const DocumentError = () => {

    const navigate = useNavigate();

    const TitleBox = ({ title }: { title: string }) => (
        <Box sx={{ flexGrow: 0, height: '60px', width: '500px' }}>
            <DialogTitle className="registerTitle" sx={{ paddingLeft: 0, fontWeight: 'bold', fontSize: '1.5em' }}>
                {title}
            </DialogTitle>
        </Box>
    );
    const StatusBox = ({ status }: { status: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'Top', justifyContent: 'space-between', height: 'auto', paddingRight: '20px' }}>
            {status}
        </Box>
    );
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', minHeight: '100vh' }}>
            <Box bgcolor='grey.200' sx={{ height: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
                <CssBaseline />
                <Box sx={{ flexGrow: 1, paddingLeft: '30%', paddingRight: '30%', paddingBottom: '20px', paddingTop: '20px' }}>
                    <Grid container spacing={3}>
                        <Grid item md={12}>
                            <Box bgcolor="white" sx={{ width: '700px', height: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px', paddingBottom: '20px' }}>
                                <DialogTitle className="registerTitle" sx={{ paddingLeft: 0, fontWeight: 'bold', fontSize: '1.5em', borderBottom: '1px solid black' }}>
                                    問い合わせの契約書が存在しません<br/>
                                </DialogTitle>
                                <DialogTitle className="registerTitle" sx={{ paddingLeft: 0, fontWeight: 'bold', fontSize: '1.2em' }}>
                                    ファイル名：sample.pdf
                                </DialogTitle>
                                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', marginBottom: '50px' }}>
                                    <Button variant='contained' size='large' onClick={() => { navigate('/guest/approve') }} style={{ margin: '10px' }}>書類を確認する<br />URL有効期限：2025年4月11日（金）14時30分</Button>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', borderTop: '1px solid black' }}>
                                    <StatusBox status="有効期限が過ぎてしまった場合は送信者に再送信を依頼してください。" />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                    <StatusBox status="本メールは送信専用ですので、ご返答いただいてもお答えする事は出来ません。" />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box >
        </div >
    );
};

export default DocumentError;