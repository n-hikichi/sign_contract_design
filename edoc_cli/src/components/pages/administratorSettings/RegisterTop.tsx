import { Box, Button, CircularProgress, CssBaseline, SelectChangeEvent, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/apiAccessor';
import CommonStepper from '../../../utils/customStepper';
import { CustomPulldownMenu_ } from '../../elements/CustomPulldownMenu';
import Footer from '../../templates/Footer';
import Header from '../../templates/Header';
import NowLoading from '../../templates/NowLoading';
import SideMenu from "../../templates/SideMenu";

interface CompanyInfo {
    company_id: string,
    company_type: string,
    company_name: string,
    postal_code: string,
    state: string,
    city: string,
    address_line: string,
    building: string,
}

const RegisterTop: React.FC<{}> = () => {
    const navigate = useNavigate();

    // 自社情報
    const [internalInfo, setInternalInfo] = useState<CompanyInfo>();
    // 顧客企業一覧
    const [customerList, setCustomerList] = useState<CompanyInfo[]>([]);
    // 署名テンプレートリスト
    const [signTemplateList, setSignTemplateList] = useState([]);
    // pdf読み込み中を表すフラグ
    const [isLoading, setIsLoading] = useState(false);
    // リスト更新中フラグ
    const [isUpdatingList, setIsUpdatingList] = useState(false);

    /***
     * 
     * 相手方情報取得
     * 
     */
    // 取引先企業の一覧を取得する
    const fetchGetCustomerList = async () => {
        setIsUpdatingList(true);

        try {
            const res = await api.getCompanyList('CUSTOMER');
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);
                return [];
            };

            // 取得した企業情報を設定する
            const json = await res.json();
            // return Array.isArray(json) ? json : [];

            const customerList = Array.isArray(json) ? json : [];
            setCustomerList(Array.isArray(customerList) ? customerList : []); // 配列でない場合は空配列を設定
            setSelectedValue(customerList?.[0]?.company_id || '');
        } catch (error) {
            console.log("An unexpected error has occurred.");
            console.log(error);
        } finally {
            setIsUpdatingList(false); // 更新終了
        };
    };

    useEffect(() => {
        // ローディング中を表すフラグを立てる
        setIsLoading(true);

        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        /***
         *
         * 自社情報取得
         *
         */
        // 自社情報を取得する
        async function fetchGetInternalInfo() {
            try {
                const res = await api.getCompanyList('INTERNAL');
                if (res.status !== api.HTTP_OK) {
                    console.log("API response failed. HTTP Status: " + res.status);
                }

                // 取得した企業情報を設定する
                const json = await res.json();
                return json[0];
            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);
            }
        };

        /***
         * 
         * 署名テンプレートリストを取得する
         * 
         */
        // 取引先企業の一覧を取得する
        async function fetchGetSignTemplateList() {
            try {
                const res = await api.getSignedTemplateList();
                if (res.status !== api.HTTP_OK) {
                    console.log("API response failed. HTTP Status: " + res.status);
                }

                // 取得したユーザー情報を設定する
                const json = await res.json();
                return json;
            } catch (error) {
                console.log("An unexpected error has occurred.");
                console.log(error);
            }
        };

        async function fetchData() {
            try {
                const [internalInfo, customerList, signTemplateList] = await Promise.all([
                    fetchGetInternalInfo(),
                    fetchGetCustomerList(),
                    fetchGetSignTemplateList()
                ]);

                setInternalInfo(internalInfo);

                // setCustomerList(Array.isArray(customerList) ? customerList : []); // 配列でない場合は空配列を設定
                // setSelectedValue(customerList?.[0]?.company_id || '');

                setSignTemplateList(signTemplateList);
            } catch (error) {
                console.error("An error occurred while fetching data:", error);
                // ToDO：必要に応じてエラーメッセージを表示するなどの処理を追加
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    /***
     * 
     * 登録画面に遷移する
     * 
     */
    const goNextPage = async () => {
        navigate('/documentManagement/registerDocument', { state: { isUseApproveFlow: false, internalInfo, selectedValue, selectedCompanyData, signTemplateList } });
    }

    /***
     * 
     * 相手方企業の選択
     * 
     */
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedCompanyData, setSelectedCompanyData] = useState<CompanyInfo>();

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const selectedId = event.target.value;
        setSelectedValue(selectedId);

        const selectedCompany = customerList?.find(company => company.company_id === selectedId);
        if (selectedCompany) {
            setSelectedCompanyData(selectedCompany);
        }
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
                            <Box sx={{ marginLeft: '5%', marginRight: '5%' }} px={4}>
                                <CommonStepper activeStep={0} />
                                <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginTop: '30px', fontSize: '1.5em' }}>
                                    相手方企業を選択してから「次へ」ボタンを押下してください
                                </Typography>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ border: '1px solid lightgray', bgcolor: 'white', padding: '20px', paddingTop: '40px', paddingBottom: '20px', marginBottom: '20px' }}>
                                        {customerList.length > 0 ? (
                                            <>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '40px' }}>
                                                    <CustomPulldownMenu_
                                                        label="相手方企業"
                                                        value={selectedValue}
                                                        onChange={handleSelectChange}
                                                        items={customerList}
                                                        width='50%'
                                                        useDefaultValue={false}
                                                    />
                                                    <Box sx={{ marginLeft: '50px' }}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={fetchGetCustomerList}
                                                            sx={{ fontSize: '16px', width: '8em', '&:hover': { backgroundColor: 'darkblue', color: 'white', width: '8em' } }}
                                                            disabled={isUpdatingList}
                                                        >
                                                            {isUpdatingList ? (
                                                                <CircularProgress size={24} color="inherit" />
                                                            ) : (
                                                                <Typography>リスト更新</Typography>
                                                            )}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', color: '#8B0000', fontSize: '1.2em' }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                        <Typography sx={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>※リストにない企業との契約書を登録する場合は、先に企業登録を行ってください。</Typography>
                                                        <Button variant="outlined" color="error" onClick={() => window.open('/manage/clientCompany', '_blank')} sx={{ mt: 1, mr: 1, width: '9em', color: 'darkred', '&:hover': { backgroundColor: 'darkred', color: 'white' } }}>
                                                            <Typography>企業登録</Typography>
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </>
                                        ) : (
                                            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', textAlign: 'center', color: '#8B0000', fontSize: '1.2em' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                    <Typography sx={{ color: 'red', fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>※相手方企業が登録されていません。契約書を登録するためには、まず相手方企業を登録してください。</Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => window.open('/manage/clientCompany', '_blank')}
                                                            sx={{ width: '9em', color: 'darkred', marginRight: '10px', '&:hover': { backgroundColor: 'darkred', color: 'white' } }}
                                                        >
                                                            <Typography>企業登録</Typography>
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={fetchGetCustomerList}
                                                            sx={{ fontSize: '16px', width: '9em', '&:hover': { backgroundColor: 'darkblue', color: 'white' } }}
                                                            disabled={isUpdatingList}
                                                        >
                                                            {isUpdatingList ? (
                                                                <CircularProgress size={24} color="inherit" />
                                                            ) : (
                                                                <Typography>リスト更新</Typography>
                                                            )}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                        <Button variant="contained" onClick={goNextPage} sx={{ mt: 1, mr: 1, width: '9em', '&:hover': { backgroundColor: 'darkblue' } }} disabled={!selectedValue}>
                                            <Typography>次へ</Typography>
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Footer />
            </>
        );
    };
}

export default RegisterTop;