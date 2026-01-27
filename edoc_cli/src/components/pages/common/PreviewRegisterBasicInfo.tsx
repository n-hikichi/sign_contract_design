import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { readOnlyTextFieldStyle_Register } from '../../../styles/fontStyles';
import { baseContentsStyle, pdfPreviewDialogStyle } from '../../../styles/styles';
import api from '../../../utils/apiAccessor';
import apiExecutor from "../../../utils/apiExecutor";
import dayjs, { Dayjs } from 'dayjs';

interface CommonTextFieldProps {
    value: string;
    label: string;
}

interface CommonTextAndPreviewFieldProps {
    value: string;
    label: string;
    onButtonClick: () => void;
}

const CommonTextField: React.FC<CommonTextFieldProps> = ({ value, label }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
            <TextField
                value={value}
                label={label}
                variant="standard"
                sx={readOnlyTextFieldStyle_Register}
                disabled={true}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    disableUnderline: true,
                }}
            />
        </Box>
    );
};

const CommonTextAndPreviewField: React.FC<CommonTextAndPreviewFieldProps> = ({ value, label, onButtonClick }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
            <TextField
                value={value}
                label={label}
                variant="standard"
                sx={readOnlyTextFieldStyle_Register}
                disabled={true}
                InputProps={{
                    disableUnderline: true,
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '10px', width: '20%', paddingRight: '20px' }}>
                <Button variant="contained" onClick={onButtonClick} sx={{ '&:hover': { backgroundColor: 'darkblue' } }} >
                    全画面で表示する
                </Button>
            </Box>
        </Box>
    );
};

// フォームの入力値
interface FormInput {
    title: string,
    file_name: string,
    file: string,
    own_company: CompanyInfo,
    customer_company: CompanyInfo,
    type: string,
    deal_amount: number,
    conclusion_date: Dayjs | null,
    expiration_date: Dayjs | null,
    template_id: string,
    approval_flow: {
        internal_pic: Approver,
        internal_approver: Approver[],
        internal_authorizer: Approver,
        customer_pic: Approver,
        customer_approver: Approver[],
        customer_authorizer: Approver,
        submission_period: number,
    }
};

type CompanyInfo = {
    company_id: string;
    company_name: string;
    postal_code: string;
    state: string;
    city: string;
    address_line: string;
    building: string;
};

interface User {
    user_id: string,
    email: string,
    location_id: string,
    position: string,
    user_name: string,
    company_name: string,
    file: string,
};

// 承認者の情報
interface Approver {
    // 会社名
    company_name: string,
    // 役職
    position: string,
    // 氏名
    user_name: string,
    // メールアドレス
    email: string,
};


interface PreviewBasicInfoProps {
    basicInfo: FormInput;
    file?: File;
    templateId: string;
    templateName: string;
}

const PreviewRegisterBasicInfo: React.FC<PreviewBasicInfoProps> = ({ basicInfo, file, templateId, templateName }) => {

    // ローディング中を表すフラグ
    const [isLoading, setIsLoading] = useState(false);

    // data url形式のbase64にエンコードされたpdfファイル
    const [pdfBase64, setPdfBase64] = useState('');

    // data url形式のbase64にエンコードされたpdfファイル
    const [signTemplatePdfBase64, setSignTemplatePdfBase64] = useState('');

    // PDFファイルプレビュー
    // プレビューダイアログの開閉状態
    const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
    const handlePdfPreviewDialogClose = () => setPdfPreviewDialogOpen(false);

    // ダイアログを開く関数
    const openPdfPreviewDialog = () => {
        setPdfPreviewDialogOpen(true);
    };

    // PDFファイルプレビュー
    // プレビューダイアログの開閉状態
    const [signTemplatePreviewDialogOpen, setSignTemplatePreviewDialogOpen] = useState(false);
    const handleSignTemplatePreviewDialogClose = () => setSignTemplatePreviewDialogOpen(false);

    // ダイアログを開く関数
    const openSignTemplatePreviewDialog = () => {
        setSignTemplatePreviewDialogOpen(true);
    };

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

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

    useEffect(() => {
        // 画面の一番上にスクロールする
        window.scrollTo(0, 0);

        setIsLoading(true);

        const fetchData = async () => {
            try {

                // アップロードファイルのbase64データを取得する
                if (file) {
                    const base64Data = await readFileAsBase64(file);
                    setPdfBase64(base64Data);
                }

                // 署名テンプレートファイルを取得
                const res = await apiExecutor.fetchGetSignedTemplateFile(templateId)

                if (res.status !== api.HTTP_OK) {
                    console.log("API response failed. HTTP Status: " + res.status);

                    setErrorCode(res.status);
                    setErrorProcess('契約書登録　情報取得処理');
                    setExecuteFailedApiDialogOpen(true);
                    return;
                }

                // 正常に取得できた場合は各APIのレスポンスを取得する
                const templateFile = await res.json();
                setSignTemplatePdfBase64("data:application/pdf;base64," + templateFile.file);

            } catch (error) {
                console.error('Error fetching data:', error);

                setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
                setErrorProcess('契約書登録　登録情報確認処理');
                setExecuteFailedApiDialogOpen(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // どちらかのプレビューダイアログが開いているときのみ
        if (!(pdfPreviewDialogOpen || signTemplatePreviewDialogOpen)) return;

        // 履歴を追加
        window.history.pushState(null, '', window.location.href);

        const handlePopState = (e: PopStateEvent) => {
            if (pdfPreviewDialogOpen) handlePdfPreviewDialogClose();
            if (signTemplatePreviewDialogOpen) handleSignTemplatePreviewDialogClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [pdfPreviewDialogOpen, signTemplatePreviewDialogOpen]);

    const [pdfError, setPdfError] = useState(false);

    return (
        <>
            <Box sx={{ flexGrow: 1, marginBottom: '20px', border: '1px solid lightgray' }}>
                <Box bgcolor="white" sx={{ flexGrow: 1, padding: '20px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '100%', marginBottom: '40px' }}>
                            <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>基本情報</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
                                <TextField
                                    value={basicInfo.title}
                                    label='件名'
                                    variant="standard"
                                    sx={readOnlyTextFieldStyle_Register}
                                    disabled={true}
                                    InputProps={{
                                        disableUnderline: true,
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '10px', width: '20%', paddingRight: '20px' }}>
                                    <Button variant="contained" onClick={openPdfPreviewDialog} sx={{ '&:hover': { backgroundColor: 'darkblue' } }} >
                                        全画面で表示する
                                    </Button>
                                </Box>
                            </Box>
                            <CommonTextField value={basicInfo.type} label="契約書種別" />
                            {/* {templateName && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px', borderBottom: '1px solid lightgrey' }}>
                                    <TextField
                                        value={templateName}
                                        label='契約書テンプレート'
                                        variant="standard"
                                        sx={readOnlyTextFieldStyle_Register}
                                        disabled={true}
                                        InputProps={{
                                            disableUnderline: true,
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '10px', width: '20%', paddingRight: '20px' }}>
                                        <Button variant="contained" onClick={openSignTemplatePreviewDialog} sx={{ '&:hover': { backgroundColor: 'darkblue' } }} >
                                            全画面で表示する
                                        </Button>
                                    </Box>
                                </Box>
                            )} */}
                            <CommonTextField value={basicInfo.deal_amount.toLocaleString() + '円'} label="取引金額" />
                            <CommonTextField value={dayjs(basicInfo.conclusion_date).format('YYYY-MM-DD')} label="契約開始日" />
                            <CommonTextField value={dayjs(basicInfo.expiration_date).format('YYYY-MM-DD')} label="契約終了日" />
                            <TextField
                                value={`${Number(basicInfo.approval_flow.submission_period)}日`}
                                label="署名用URL有効期限（相手方企業向け）"
                                variant="standard"
                                sx={readOnlyTextFieldStyle_Register}
                                disabled={true}
                                InputProps={{
                                    disableUnderline: true,
                                }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '50%' }}>
                            <Box sx={{ marginBottom: '20px', marginRight: '10px' }}>
                                <Box sx={{ bgcolor: 'lightgreen', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>自社情報</Typography>
                                </Box>
                                <CommonTextField value={basicInfo.own_company.company_name} label="会社名" />
                                <CommonTextField value={basicInfo.own_company.postal_code} label="郵便番号" />
                                <CommonTextField value={basicInfo.own_company.state} label="都道府県" />
                                <CommonTextField value={basicInfo.own_company.city} label="市区町村" />
                                <CommonTextField value={basicInfo.own_company.address_line} label="町名番地" />
                                <CommonTextField value={basicInfo.own_company.building} label="建物名・部屋番号" />
                            </Box>
                        </Box>
                        <Box sx={{ width: '50%', marginLeft: '10px' }}>
                            <Box>
                                <Box sx={{ bgcolor: 'lightyellow', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', border: '0.5px solid lightgray' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>相手方企業情報</Typography>
                                </Box>
                                <CommonTextField value={basicInfo.customer_company.company_name} label="会社名" />
                                <CommonTextField value={basicInfo.customer_company.postal_code} label="郵便番号" />
                                <CommonTextField value={basicInfo.customer_company.state} label="都道府県" />
                                <CommonTextField value={basicInfo.customer_company.city} label="市区町村" />
                                <CommonTextField value={basicInfo.customer_company.address_line} label="町名番地" />
                                <CommonTextField value={basicInfo.customer_company.building} label="建物名・部屋番号" />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ width: '50%' }}>
                            <Box sx={{ marginBottom: '20px', marginRight: '10px' }}>
                                {/* <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>自社担当者</Typography>
                                </Box> */}
                                <CommonTextField value={basicInfo.approval_flow.internal_pic.user_name} label="担当者氏名" />
                                <CommonTextField value={basicInfo.approval_flow.internal_pic.email} label="メールアドレス" />
                            </Box>
                        </Box>
                        <Box sx={{ width: '50%', marginLeft: '10px' }}>
                            {/* <Box sx={{ bgcolor: 'lightblue', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', paddingTop: '10px', paddingBottom: '10px' }}>相手方担当者</Typography>
                                </Box> */}
                            <CommonTextField value={basicInfo.approval_flow.customer_pic.user_name} label="担当者氏名" />
                            <CommonTextField value={basicInfo.approval_flow.customer_pic.email} label="メールアドレス" />
                        </Box>
                    </Box>
                </Box>
            </Box>
            {/* ファイルプレビューダイアログ */}
            <div>
                <Modal
                    open={pdfPreviewDialogOpen}
                    onClose={handlePdfPreviewDialogClose}
                >
                    <Box sx={pdfPreviewDialogStyle} >
                        <Box
                            sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                            onClick={() => window.open(pdfBase64, '_blank')}
                        >
                            <embed type='application/pdf' src={pdfBase64 + "#zoom=100"} height='100%' width='100%' />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                            <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={(handlePdfPreviewDialogClose)}>プレビュー終了</Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
            {/* ファイルプレビューダイアログ */}
            <div>
                <Modal
                    open={signTemplatePreviewDialogOpen}
                    onClose={handleSignTemplatePreviewDialogClose}
                >
                    <Box sx={pdfPreviewDialogStyle}>
                        <Box sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black', position: 'relative' }}>
                            {/* <embed>の代わりに<object>を使うとonErrorが使える */}
                            <object
                                type="application/pdf"
                                data={pdfBase64 + "#zoom=100"}
                                width="100%"
                                height="100%"
                                onError={() => setPdfError(true)}
                            >
                                {/* objectタグが失敗した場合のフォールバック */}
                                <Box sx={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    bgcolor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Typography color="error">PDFの読み込みに失敗しました。</Typography>
                                    <Button variant="contained" onClick={() => window.open(pdfBase64, '_blank')}>新しいタブで開く</Button>
                                </Box>
                            </object>
                            {/* 追加でエラー状態を監視してメッセージを出す */}
                            {pdfError && (
                                <Box sx={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    bgcolor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Typography color="error">PDFの読み込みに失敗しました。</Typography>
                                    <Button variant="contained" onClick={() => window.open(pdfBase64, '_blank')}>新しいタブで開く</Button>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                            <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={handlePdfPreviewDialogClose}>プレビュー終了</Button>
                        </Box>
                    </Box>
                    {/* <Box sx={pdfPreviewDialogStyle} >
                        <Box
                            sx={{ ...baseContentsStyle, width: '100%', height: '95%', border: 'solid 2px black' }}
                            onClick={() => window.open(signTemplatePdfBase64, '_blank')}
                        >
                            <embed type='application/pdf' src={signTemplatePdfBase64 + "#zoom=100"} height='100%' width='100%' />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                            <Button variant="contained" color="primary" sx={{ '&:hover': { backgroundColor: 'darkblue' } }} onClick={(handleSignTemplatePreviewDialogClose)}>プレビュー終了</Button>
                        </Box>
                    </Box> */}
                </Modal>
            </div>
        </>
    );
}

export default PreviewRegisterBasicInfo;