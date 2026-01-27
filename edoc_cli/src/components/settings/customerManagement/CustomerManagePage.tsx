import { Box, Button, CssBaseline, Grid, ToggleButtonGroup, ToggleButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import api from '../../../utils/apiAccessor';
import dataType from '../../../utils/apiDataType';
import { apiExecutor } from '../../../utils/apiExecutor';
import ApiProcessingDialog from "../../pages/common/ApiProcessingDialog";
import ErrorDialog from "../../pages/common/ErrorDialog";
import SuccessDialog from "../../pages/common/SuccessDialog";
import Footer from "../../templates/Footer";
import Header from "../../templates/Header";
import SideMenu from "../../templates/SideMenu";
import { CustomDinamicCardForCompany } from '../CustomDinamicCard';
import RegisterCompanyDialog from "../RegisterCompanyDialog";
import NowLoading from "../../templates/NowLoading";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

// 企業情報の種別
const COMPANYTYPE = 'CUSTOMER';
let request_id = '';

const CustomerManagePage = () => {

    const navigate = useNavigate();

    const location = useLocation();
    const myValue = location.state?.uuid;

    if (myValue !== undefined && myValue !== null) {
        request_id = location.state.uuid;
    };

    /***
    *
    * React hooks
    *
    */
    // ローディング状態を管理する
    const [isLoading, setIsLoading] = useState(true);

    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

    // 企業情報
    const [customerCompanyInfo, setCustomerCompanyInfo] = useState<dataType.CompanyInfo>();

    // 初回レンダー時の処理
    useEffect(() => {

        // ローディング中を表すフラグを立てる
        setIsLoading(true);

        async function fetchData() {
            try {
                // 顧客企業一覧を取得する
                const companyList = await apiExecutor.fetchGetCompanyList(COMPANYTYPE);

                if (companyList.status !== api.HTTP_OK) {
                    console.log("fetchAgreementData(): API response failed. HTTP Status: " + companyList.status);

                    setErrorCode(companyList.status);
                    setErrorProcess('相手方企業情報　取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                const companyListJson = await companyList.json();
                setCustomerCompanyInfo(companyListJson);
            } catch (error) {
                console.error("An error occurred while fetching data:", error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('相手方企業情報　取得処理');
                setExecuteFailedApiDialogOpen(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [request_id]);

    /***
     * 
     * API実行成功ダイアログ
     * 
     */
    const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
    const handleExecuteSuccessApiDialogClose = () => setExecuteSuccessApiDialogOpen(false);

    /***
     * 
     * API処理中ダイアログ
     * 
     */
    // エラーダイアログの開閉状態
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteApiDialogDialog = () => {
        setExecuteApiDialogOpen(true);
    };

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    // ダイアログを開く関数
    const openExecuteApiErrorDialogDialog = () => {
        setExecuteFailedApiDialogOpen(true);
    };

    /**
     * 
     * 企業情報登録
     * 
     */
    const registerCompany = () => {

        // 企業情報登録ダイアログを開く
        setRegisterDialogOpen(true);
    };

    /**
     * 
     * 企業情報編集
     * 
     */
    const handleClickModifyLocation = (data: any) => {

        // 企業情報編集画面に遷移
        navigate('/manage/clientCompanyLocation', { state: { customerData: data } });
    };

    /**
     * 
     * 企業情報削除
     * 
     */
    // 破棄確認ダイアログの開閉状態
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const handleDeleteDialogClose = () => setDeleteDialogOpen(false);

    const handleClickOpen = () => {
        setDeleteDialogOpen(true);
    };

    const [view, setView] = useState('list');
    const handleChange = (event: React.MouseEvent<HTMLElement>, value: string) => {
        if (value !== null) setView(value);
    };

    if (isLoading) {
        return <NowLoading />;
    } else {
        return (
            <>
                <Box bgcolor='grey.200' sx={{ height: 'auto', minHeight: 'calc(100vh - 35px)', paddingTop: '80px', paddingBottom: '5px' }}>
                    <Header />
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <SideMenu />
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <Box sx={{ marginLeft: '5%', marginRight: '5%', marginBottom: '20px' }}>
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', width: '100%' }}>
                                    相手方情報管理
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 1, minWidth: '800px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '5px' }}>
                                        <Button variant='contained' size='large' onClick={() => registerCompany()}>企業登録</Button>
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
                                    <Box bgcolor='white' sx={{ padding: '20px', border: '1px solid lightgray' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                            <Grid container spacing={2}>
                                                <CustomDinamicCardForCompany companyList={customerCompanyInfo} onEdit={handleClickModifyLocation} onDelete={handleClickOpen} />
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
                {registerDialogOpen ? <RegisterCompanyDialog setDialogOpen={setRegisterDialogOpen} attribute="CUSTOMER" /> : null}
                <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
                <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
                <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
            </>
        );
    };
}

export default CustomerManagePage;