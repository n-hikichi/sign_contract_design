import { Box, Button, Dialog, DialogActions, DialogContent, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent, Tabs, Tab, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import api from "../../utils/apiAccessor";
import validationRules from "../../utils/validationRules";
import EdocButton from "../elements/EdocButton";
import ApiProcessingDialog from "../pages/common/ApiProcessingDialog";
import ErrorDialog from "../pages/common/ErrorDialog";
import SuccessDialog, { SettingsSuccessDialog } from "../pages/common/SuccessDialog";
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { v4 as uuidv4 } from 'uuid';

const RegisterUserDialog = (props: any) => {

    const navigate = useNavigate();

    // 印影プレビュー用
    const [sealPreview, setSealPreview] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 印影用の入力フィールド
    const [companyDisplayName, setCompanyDisplayName] = useState('');
    const [seaPosition, setSeaPosition] = useState('');
    const [sealUserName, setSealUserName] = useState('');

    const { control, handleSubmit, getValues, setValue } = useForm(
        {
            defaultValues: {
                title: '',
                file_name: '',
                file: '',
                user_name: '',
                company_id: props.companyInfo.company_id,
                company_name: '',
                position: '',
                email: '',
                seal_position: '',
                seal_user_name: '',
                isRepresentativeSeal: false, // 固定値
            }
        }
    );

    const [isFormValid, setIsFormValid] = useState(false);

    const [errors, setErrors] = useState({
        user_name: ` `,
        email: ` `,
    });

    useEffect(() => {
        setCompanyDisplayName(props.companyInfo.company_name);

        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    const fieldNamesInJapanese: { [key: string]: string } = {
        user_name: 'ユーザー名',
        email: 'メールアドレス',
    };

    /***
     * 
     * テキストフィールド変更処理
     * 
     */
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === 'company_name') {
            setCompanyDisplayName(value);
        }

        if (name === 'seal_position') {
            setSeaPosition(value);
        }

        if (name === 'seal_user_name') {
            setSealUserName(value);
        }

        if (name === 'position') {
            setValue(name, value);
        }

        if (name === 'email' || name === 'user_name') {
            setValue(name, value);

            const error = validateTextField(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    // バリデーションチェック
    const validateTextField = (name: string, value: string) => {
        const fieldName = fieldNamesInJapanese[name] || name;

        if (!value) {
            return `${fieldName}は必須です。${validationRules.TEXT_FIELD_DEFAULT_LIMIT}文字以内で入力してください。`;
        }
        return '';
    };

    /***
     * 
     * API実行中ダイアログ
     * 
     */
    const [executeApiDialog, setExecuteApiDialogOpen] = useState(false);
    const handleExecuteApiDialogClose = () => setExecuteApiDialogOpen(false);

    /***
     * 
     * API実行成功ダイアログ
     * 
     */
    const [executeSuccessApiDialog, setExecuteSuccessApiDialogOpen] = useState(false);
    const handleExecuteSuccessApiDialogClose = () => setExecuteSuccessApiDialogOpen(false);

    /***
     * 
     * API実行失敗ダイアログ
     * 
     */
    const [errorCode, setErrorCode] = useState(0);
    const [errorProcess, setErrorProcess] = useState('');
    const [executeFailedApiDialog, setExecuteFailedApiDialogOpen] = useState(false);
    const handleExecuteFailedApiDialogClose = () => setExecuteFailedApiDialogOpen(false);

    /***
     * 
     * 登録処理
     * 
     */
    const onSubmit = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const values = getValues();

            let selectedFile = '';
            if (tabValue === 0) { // ファイルアップロード
                selectedFile = uploadFile || '';
            } else if (tabValue === 1) { // 新規作成
                selectedFile = createFile || '';
            };

            const { title, file_name, company_name, seal_position, seal_user_name, ...requestData } = values; // titleとfile_nameを除く
            requestData.file = selectedFile;

            const res = await api.postUserData(requestData);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('ユーザー登録処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('ユーザー登録処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
    };

    /***
     *
     * 契約書アップロード
     *
     */
    // ファイル名
    const [fileName, setFileName] = useState<string | null>(null);
    // ファイル情報
    const [file, setFile] = useState<File>();
    // ファイルアップロード状況
    const [fileUploaded, setFileUploaded] = useState(false);
    // 印影ファイル情報
    const [uploadFile, setUploadFile] = useState<string>();
    // 印影ファイル情報
    const [createFile, setCreateFile] = useState<string>();

    // アップロードしたファイルの情報を保持する
    const handleFileUpload = (files: File[]) => {

        const file = files[0];
        if (file) {
            setFileName(file.name);
            // ファイル名を件名として使用する
            let fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');

            setValue('title', fileNameWithoutExtension);
            setValue('file_name', file.name);
            setFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                let base64String = reader.result as string;
                // プレフィックスを取り除く
                base64String = base64String.replace(/^data:image\/png;base64,/, '');
                setUploadFile(base64String);
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setFileUploaded(true);
        }
    };

    // ドロップされたファイルを処理します。ここでは最初のファイルだけを扱います。
    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleFileUpload(acceptedFiles);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const [preview, setPreview] = useState<string | null>(null);

    /***
     * 
     * 企業情報登録ダイアログを閉じる
     * 
     */
    const onClose = async () => {
        props.setDialogOpen(false);
    };

    /***
     * 
     * 企業情報登録ダイアログを閉じる
     * 
     */
    const closeRegisterUserDialog = async () => {
        props.setDialogOpen(false);

        if (props.companyInfo.company_type === 'INTERNAL') {
            const uuid = uuidv4();
            navigate('/manage/company', { state: { uuid: uuid } });
        } else if (props.companyInfo.company_type === 'CUSTOMER') {
            navigate('/manage/clientCompanyLocation', { state: { customerData: props.companyInfo } });
        }
    };

    // タブ切り替え用のstateを追加
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: SelectChangeEvent<string>) => {
        setTabValue(event.target.value === '0' ? 0 : 1);
    };

    // チェックボックスの状態を管理する
    const [isChecked, setIsChecked] = useState(false);

    // 承認者情報に関する処理
    // チェックボックスの状態を更新する
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);

        if (event.target.checked) {
            // 入力情報を代表印フィールドに反映する
            setSealUserName(getValues('user_name'));
            setSeaPosition(getValues('position'));
            console.log('user_name:' + getValues('user_name'));
            console.log('position:' + getValues('position'));
        } else {
            // 代表印のフィールドをクリアする
            setSealUserName('');
            setSeaPosition('');
        }
    };

    // チェックボックスの状態を管理する
    const [isUseThisSealChecked, setIsUseThisSealChecked] = useState(false);

    // 承認者情報に関する処理
    // チェックボックスの状態を更新する
    const handleIsUseThisSealCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsUseThisSealChecked(event.target.checked);
    };

    // 印影作成関数
    const generateSealImage = (userName: string, position: string, companyName: string) => {
        const size = 250;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 外側の大きな円
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 6;
        ctx.stroke();

        // 会社名を外側円弧に沿って描画（多い場合は一周）
        drawTextAlongArc(
            ctx,
            companyName,
            size / 2,
            size / 2,
            size / 2 - 25,
            Math.PI * 1.1,
            Math.PI * 1.9,
            "bold 24px sans-serif",
            "#d32f2f"
        );

        // 内側の小さい円
        const innerRadius = size / 2 - 45;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, innerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 役職とユーザー名のフォントサイズを自動調整
        function fitFontSize(text: string, maxWidth: number, baseFontSize: number, minFontSize: number) {
            let fontSize = baseFontSize;

            if (!ctx) return fontSize;
            ctx.font = `bold ${fontSize}px sans-serif`;
            while (ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
                fontSize -= 1;
                ctx.font = `bold ${fontSize}px sans-serif`;
            }
            return fontSize;
        }

        const maxTextWidth = innerRadius * 1.7; // 円内に収まるよう調整（1.7は目安、必要に応じて調整）

        const positionFontSize = fitFontSize(position, maxTextWidth, 20, 10);
        ctx.font = `bold ${positionFontSize}px sans-serif`;
        ctx.fillStyle = '#d32f2f';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(position, size / 2, size / 2 - 12);

        const userNameFontSize = fitFontSize(userName, maxTextWidth, 20, 10);
        ctx.font = `bold ${userNameFontSize}px sans-serif`;
        ctx.fillText(userName, size / 2, size / 2 + 18);

        return canvas.toDataURL('image/png');
    };

    function drawTextAlongArc(
        ctx: CanvasRenderingContext2D,
        str: string,
        centerX: number,
        centerY: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        font: string,
        color: string
    ) {
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const len = str.length;
        // 円周全体を使い、等間隔で配置
        const angleRange = 2 * Math.PI;
        const angleDecrement = angleRange / len;
        // 1文字目を12時方向よりやや右（0時30分方向、約15度 = π/12）にする
        const baseAngle = -Math.PI / 2 + Math.PI / 12;

        for (let i = 0; i < len; i++) {
            const char = str[i];
            const angle = baseAngle + i * angleDecrement;
            ctx.save();
            ctx.translate(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    /***
     * 
     * 代表印を作成する
     * 
     */
    const createRepresentativeSeal = async () => {
        // テキストフィールドから値を取得
        const userName = sealUserName;
        const position = seaPosition;
        const companyName = companyDisplayName;

        // 印影画像を生成
        const sealImg = generateSealImage(userName, position, companyName);
        setSealPreview(sealImg);

        if (sealImg) {
            const base64String = sealImg.replace(/^data:image\/png;base64,/, '');
            setCreateFile(base64String);
        }
    };

    return (
        <>
            <Dialog open={true} fullWidth maxWidth='md'>
                <Box sx={{ bgcolor: 'grey.200' }}>
                    <Box sx={{ width: '100%' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '20px', fontSize: '1.5rem' }}>
                            新規に登録するユーザー情報を入力してください
                        </Typography>
                    </Box>
                    <DialogContent sx={{ bgcolor: 'white', marginLeft: '20px', marginRight: '20px', border: '1px solid lightgray', overflow: 'auto', height: '55vh' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                            <TextField
                                name="user_name"
                                label="ユーザー名"
                                variant="standard"
                                onChange={handleTextFieldChange}
                                error={!!errors.user_name}
                                helperText={errors.user_name}
                                InputProps={{
                                    style: {
                                        color: 'black',
                                        paddingLeft: '20px',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                    },
                                    inputProps: {
                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                    }
                                }}
                                sx={{ width: '100%' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                            <TextField
                                name="position"
                                label="役職"
                                variant="standard"
                                onChange={handleTextFieldChange}
                                InputProps={{
                                    style: {
                                        color: 'black',
                                        paddingLeft: '20px',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                    },
                                    inputProps: {
                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                    }
                                }}
                                sx={{ width: '100%' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                            <TextField
                                name="email"
                                label="メールアドレス"
                                variant="standard"
                                placeholder="blockchain-econtract@micros.com"
                                onChange={handleTextFieldChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                InputProps={{
                                    style: {
                                        color: 'black',
                                        paddingLeft: '20px',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                    },
                                    inputProps: {
                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                    }
                                }}
                                sx={{ width: '100%' }}
                            />
                        </Box>
                        <Box sx={{}}>
                            <Typography sx={{ borderRadius: '4px', textAlign: 'start', fontSize: '1rem', width: '100%' }}>
                                代表印
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '5px' }}>
                                <Typography sx={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', marginLeft: '20px', marginRight: '20px', fontSize: '1.2rem' }}>
                                    登録方法選択
                                </Typography>
                                <RadioGroup
                                    row
                                    value={tabValue.toString()}
                                    onChange={handleTabChange}
                                    name="sealType"
                                >
                                    <FormControlLabel
                                        value="0"
                                        control={<Radio color="primary" />}
                                        label="ファイルアップロード"
                                    />
                                    <FormControlLabel
                                        value="1"
                                        control={<Radio color="primary" />}
                                        label="新規作成"
                                    />
                                </RadioGroup>
                            </Box>
                            {tabValue === 0 && (
                                <>
                                    <Box
                                        {...getRootProps()}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: '20px',
                                            border: isDragActive ? 'dashed' : 'dotted',
                                            marginLeft: '20px',
                                            marginRight: '20px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('fileInput')?.click()}
                                    >
                                        <input {...getInputProps()} />
                                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                                            <br />
                                            ここにファイルをドロップ or クリックしてファイルを選択<br />
                                            （PNG形式のみ）<br /><br />
                                        </Box>
                                        <input
                                            id="fileInput"
                                            type="file"
                                            accept=".png"
                                            onChange={(e) => handleFileUpload(e.target.files ? Array.from(e.target.files) : [])}
                                            style={{ display: 'none' }}
                                        />
                                    </Box>
                                    {/* プレビュー表示エリア */}
                                    {preview && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                            <img src={preview} alt="Uploaded preview" style={{ maxWidth: '30%', border: '1px solid gray', borderRadius: '10px' }} />
                                        </Box>
                                    )}
                                </>
                            )}
                            {tabValue === 1 && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '5px' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isChecked}
                                                    onChange={handleCheckboxChange}
                                                    color="primary"
                                                />
                                            }
                                            label="入力情報を利用して代表印を作成する"
                                            sx={{ alignSelf: 'center' }}
                                        />
                                    </Box>
                                    <Box sx={{ backgroundColor: 'grey.200', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '10px', marginLeft: '10px', alignItems: 'center', border: '1px solid lightgray', padding: '20px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                name="company_name"
                                                value={companyDisplayName}
                                                label="会社名"
                                                variant="standard"
                                                onChange={handleTextFieldChange}
                                                InputProps={{
                                                    style: {
                                                        color: 'black',
                                                        paddingLeft: '20px',
                                                        fontSize: '20px',
                                                        fontWeight: 'bold',
                                                    },
                                                    inputProps: {
                                                        maxLength: 30 // 最大文字数を設定
                                                    }
                                                }}
                                                sx={{ width: '100%' }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                name="seal_position"
                                                value={seaPosition}
                                                label="役職"
                                                variant="standard"
                                                onChange={handleTextFieldChange}
                                                InputProps={{
                                                    style: {
                                                        color: 'black',
                                                        paddingLeft: '20px',
                                                        fontSize: '20px',
                                                        fontWeight: 'bold',
                                                    },
                                                    inputProps: {
                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                    }
                                                }}
                                                sx={{ width: '100%' }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                            <TextField
                                                name="seal_user_name"
                                                value={sealUserName}
                                                label="ユーザー名"
                                                variant="standard"
                                                onChange={handleTextFieldChange}
                                                InputProps={{
                                                    style: {
                                                        color: 'black',
                                                        paddingLeft: '20px',
                                                        fontSize: '20px',
                                                        fontWeight: 'bold',
                                                    },
                                                    inputProps: {
                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                    }
                                                }}
                                                sx={{ width: '100%' }}
                                            />
                                        </Box>
                                        <Button onClick={createRepresentativeSeal} color="warning" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkorange' } }}>登録画像を作成</Button>
                                        {sealPreview && (
                                            <>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
                                                    <img src={sealPreview} alt="印影プレビュー" style={{ maxWidth: '200px', border: '1px solid gray', borderRadius: '10px' }} />
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Button onClick={handleSubmit(onSubmit)} color="primary" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }} disabled={!isFormValid}>登録する</Button>
                            <EdocButton text='キャンセル' variant='contained' handleClick={onClose} />
                        </Box>
                    </DialogActions>
                </Box>
            </Dialog>
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SettingsSuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} handleCloseModalDialog={closeRegisterUserDialog} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    );
}

export default RegisterUserDialog;