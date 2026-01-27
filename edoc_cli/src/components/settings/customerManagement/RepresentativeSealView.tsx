import { Stack, Tooltip } from "@mui/material";
import { type MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasicTable } from "../../templates/CustomMaterialReactTable";
import CustomChip from '../../pages/common/CustomChip';
import { AppBar, Box, Button, FormControlLabel, Modal, Radio, RadioGroup, SelectChangeEvent, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import api from "../../../utils/apiAccessor";
import validationRules from "../../../utils/validationRules";
import { useForm } from "react-hook-form";
import { useDropzone } from 'react-dropzone';
import ApiProcessingDialog from "../../pages/common/ApiProcessingDialog";
import ErrorDialog from '../../pages/common/ErrorDialog';
import SuccessDialog from "../../pages/common/SuccessDialog";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

// 書類情報一覧の表の列名を示すインタフェース
interface DocumentListColumns {
    // 書類名
    user_name: string,
    // ステータス
    status: string;
};

/**
 * 社内承認中リスト
 * @returns 書類情報一覧の表
 */
const RepresentativeSealView = (props: any) => {

    // 削除ダイアログ用state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<any>(null);

    // 削除アイコン押下時
    const handleDeleteIconClick = (row: any) => {
        setRowToDelete(row.original);
        setSelectedRow(row.original);
        setDeleteDialogOpen(true);
    };

    // 削除ダイアログ閉じる
    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setRowToDelete(null);
    };

    // 削除処理
    const handleDelete = async () => {
        if (!rowToDelete) return;
        setExecuteApiDialogOpen(true);
        try {
            const res = await api.deleteUserData(rowToDelete.user_id);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('代表印削除処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            }
            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('代表印削除処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setExecuteApiDialogOpen(false);
            handleDeleteDialogClose();
        }
    };

    // 表の列を定義
    const columns = useMemo<MRT_ColumnDef<DocumentListColumns>[]>(
        () => [
            {
                accessorKey: 'user_name',
                header: '登録名',
                size: 300,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                }
            },
            {
                id: 'actions',
                header: '',
                size: 10,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                },
                Cell: ({ row }: { row: any }) => (
                    <Tooltip
                        title="削除する"
                        PopperProps={{
                            modifiers: [
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, 0],
                                    },
                                },
                            ],
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                width: '100%',
                                cursor: 'pointer',
                            }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteIconClick(row); }}
                        >
                            <DeleteIcon sx={{ fontSize: 32, color: '#d32f2f', pointerEvents: 'none' }} />
                        </Box>
                    </Tooltip>
                ),
            },
        ],
        []
    );

    const [selectedRow, setSelectedRow] = useState<any>(null);

    const navigate = useNavigate();

    const handleRowClick = (row: any) => {
        setSelectedRow(row.original);
        setEditDialogOpen(true);
    }

    // 印影ファイル情報
    const [uploadFile, setUploadFile] = useState<string>();
    const [createFile, setCreateFile] = useState<string>();

    // 印影ファイル情報
    const [sealPreview, setSealPreview] = useState<string | null>(null);
    const [uploadSealPreview, setUploadSealPreview] = useState<string | null>(null);

    const [companyDisplayName, setCompanyDisplayName] = useState('');

    const [seaPosition, setSealPosition] = useState('');
    const [sealUserName, setSealUserName] = useState('');

    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // ファイルアップロード状況
    const [fileCreated, setFileCreated] = useState(false);

    const [isFormValid, setIsFormValid] = useState(false);

    const [errors, setErrors] = useState({
        user_name: ` `,
    });

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    useEffect(() => {
        setCompanyDisplayName(props.companyInfo?.company_name || '');

        // 初回表示時やselectedRowが変わった時にバリデーションチェックを行う
        if (editDialogOpen && selectedRow) {
            const error = validateTextField('user_name', selectedRow.user_name);
            setErrors({ user_name: error });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editDialogOpen, selectedRow]);

    /***
     * 
     * 編集ダイアログ
     * 
     */
    const handleEditDialogOpen = (user: any) => {
        // setSelectedLocation(user);
        // setEditDialogOpen(true);
        // onEditDialogOpen();
    };

    const handleEditDialogClose = () => {
        setTabValue(0);
        setPreviewTabValue(0);
        setEditDialogOpen(false);
        setSealPreview('');
        setUploadSealPreview('');
        setCompanyDisplayName(props.companyInfo?.company_name || '');
        setSealPosition('');
        setSealUserName('');
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

    // 編集処理
    const handleEdit = async () => {

        setExecuteApiDialogOpen(true);

        try {
            let selectedFile = '';
            // 現在の印影を使用する
            if (previewTabValue === 0) {
                // 現在の印影を使用
                selectedFile = selectedRow.file || '';
            };

            // 新規ファイルアップロードで印影を更新する
            if (previewTabValue === 1 && tabValue === 0) {
                selectedFile = uploadFile || '';
            };

            // 新規作成で印影を更新する
            if (previewTabValue === 1 && tabValue === 1) {
                selectedFile = createFile || '';
            };

            const { user_id, ...userData } = selectedRow;
            userData.file = selectedFile;

            const res = await api.putUserData(selectedRow.user_id, userData);
            if (res.status !== api.HTTP_OK) {
                console.log("API response failed. HTTP Status: " + res.status);

                setErrorCode(res.status);
                setErrorProcess('拠点情報更新処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            }

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            console.log("RegisterCompanyDialog.tsx onSubmit: An unexpected error has occurred.");
            console.log(error);

            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('拠点情報更新処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
        }
        handleEditDialogClose();
    };

    const { control, handleSubmit, getValues, setValue } = useForm(
        {
            defaultValues: {
                title: '',
                file_name: '',
                file: '',
                user_name: '',
                company_id: props.companyInfo.company_id,
                isRepresentativeSeal: true, // 固定値
            }
        }
    );

    // タブ切り替え用のstateを追加
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: SelectChangeEvent<string>) => {
        setTabValue(event.target.value === '0' ? 0 : 1);
    };

    // タブ切り替え用のstateを追加
    const [previewTabValue, setPreviewTabValue] = useState(0);
    const handlePreviewTabChange = (event: React.SyntheticEvent, newTabValue: number) => {
        setPreviewTabValue(newTabValue);
    };

    function a11yProps(index: number) {
        return {
            id: `full-width-tab-${index}`,
            'aria-controls': `full-width-tabpanel-${index}`,
        };
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
            setSealPosition(value);
        }

        if (name === 'seal_user_name') {
            setSealUserName(value);
        }

        if (name === 'user_name') {
            // 値を更新
            setSelectedRow((prev: any) => ({
                ...prev,
                [name]: value,
            }));

            const error = validateTextField(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    const fieldNamesInJapanese: { [key: string]: string } = {
        user_name: 'ユーザー名',
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
     * 契約書アップロード
     *
     */
    // ファイル名
    const [fileName, setFileName] = useState<string | null>(null);
    // ファイル情報
    const [file, setFile] = useState<File>();
    // ファイルアップロード状況
    const [fileUploaded, setFileUploaded] = useState(false);

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
                setUploadSealPreview(base64String);
                setUploadFile(base64String);
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

        setFileCreated(true);
    };

    return (
        <>
            <BasicTable
                columns={columns}
                data={props.documentList?.filter((item: any) => item.isRepresentativeSeal === true)}
                handleRowClick={handleRowClick}
            />
            {/* ユーザー情報更新ダイアログ */}
            <Modal open={editDialogOpen}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', marginTop: '10%' }}>
                        <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', width: '100%' }}>
                            代表印情報を編集
                        </Typography>
                        <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray', overflow: 'auto', maxHeight: '70vh' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    name="user_name"
                                    value={selectedRow?.user_name}
                                    label="登録名"
                                    variant="standard"
                                    placeholder="代表取締役印"
                                    onChange={handleTextFieldChange}
                                    InputLabelProps={{ shrink: true }}
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
                            <Box sx={{ backgroundColor: 'white', paddingTop: '20px', marginBottom: '20px' }}>
                                <Typography sx={{ borderRadius: '4px', textAlign: 'start', fontSize: '1rem', width: '100%' }}>
                                    代表印
                                </Typography>
                                <Box sx={{ width: '50%', justifyContent: 'flex-end', display: 'flex', marginBottom: '10px', marginLeft: '20px' }}>
                                    <AppBar position="static">
                                        <Tabs
                                            value={previewTabValue}
                                            onChange={handlePreviewTabChange}
                                            indicatorColor="secondary"
                                            textColor="inherit"
                                            variant="fullWidth"
                                            aria-label="full width tabs example"
                                            sx={{
                                                '& .MuiTab-root': {
                                                    backgroundColor: 'lightblue', // デフォルトの背景色
                                                },
                                                '& .Mui-selected': {
                                                    backgroundColor: 'darkorange', // 選択されたタブの背景色
                                                    color: 'white', // 選択されたタブの文字色
                                                },
                                            }}
                                        >
                                            <Tab label={<Typography sx={{ fontSize: '1em', fontWeight: 'bold' }}>現在の印影で更新</Typography>}
                                                {...a11yProps(0)}
                                            />
                                            <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>印影を更新</Typography>}
                                                {...a11yProps(1)}
                                            />
                                        </Tabs>
                                    </AppBar>
                                </Box>
                                {previewTabValue === 0 && (
                                    <>
                                        {/* プレビュー表示エリア */}
                                        {preview ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                <img src={preview} alt="Uploaded preview" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                            </Box>
                                        ) : (
                                            selectedRow?.file && (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                    <img src={`data:image/png;base64,${selectedRow.file}`} alt="user" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                                                </Box>
                                            )
                                        )}
                                    </>
                                )}
                                {previewTabValue === 1 && (
                                    <>
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
                                                {uploadSealPreview && (
                                                    <>
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
                                                            <img src={`data:image/png;base64,${uploadSealPreview}`} alt="印影プレビュー" style={{ maxWidth: '200px', border: '1px solid gray', borderRadius: '10px' }} />
                                                        </Box>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {tabValue === 1 && (
                                            <>
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
                                    </>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <Button onClick={handleEdit} color="primary" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}
                                disabled={!isFormValid} >
                                更新する
                            </Button>
                            <Button onClick={handleEditDialogClose} color="primary" variant="contained" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>閉じる</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
            {/* 削除確認ダイアログ */}
            <Modal open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '50%', margin: 'auto', marginTop: '10%' }}>
                    <Typography sx={{ backgroundColor: '#0D47A1', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', margin: '10px', fontSize: '1.5rem' }}>
                        以下の代表印を削除します。よろしいですか？
                    </Typography>
                    <Box sx={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', border: '1px solid lightgray' }}>
                        <Box sx={{ backgroundColor: 'white', paddingTop: '20px', marginBottom: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', '& .Mui-disabled': { color: 'black' }, marginBottom: '20px' }}>
                                <TextField
                                    name="user_name"
                                    value={selectedRow?.user_name ?? ''}
                                    label="登録名"
                                    variant="standard"
                                    onChange={handleTextFieldChange}
                                    InputLabelProps={{ shrink: true }}
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
                            <Typography sx={{ borderRadius: '4px', textAlign: 'start', fontSize: '1rem', width: '100%' }}>
                                代表印
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                <img src={`data:image/png;base64,${selectedRow?.file}`} alt="user" style={{ maxWidth: '30%', height: 'auto', border: '1px solid gray', borderRadius: '10px' }} />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button onClick={handleDelete} color="error" variant="contained" sx={{ marginRight: '10px', width: '10em', '&:hover': { backgroundColor: 'darkred' } }}>削除する</Button>
                        <Button onClick={handleDeleteDialogClose} color="primary" variant="contained" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button>
                    </Box>
                </Box>
            </Modal>
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    )
};

export default RepresentativeSealView;