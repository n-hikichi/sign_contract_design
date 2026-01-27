import { Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Modal, Radio, RadioGroup, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import { resendSighUrlDialogStyleConcluded_one } from '../../../styles/styles';
import api from "../../../utils/apiAccessor";
import apiExecutor from "../../../utils/apiExecutor";
import validationRules from "../../../utils/validationRules";
import { representativeSealSelectType } from '../../elements/CustomPulldownMenu';
import ApiProcessingDialog, { ApiGetAdditionalDataDialog } from "../../pages/common/ApiProcessingDialog";
import ErrorDialog from '../../pages/common/ErrorDialog';
import SuccessDialog, { AutoCloseSuccessDialog } from "../../pages/common/SuccessDialog";
import { BasicTable, BasicTableWithHighlight } from "../../templates/CustomMaterialReactTable";
import { Global } from '@emotion/react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import validator from 'validator';


const getTableHeaderStyle = () => ({
    fontWeight: 'bold',
    fontSize: '16px',
    paddingTop: '10px',
    paddingBottom: '10px'
});

const getTableCellStyle = (row: any) => ({
    fontSize: '16px',
    fontWeight: 'bold',
    color: row.role === '代表者' ? 'darkred' : 'brack',
    paddingTop: '10px',
    paddingBottom: '10px',
});

const getTabBgColor = () => {

    const isValid = true;
    if (isValid) {
        return 'darkgreen'; // 成功時
    } else {
        return 'lightred'; // デフォルト
    }
};

// 書類情報一覧の表の列名を示すインタフェース
interface DocumentListColumns {
    // 書類名
    workflow_name: string,
    // 担当者
    pic: string,
    // 代表者
    authorizer: string,
    // 登録日
    // registration_date: string,
    // // 更新日
    // update_date: string,
    // 最終更新日
    last_modified: string,
};

interface User {
    email: string,
    position: string,
    user_name: string,
    file?: string,
};

// 承認者の初期値
const initialUser: User = {
    user_name: '',
    position: '',
    email: '',
    file: '',
};

const initialUsers: User[] = [];

// フォームの入力値
interface FormInput {
    company_id: string,
    workflow_id: string,
    workflow_name: string,
    workflow_type: string,
    representative_seal: string,
    representative_seal_temp: string,
    internalRepresentativeSeal_temp: string, // 画面表示用一時退避データ（代表印情報利用用）
    selectedUserSeal?: string, // 選択したユーザーの代表印 - 代表者画面
    selectedRepresentativeSeal?: string, // 選択した代表印 - 代表者画面
    approval_flow: {
        internal_pic: User,
        internal_approver: User[],
        internal_approver_temp: User,
        internal_authorizer: User,
        internal_notifier: User[],
        internal_notifier_temp: User,
    }
};

/**
 * 社内承認中リスト
 * @returns 書類情報一覧の表
 */
const WorkFlowView = (props: any) => {

    const [isModify, setIsModify] = useState<'DETAILS' | 'MODIFY' | 'CONFIRM'>('DETAILS');

    const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

    // 表の列を定義
    const columns = useMemo<MRT_ColumnDef<DocumentListColumns>[]>(
        () => [
            {
                accessorKey: 'workflow_name',
                header: '登録名',
                size: 400,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                }
            },
            {
                accessorKey: 'pic',
                header: '担当者',
                size: 100,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                },
                Cell: ({ cell }: { cell: any }) => cell.getValue()?.user_name || ''
            },
            {
                accessorKey: 'authorizer',
                header: '代表者',
                size: 100,
                muiTableHeadCellProps: {
                    sx: {
                        fontSize: '18px',
                    }
                },
                Cell: ({ cell }: { cell: any }) => cell.getValue()?.user_name || ''
            },
            // {
            //     accessorKey: 'registration_date',
            //     header: '登録日',
            //     size: 140,
            //     muiTableHeadCellProps: {
            //         sx: {
            //             fontSize: '18px',
            //         }
            //     },
            //     Cell: ({ cell }: { cell: any }) => {
            //         const value = cell.getValue();
            //         if (!value) return '';
            //         const date = new Date(value);
            //         const pad = (n: number) => n.toString().padStart(2, '0');
            //         return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
            //     }
            // },
            // {
            //     accessorKey: 'update_date',
            //     header: '更新日',
            //     size: 140,
            //     muiTableHeadCellProps: {
            //         sx: {
            //             fontSize: '18px',
            //         }
            //     },
            //     Cell: ({ cell }: { cell: any }) => {
            //         const value = cell.getValue();
            //         if (!value) return '';
            //         const date = new Date(value);
            //         const pad = (n: number) => n.toString().padStart(2, '0');
            //         return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
            //     }
            // },
            {
                accessorKey: 'last_modified',
                header: '最終更新日',
                size: 140,
                muiTableHeadCellProps: {
                    sx: { fontSize: '18px' }
                },
                Cell: ({ row }: { row: any }) => {
                    const reg = row.original.registration_date;
                    const upd = row.original.update_date;
                    if (!reg && !upd) return '';
                    const regDate = reg ? new Date(reg) : null;
                    const updDate = upd ? new Date(upd) : null;
                    let latest = regDate;
                    if (updDate && (!regDate || regDate < updDate)) latest = updDate;
                    if (!latest) return '';
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    return `${latest.getFullYear()}-${pad(latest.getMonth() + 1)}-${pad(latest.getDate())} ${pad(latest.getHours())}:${pad(latest.getMinutes())}`;
                },
                sortingFn: (rowA, rowB) => {
                    const getLatest = (row: any) => {
                        const reg = row.original.registration_date;
                        const upd = row.original.update_date;
                        const regDate = reg ? new Date(reg) : null;
                        const updDate = upd ? new Date(upd) : null;
                        // 比較用にタイムスタンプ（number型）を返す
                        if (regDate && updDate) return Math.max(regDate.getTime(), updDate.getTime());
                        if (regDate) return regDate.getTime();
                        if (updDate) return updDate.getTime();
                        return 0;
                    };
                    return getLatest(rowA) - getLatest(rowB); // 降順
                }
            }
        ],
        []
    );

    const [selectedRow, setSelectedRow] = useState<any>(null);
    const { control, setValue, getValues, handleSubmit } = useForm<FormInput>(
        {
            defaultValues: {
                company_id: props.companyInfo.company_id,
                workflow_id: '',
                workflow_name: '',
                workflow_type: 'INTERNAL',
                representative_seal: '',
                representative_seal_temp: '',
                internalRepresentativeSeal_temp: '',
                selectedUserSeal: '',
                selectedRepresentativeSeal: '',
                approval_flow: {
                    internal_pic: initialUser,
                    internal_approver: initialUsers,
                    internal_approver_temp: initialUser, // 登録リクエストを送信する際に削除する
                    internal_authorizer: initialUser,
                    internal_notifier: initialUsers,
                    internal_notifier_temp: initialUser, // 登録リクエストを送信する際に削除する
                }
            }
        }
    );

    /***
     *
     * API実行中ダイアログ
     *
     */
    const [executeApiWaitingDialog, setExecuteApiWaitingDialogOpen] = useState(false);
    const handleExecuteApiWaitingDialogClose = () => setExecuteApiWaitingDialogOpen(false);

    const handleRowClick = async (row: any) => {
        setSelectedRow(row.original);

        await fetchGetApprovalFlowData(row.original);

        setEditDialogOpen(true);
        setIsModify('DETAILS');
    };

    // 承認フロー情報を取得する
    async function fetchGetApprovalFlowData(requestInfo: any) {

        setExecuteApiWaitingDialogOpen(true);

        try {
            const requests = [
                apiExecutor.fetchGetApprovalFlow(requestInfo.company_id, requestInfo.workflow_id, requestInfo.workflow_type),
                apiExecutor.fetchGetRepresentativeSealImage(requestInfo.company_id, requestInfo.workflow_id)
            ];

            // APIを並列実行
            const responses = await Promise.all(requests);

            const approvalFlowResponse = responses[0];
            const representativeSealResponse = responses[1];

            // 代表印APIが404の場合は代表印未登録として正常扱い
            if (approvalFlowResponse.status !== 200) {
                setErrorCode(approvalFlowResponse.status);
                setErrorProcess('ユーザー情報取得処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            };

            // 代表印APIが404以外のエラーならエラーダイアログ
            if (representativeSealResponse.status !== 200 && representativeSealResponse.status !== 404) {
                setErrorCode(representativeSealResponse.status);
                setErrorProcess('ユーザー情報取得処理');
                setExecuteFailedApiDialogOpen(true);
                return;
            };

            // APIを並列実行
            const [workflow, representativeSealImage] = await Promise.all(responses.map((res: Response) => res.json()));

            // 取得したユーザー情報を設定する
            setValue('representative_seal_temp', representativeSealImage?.file || '');
            setValue('workflow_id', workflow?.workflow_id || '');
            setValue('workflow_name', workflow?.workflow_name || '');

            setValue('approval_flow.internal_pic', {
                user_name: workflow?.internal_pic?.user_name || '',
                position: workflow?.internal_pic?.position || '',
                email: workflow?.internal_pic?.email || '',
            });

            setValue('approval_flow.internal_authorizer', {
                user_name: workflow?.internal_authorizer?.user_name || '',
                position: workflow?.internal_authorizer?.position || '',
                email: workflow?.internal_authorizer?.email || '',
            });

            setWorkFlowApprovalList(workflow?.internal_approver || []);
            setWorkFlowNotifierList(workflow?.internal_notifier || []);
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('ユーザー情報取得処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiWaitingDialogOpen(false);
        }
    };

    // 承認フロー情報を修正する
    const handleModifyFlow = async () => {

        setExecuteApiDialogOpen(true);

        try {
            const {
                representative_seal_temp,
                approval_flow,
                internalRepresentativeSeal_temp,
                selectedUserSeal,
                selectedRepresentativeSeal,
                ...restValues
            } = getValues();

            const { internal_approver_temp, internal_notifier_temp, ...approvalFlowRest } = approval_flow;

            const sendValues = {
                ...restValues,
                approval_flow: approvalFlowRest,
            };

            const res = await api.putWorkflowData(getValues('company_id'), selectedRow.workflow_id, sendValues);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('承認フロー更新処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            };

            setExecuteSuccessApiDialogOpen(true);

            setHighlightedRowId(selectedRow.workflow_id);
            setTimeout(() => setHighlightedRowId(null), 15000);
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('承認フロー更新処理');
            setExecuteFailedApiDialogOpen(true);
        } finally {
            setIsModify('DETAILS');
            setExecuteApiDialogOpen(false);
            setEditDialogOpen(false);
            handleTabChange(0);

            if (props.onRegisterSuccess) {
                await props.onRegisterSuccess(); // 最新データ取得
            };
        };
    };

    /***
     *
     * 承認フロー登録画面を閉じる（登録成功時）
     *
     */
    const closeRegisterUserDialog = async () => {
        if (props.onRegisterSuccess) {
            await props.onRegisterSuccess(); // 最新データ取得
        };
    };

    // 承認フロー情報を削除する
    const handleDeleteFlow = async () => {
        setExecuteApiDialogOpen(true);

        try {
            const res = await api.deleteWorkflowData(selectedRow.company_id, selectedRow.workflow_id);
            if (res.status !== api.HTTP_OK) {
                setErrorCode(res.status);
                setErrorProcess('承認フロー削除処理');
                setExecuteFailedApiDialogOpen(true)
                return;
            };

            setExecuteSuccessApiDialogOpen(true);
        } catch (error) {
            setErrorCode(api.HTTP_INTERNAL_SERVER_ERROR);
            setErrorProcess('承認フロー削除処理');
            setExecuteFailedApiDialogOpen(true)
        } finally {
            setExecuteApiDialogOpen(false);
            setDeleteDialogOpen(false);
            setEditDialogOpen(false);

            if (props.onRegisterSuccess) {
                await props.onRegisterSuccess(); // 最新データ取得
            };
        };
    };

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [isFormValid, setIsFormValid] = useState(false);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    /***
     *
     * 承認フロー名
     *
     */
    // 「入力内容を確認する」が押せるかどうかの判定に利用する
    const [isCheckworkFlowName, setIsCheckWorkFlowName] = useState<boolean>(false);
    const handleWorkFlowNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setIsCheckWorkFlowName(value.length > 0);
    };

    /***
     *
     * 自社担当者選択
     *
     */
    const [selectedPicValue, setSelectedPicValue] = useState<string>('');
    const [selectedPicUser, setSelectedPicUser] = useState<any>(null);
    const [selectedPicUsersSealValue, setSelectedPicUsersSealValue] = useState<string>('');
    const [designateAsRepresentative, setDesignateAsRepresentative] = useState<boolean>(false);

    const handleDesignateAsRepresentative = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDesignateAsRepresentative(event.target.checked);

        if (event.target.checked) {
            setValue('approval_flow.internal_authorizer', getValues('approval_flow.internal_pic'));
            // setValue('representative_seal_temp', getValues('approval_flow.internal_pic.file') || '');
            setValue('selectedUserSeal', selectedPicUsersSealValue); // 選択した代表者の代表印として設定
            setValue('representative_seal_temp', selectedPicUsersSealValue); // 画面表示用の代表印として設定
        } else {
            setValue('approval_flow.internal_authorizer', initialUser);
            setValue('selectedUserSeal', '');
            setValue('representative_seal_temp', '');
            setValue('internalRepresentativeSeal_temp', '');
            setselectedInternalRepresentativeSealType(representativeSealSelectType[0].value)
        };
    };

    const handleSelectPicChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedPicValue(userName);

        // 選択したユーザー情報をフォームに設定する
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        const { user_name, position, email } = user;

        if (user) {
            setValue('approval_flow.internal_pic', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_pic.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };

        if (user.file) {
            // 担当者の代表印を保持する
            setSelectedPicUsersSealValue(user.file);
        };

        // // 選択したユーザー情報を取得してstateにセット
        // const user = props.userInfo.find((u: any) => u.user_name === userName);

        // if (user) {
        //     const { user_name, position, email } = user;

        //     setSelectedPicUser(user || null); // 選択したユーザー情報を退避（代表者として利用する為の情報）
        //     setValue('approval_flow.internal_pic', { user_name, position, email });
        // };
    };

    /***
     *
     * 自社代表者選択
     *
     */
    const [selecteAuthorizerValue, setSelectedAuthorizerValue] = useState<string>('');

    // 代表印
    const [selectedInternalRepresentativeSealType, setselectedInternalRepresentativeSealType] = useState(representativeSealSelectType[0].value);
    const [isAuthorizerPulldownDisabled, setIsAuthorizerPulldownDisabled] = useState(true);

    const handleSelectAuthorizerChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedAuthorizerValue(userName);

        // 選択したユーザー情報を取得してstateにセット
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        const { user_name, position, email } = user;

        if (user) {
            // setSelectedAuthorizerUser(user || null); // 選択したユーザー情報を退避
            // setValue('approval_flow.internal_authorizer', { user_name, position, email });
            // setValue('representative_seal_temp', user.file || '');

            setValue('approval_flow.internal_authorizer', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_authorizer.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };

        // ユーザー情報を利用する場合は、代表印を設定する
        if (selectedInternalRepresentativeSealType === 'useUserSeal') {
            setValue('representative_seal_temp', user.file || ''); // 画面表示用の代表印として設定
            setValue('selectedUserSeal', user.file); // 選択した代表者の代表印として設定
        };
    };



    // 代表者印選択 ラジオボタン切替時の処理
    const handleSelectChange_selectType_internal = (event: SelectChangeEvent<string>) => {

        const selectedValue = event.target.value;
        setselectedInternalRepresentativeSealType(selectedValue); // ラジオボタンに選択された値をセット

        // 'useRepresentativeSeal'の場合のみプルダウンを有効にする
        setIsAuthorizerPulldownDisabled(selectedValue !== 'useRepresentativeSeal');

        if (selectedValue === 'useUserSeal') {
            const authorizerUserFile = getValues('selectedUserSeal');
            if (authorizerUserFile) {
                setValue('representative_seal_temp', authorizerUserFile || '');
            } else {
                setValue('representative_seal_temp', ''); // ユーザー情報にファイルがない場合は空にする
            };
        };

        if (selectedValue === 'useRepresentativeSeal') {
            setValue('representative_seal_temp', getValues('internalRepresentativeSeal_temp') || '');
        };

        // if (selectedValue === 'useUserSeal') {
        //     if (isChecked_internalPic) {
        //         setValue('representative_seal_temp', selectedInternalSeal || '');
        //     } else {
        //         setValue('representative_seal_temp', ''); // チェックボックスがオフの場合は空にする
        //     };
        // };

        // if (selectedValue === 'useRepresentativeSeal') {
        //     setValue('representative_seal_temp', selectedInternalRepresentativeSealFile || '');
        //     changeInternalRepresentativeSeal();
        // };

        // // 代表者の入力フォームをチェック
        // isAuthorizerInputComplete();
    };

    // 登録済み代表印から選択する
    const handleSelectRepresentativeSealChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedAuthorizerValue(userName);
        // 選択したユーザー情報を取得してstateにセット
        const user = props.representativeInfo.find((u: any) => u.user_name === userName);
        if (user) {
            setValue('representative_seal_temp', user.file || '');
            // 選択した代表印を退避
            setValue('internalRepresentativeSeal_temp', user.file || null);
        };
    };

    /***
     *
     * 承認フロー選択
     *
     */
    const [selecteApproverValue, setSelectedApproverValue] = useState<string>('');
    // const [selectedApproverUser, setSelectedApproverUser] = useState<any>(null);
    const handleSelectApproverChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedApproverValue(userName);
        // 選択したユーザー情報を取得してstateにセット
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        const { user_name, position, email } = user || {};

        if (user) {
            setValue('approval_flow.internal_approver_temp', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_approver_temp.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };
    };

    // 承認フロー設定
    const [workFlowApprovalList, setWorkFlowApprovalList] = useState<any[]>([]);
    // const [isWorkFlowApproverAdded, setIsWorkFlowApproverAdded] = useState(false);

    // 承認者をリストに追加する
    const addInternalApprovers = () => {

        // if (!selectedApproverUser?.user_name || !selectedApproverUser?.email) {
        //     alert('氏名とメールアドレスは入力必須です。');
        //     return;
        // };

        if (!getValues('approval_flow.internal_approver_temp.user_name') || !getValues('approval_flow.internal_approver_temp.email')) {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const temp = getValues('approval_flow.internal_approver_temp');
        const approver = {
            user_name: temp.user_name,
            position: temp.position,
            email: temp.email,
        };

        // 代表者のメールアドレスと一致している場合は警告
        const authorizerEmail = getValues('approval_flow.internal_authorizer.email');
        if (approver.email && authorizerEmail && approver.email === authorizerEmail) {
            alert(`このメールアドレス（${approver.email}）のユーザーは既に代表者として追加されています。`);
            return;
        };

        // setWorkFlowApprovalList((prev) => [...prev, selectedApproverUser]);
        setWorkFlowApprovalList((prev) => {
            if (prev.some(user => user.email === approver.email)) {
                alert(`このメールアドレス（${approver.email}）のユーザーは既に承認フローに追加されています。`);
                return prev;
            };
            return [...prev, approver];
        });

        // setIsWorkFlowApproverAdded(true);
        setSelectedApproverValue('');
        // setSelectedApproverUser(null);
        setValue('approval_flow.internal_approver_temp', initialUser);
    };

    // 追加した承認者情報をクリアする
    const clearTempInternalApprover = () => {
        setWorkFlowApprovalList([]);
        // setIsWorkFlowApproverAdded(false);
    };

    /***
     *
     * 通知先選択
     *
     */
    const [selecteNotifierValue, setSelectedNotifierValue] = useState<string>('');
    // const [selectedNotifierUser, setSelectedNotifierUser] = useState<any>(null);
    const handleSelectNotifierChange = (event: SelectChangeEvent<string>) => {
        const userName = event.target.value as string;
        setSelectedNotifierValue(userName);

        // 選択したユーザー情報を取得してstateにセット
        const user = props.userInfo.find((u: any) => u.user_name === userName);
        // setSelectedNotifierUser(user || null);
        const { user_name, position, email } = user || {};

        if (user) {
            setValue('approval_flow.internal_notifier_temp', { user_name, position, email });

            // メールアドレスバリデーション
            const emailFieldName = 'approval_flow.internal_notifier_temp.email';
            setTouched(prev => ({ ...prev, [emailFieldName]: true }));
            let error = '';
            if (email && !validator.isEmail(email)) {
                error = "メールアドレスの形式が正しくありません。";
            }
            setErrors(prev => ({
                ...prev,
                [emailFieldName]: error
            }));
        };
    };

    // 通知先設定
    const [workFlowNotifierList, setWorkFlowNotifierList] = useState<any[]>([]);
    // const [isWorkFlowNotifierAdded, setIsWorkFlowNotifierAdded] = useState(false);

    // 通知先をリストに追加する
    const addInternalNotifier = () => {

        // if (!selectedNotifierUser?.user_name || !selectedNotifierUser?.email) {
        //     alert('氏名とメールアドレスは入力必須です。');
        //     return;
        // };

        if (!getValues('approval_flow.internal_notifier_temp.user_name') || !getValues('approval_flow.internal_notifier_temp.email')) {
            alert('氏名とメールアドレスは入力必須です。');
            return;
        };

        const temp = getValues('approval_flow.internal_notifier_temp');
        const notifier = {
            user_name: temp.user_name,
            position: temp.position,
            email: temp.email,
        };

        // setWorkFlowNotifierList(prevList => [...prevList, selectedNotifierUser]);
        setWorkFlowNotifierList((prev) => {
            if (prev.some(user => user.email === notifier.email)) {
                alert(`このメールアドレス（${notifier.email}）のユーザーは既に通知先に追加されています。`);
                return prev;
            };
            return [...prev, notifier];
        });

        // setIsWorkFlowNotifierAdded(true);
        setSelectedNotifierValue('');
        // setSelectedNotifierUser(null);
        setValue('approval_flow.internal_notifier_temp', initialUser);
    };

    // 追加した承認者情報をクリアする
    const clearTempInternalNotifier = () => {
        setWorkFlowNotifierList([]);
        // setIsWorkFlowNotifierAdded(false);
    };

    useEffect(() => {
        // 全てのエラーメッセージが空であるかをチェック
        const isValid = Object.values(errors).every(error => error === '');
        setIsFormValid(isValid);
    }, [errors]);

    useEffect(() => {
        // 初回表示時やselectedRowが変わった時にバリデーションチェックを行う
        if (editDialogOpen && selectedRow) {
            const error = validateTextField('workflow_name', selectedRow.workflow_name);
            setErrors({ workflow_name: error });
        }
    }, [editDialogOpen, selectedRow]);

    /***
     * 
     * 編集ダイアログ
     * 
     */
    const handleEditDialogOpen = () => {
        // setEditDialogOpen(true);
        setIsModify('MODIFY');

        if (selectedRow.workflow_name) {
            setIsCheckWorkFlowName(true);
        };
    };

    const handleReturnEditDialog = () => {
        handleTabChange(0);
        setIsModify('MODIFY');
    };

    const handleComformationDialogOpen = () => {
        // setEditDialogOpen(true);
        setIsModify('CONFIRM');
        setValue('representative_seal', getValues('representative_seal_temp'));
        setValue('approval_flow.internal_approver', workFlowApprovalList);
        setValue('approval_flow.internal_notifier', workFlowNotifierList);
    };

    const handleEditDialogClose = () => {
        setCreateNewAgreementValue(0);
        setEditDialogOpen(false);
        // setEditDialogOpen(false);
        // setSelectedLocation(null);
        // setErrors({ location_name: '', postal_code: '', city: '', address_line: '' });
    };

    const handleDeleteDialogOpen = (user: any) => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        // setEditDialogOpen(false);
        // setSelectedLocation(null);
        // setErrors({ location_name: '', postal_code: '', city: '', address_line: '' });
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

    // タブ切り替え用のstateを追加
    const [tabValue, setTabValue] = useState(0);
    // const handleTabChange = (event: SelectChangeEvent<string>) => {
    //     setTabValue(event.target.value === '0' ? 0 : 1);
    // };

    const handleTabChange = (tabIndex: number) => {
        setCreateNewAgreementValue(tabIndex);
    };

    /***
     * 
     * テキストフィールド変更処理
     * 
     */
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === 'workflow_name') {
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
     * プレビュー
     *
     */
    interface TabPanelProps {
        children?: React.ReactNode;
        dir?: string;
        index: number;
        value: number;
    }

    // ユーザーロール選択タブ制御（自社）
    function TabPanel(props: TabPanelProps) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`full-width-tabpanel-${index}`}
                aria-labelledby={`full-width-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    function a11yProps(index: number) {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    };

    /***
     *
     * 契約書アップロード
     *
     */
    const safeWorkflowInfo = Array.isArray(props.workflowInfo) ? props.workflowInfo : [];

    // 締結済み契約書から新規契約書を作成する
    const createNewAgreementTheme = useTheme();
    const [createNewAgreementValue, setCreateNewAgreementValue] = useState(0);

    const handleCreateNewAgreementValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setCreateNewAgreementValue(newValue);
    };

    // 自社代表印表示ダイアログの開閉状態
    const [representativeSealDialogOpen, setRepresentativeSealDialogOpen] = useState(false);
    const handleRepresentativeSealDialogClose = () => setRepresentativeSealDialogOpen(false);

    // ダイアログを開く関数
    const openRepresentativeSealDialog = () => {
        setRepresentativeSealDialogOpen(true);
    };

    const handleMoveInternalApprover = (from: number, to: number) => {
        setWorkFlowApprovalList(prev => {
            if (to < 0 || to >= prev.length) return prev;
            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            return updated;
        });
    };

    const handleDeleteApprover = (index: number) => {
        setWorkFlowApprovalList(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteNotifier = (index: number) => {
        setWorkFlowNotifierList(prev => prev.filter((_, i) => i !== index));
    };

    // 点滅・強調表示用のクラス名を返す関数
    const getHighlightSx = (row: any) => {
        const isHighlighted = String(row.original.workflow_id) === String(highlightedRowId);
        if (isHighlighted) {
            return {
                animation: 'highlight-blink 3s linear 0s 2, highlight-hold 15s linear 6s 1',
                backgroundColor: '#fffde7',
            };
        }
        return {
            cursor: 'pointer',
            height: '50px',
            minHeight: '50px',
            padding: '10px 0',
        };
    };

    return (
        <>
            <Global
                styles={
                    `@keyframes highlight-blink {
                        0%   { background-color: #fffde7; }
                        25%  { background-color: #ffe082; }
                        50%  { background-color: #fffde7; }
                        75%  { background-color: #ffe082; }
                        100% { background-color: #fffde7; }
                    }
                    @keyframes highlight-hold {
                        0%   { background-color: #fffde7; }
                        100% { background-color: #fffde7; }
                    }`
                }
            />
            <BasicTableWithHighlight
                columns={columns}
                data={safeWorkflowInfo}
                handleRowClick={handleRowClick}
                muiTableBodyRowProps={({ row }) => ({
                    onClick: () => handleRowClick(row),
                    sx: getHighlightSx(row)
                })}
            />
            {/* ユーザー情報更新ダイアログ */}
            <Modal open={editDialogOpen}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh', marginTop: '2.5vh' }}>
                    {isModify === 'DETAILS' && (
                        <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '100%', maxWidth: 'xl', height: '100%' }}>
                            <Typography sx={{ backgroundColor: 'darkblue', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', fontSize: '1.5rem', width: '100%' }}>
                                {selectedRow?.workflow_name}
                            </Typography>
                            {/* <Typography sx={{ padding: '8px', borderRadius: '4px', color: 'darkred', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem', width: '100%' }}>
                                承認フローを修正する場合は、「修正する」ボタンを押してください。
                            </Typography> */}
                            <Box sx={{ display: 'flex', justifyContent: 'end', marginTop: '20px', marginBottom: '5px' }}>
                                <Button onClick={handleEditDialogOpen} color="success" variant="contained" sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkgreen' } }} >修正する</Button>
                                <Button onClick={handleDeleteDialogOpen} color="error" variant="contained" sx={{ width: '12em', '&:hover': { backgroundColor: 'darkred' } }} >削除する</Button>
                            </Box>
                            <Box sx={{ height: '80%', width: '100%', overflowY: 'auto' }}>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        担当者
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '100%' }}>
                                            <TextField
                                                value={getValues('approval_flow.internal_pic.user_name') || '---'}
                                                label="氏名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_pic.position') || '---'}
                                                label="役職"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_pic.email') || '---'}
                                                label="メールアドレス"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        代表者
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '70%' }}>
                                            <TextField
                                                value={getValues('approval_flow.internal_authorizer.user_name') || '---'}
                                                label="氏名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_authorizer.position') || '---'}
                                                label="役職"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_authorizer.email') || '---'}
                                                label="メールアドレス"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                width: '30%',
                                                minWidth: '180px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '10px',
                                                border: '1px solid lightgray',
                                                borderRadius: '8px',
                                                marginLeft: '20px',
                                                backgroundColor: '#fafafa',
                                                height: '100%'
                                            }}
                                        >
                                            {getValues('representative_seal_temp') ? (
                                                <img
                                                    src={`data:image/png;base64,${getValues('representative_seal_temp')}`}
                                                    alt="代表印"
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                                />
                                            ) : (
                                                <Typography sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>
                                                    代表印がありません
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        承認フロー
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        {(workFlowApprovalList.length === 0 &&
                                            !(
                                                (getValues('approval_flow.internal_authorizer.user_name') || '').trim() ||
                                                (getValues('approval_flow.internal_authorizer.position') || '').trim() ||
                                                (getValues('approval_flow.internal_authorizer.email') || '').trim()
                                            )
                                        ) ? (
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                    承認フローは登録されていません
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: '100%' }}>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ ...getTableHeaderStyle(), width: '15%' }}></TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {workFlowApprovalList?.map((row: any, index: any) => (
                                                                <TableRow
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row" sx={getTableCellStyle(row)}></TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                            {(
                                                                getValues('approval_flow.internal_authorizer.user_name') ||
                                                                getValues('approval_flow.internal_authorizer.position') ||
                                                                getValues('approval_flow.internal_authorizer.email')
                                                            ) && (
                                                                    <TableRow
                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0, backgroundColor: 'yellow' } }}
                                                                    >
                                                                        <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} ></TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.user_name') || ''}</TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.position') || ''}</TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.email') || ''}</TableCell>
                                                                    </TableRow>
                                                                )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        通知先
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        {workFlowNotifierList?.length == 0 ? (
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                    通知先は登録されていません
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: '100%' }}>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                            <TableRow>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {workFlowNotifierList?.map((row: any, index: any) => (
                                                                <TableRow
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box >
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <Button onClick={handleEditDialogClose} color="primary" variant="contained" sx={{ width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}>閉じる</Button>
                            </Box>
                        </Box>
                    )}
                    {isModify === 'MODIFY' && (
                        <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '100%', maxWidth: 'xl', height: '100%' }}>
                            <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', width: '100%' }}>
                                承認フローを修正してください
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: isCheckworkFlowName ? 'black' : 'darkred' }}>
                                    登録名
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: isCheckworkFlowName ? 'white' : '#FFF8E1', borderRadius: '4px', marginBottom: '10px', border: isCheckworkFlowName ? '0.5px solid lightgray' : '0.5px solid darkred' }}>
                                <Controller
                                    name="workflow_name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="workflow_name"
                                            variant="standard"
                                            sx={{ width: '100%' }}
                                            placeholder="承認フローの登録名を入力してください"
                                            InputProps={{
                                                style: {
                                                    paddingLeft: '20px',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold'
                                                },
                                                inputProps: {
                                                    maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                }
                                            }}
                                            InputLabelProps={{ shrink: true }}
                                            onChange={e => {
                                                field.onChange(e);
                                                const value = e.target.value;
                                                setIsCheckWorkFlowName(value.length > 0); // 文字列が入っているかチェック
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                            <Box sx={{ marginBottom: '5px' }}>
                                <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', flex: 1 }}>
                                            <Button
                                                onClick={handleEditDialogClose}
                                                color="error"
                                                variant="outlined"
                                                sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightred' } }}
                                            >
                                                キャンセル
                                            </Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            {/* <Tabs
                                            value={createNewAgreementValue}
                                            onChange={handleCreateNewAgreementValueChange}
                                            textColor="inherit"
                                            variant="scrollable"
                                            aria-label="Vertical tabs example"
                                            sx={{
                                                '& .MuiTab-root': {
                                                    backgroundColor: getTabBgColor(),
                                                    color: 'black',
                                                },
                                                '& .Mui-selected': {
                                                    backgroundColor: getTabBgColor(),
                                                    color: 'white', // 選択されたタブの文字色
                                                },
                                            }}
                                        >
                                            <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>担当者</Typography>}
                                                {...a11yProps(0)}
                                            />
                                            <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>代表者</Typography>}
                                                {...a11yProps(1)}
                                            />
                                            <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>承認フロー</Typography>}
                                                {...a11yProps(2)}
                                            />
                                            <Tab label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>通知先</Typography>}
                                                {...a11yProps(3)}
                                            />
                                        </Tabs> */}
                                            <Tabs
                                                value={createNewAgreementValue}
                                                textColor="inherit"
                                                variant="scrollable"
                                                aria-label="Vertical tabs example"
                                                sx={{
                                                    '& .MuiTab-root': {
                                                        backgroundColor: (theme) => {
                                                            switch (createNewAgreementValue) {
                                                                case 0: return '#e3f2fd'; // 担当者タブ
                                                                case 1: return '#e8f5e9'; // 代表者タブ
                                                                case 2: return '#fffde7'; // 承認フロータブ
                                                                case 3: return '#fce4ec'; // 通知先タブ
                                                                default: return 'white';
                                                            }
                                                        },
                                                        color: 'black',
                                                        cursor: 'default',
                                                    },
                                                    '& .Mui-selected': {
                                                        backgroundColor: (theme) => {
                                                            switch (createNewAgreementValue) {
                                                                case 0: return '#1976d2'; // 担当者タブ
                                                                case 1: return '#388e3c'; // 代表者タブ
                                                                case 2: return '#fbc02d'; // 承認フロータブ
                                                                case 3: return '#d81b60'; // 通知先タブ
                                                                default: return 'darkblue';
                                                            }
                                                        },
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        cursor: 'default',
                                                    },
                                                }}
                                            >
                                                <Tab
                                                    label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>担当者</Typography>}
                                                    {...a11yProps(0)}
                                                    disabled={createNewAgreementValue === 0 ? false : !isFormValid}
                                                    disableRipple
                                                    sx={{
                                                        minWidth: 120,
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                />
                                                <Tab
                                                    label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>代表者</Typography>}
                                                    {...a11yProps(1)}
                                                    disabled={createNewAgreementValue === 1 ? false : !isFormValid}
                                                    disableRipple
                                                    sx={{
                                                        minWidth: 120,
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                />
                                                <Tab
                                                    label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>承認フロー</Typography>}
                                                    {...a11yProps(2)}
                                                    disabled={createNewAgreementValue === 2 ? false : !isFormValid}
                                                    disableRipple
                                                    sx={{
                                                        minWidth: 120,
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                />
                                                <Tab
                                                    label={<Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>通知先</Typography>}
                                                    {...a11yProps(3)}
                                                    disabled={createNewAgreementValue === 3 ? false : !isFormValid}
                                                    disableRipple
                                                    sx={{
                                                        minWidth: 120,
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                />
                                            </Tabs>
                                        </Box>
                                    </Box>
                                </AppBar>
                            </Box>
                            <Box sx={{ height: '600px', width: '100%', overflowY: 'auto', border: '1px solid lightgray', backgroundColor: 'white' }}>
                                <TabPanel value={createNewAgreementValue} index={0} dir={createNewAgreementTheme.direction}>
                                    <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', margin: 0, borderRadius: '4px' }}>
                                        {/* <Box sx={{ width: '100%' }}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>担当者</Typography>
                                        </Box> */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selectedPicValue}
                                                        onChange={handleSelectPicChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                    >
                                                        {props?.userInfo?.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Controller
                                                        name="approval_flow.internal_pic.user_name"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_pic.user_name"
                                                                label="氏名"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    },
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="approval_flow.internal_pic.position"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_pic.position"
                                                                label="役職"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    {/* バリデーション（入力規則チェック）を実装する */}
                                                    <Controller
                                                        name="approval_flow.internal_pic.email"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_pic.email"
                                                                label="メールアドレス"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                value={field.value ?? ''}
                                                                onBlur={e => {
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    field.onBlur();
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (touched[field.name]) {
                                                                        if (value && !validator.isEmail(value)) {
                                                                            error = "メールアドレスの形式が正しくありません。";
                                                                        }
                                                                        setErrors(prev => ({
                                                                            ...prev,
                                                                            [field.name]: error
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', borderRadius: '4px' }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={designateAsRepresentative}
                                                        onChange={handleDesignateAsRepresentative}
                                                        color="primary"
                                                    />
                                                }
                                                label="このユーザーを承認フローの代表者として設定する"
                                                sx={{ mt: 2, fontWeight: 'bold' }}
                                            />
                                        </Box>
                                    </Box>
                                </TabPanel>
                                <TabPanel value={createNewAgreementValue} index={1} dir={createNewAgreementTheme.direction}>
                                    <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                        {/* <Box sx={{ width: '100%' }}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>代表者</Typography>
                                        </Box> */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selecteAuthorizerValue}
                                                        onChange={handleSelectAuthorizerChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                        disabled={selectedInternalRepresentativeSealType === 'useRepresentativeSeal'}
                                                    >
                                                        {props?.userInfo?.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Controller
                                                        name="approval_flow.internal_authorizer.user_name"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_authorizer.user_name"
                                                                label="氏名"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="approval_flow.internal_authorizer.position"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_authorizer.position"
                                                                label="役職"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="approval_flow.internal_authorizer.email"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_authorizer.email"
                                                                label="メールアドレス"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                value={field.value ?? ''}
                                                                onBlur={e => {
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    field.onBlur();
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (touched[field.name]) {
                                                                        if (value && !validator.isEmail(value)) {
                                                                            error = "メールアドレスの形式が正しくありません。";
                                                                        }
                                                                        setErrors(prev => ({
                                                                            ...prev,
                                                                            [field.name]: error
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box bgcolor="white" sx={{ width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '100%' }}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>代表印</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ width: '50%', minWidth: '200px', marginRight: '20px' }}>
                                                {props.userInfo?.length > 0 ? (
                                                    <>
                                                        <Box sx={{ display: 'flex', width: '100%', marginLeft: '5%' }}>
                                                            <FormControl component="fieldset" sx={{ width: '100%' }}>
                                                                <RadioGroup
                                                                    value={selectedInternalRepresentativeSealType}
                                                                    onChange={handleSelectChange_selectType_internal}
                                                                    sx={{ width: '100%' }}
                                                                >
                                                                    {representativeSealSelectType?.map((pref) => (
                                                                        <FormControlLabel
                                                                            key={pref.value}
                                                                            value={pref.value}
                                                                            control={<Radio />}
                                                                            label={pref.label}
                                                                            sx={{ fontSize: '20px', fontWeight: 'bold' }}
                                                                        />
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                        </Box>
                                                        <FormControl variant="standard" sx={{ width: '100%' }}>
                                                            <InputLabel id='pulldown'></InputLabel>
                                                            <Select
                                                                id='pulldown'
                                                                value={selecteAuthorizerValue ?? ''}
                                                                onChange={handleSelectRepresentativeSealChange}
                                                                sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                                disabled={isAuthorizerPulldownDisabled}
                                                            >
                                                                {props.representativeInfo?.map((user: any) => (
                                                                    <MenuItem key={user.user_name} value={user.user_name}>
                                                                        {user.user_name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography>選択可能な代表印が登録されていません</Typography>
                                                    </>
                                                )}
                                            </Box>
                                            <Box sx={{ width: '50%', padding: '10px', borderRadius: '4px', justifyContent: 'end', border: '1px solid lightgray' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '300px' }}>
                                                    {getValues('representative_seal_temp') ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '300px' }}>
                                                            <img src={`data:image/png;base64,${getValues('representative_seal_temp')}`} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', width: '100%', height: '100%' }}>
                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'darkred' }}>
                                                                代表印が選択されていません<br />
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </TabPanel>
                                <TabPanel value={createNewAgreementValue} index={2} dir={createNewAgreementTheme.direction}>
                                    <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                        {/* <Box sx={{ width: '100%' }}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>承認フロー</Typography>
                                        </Box> */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selecteApproverValue ?? ''}
                                                        onChange={handleSelectApproverChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                    >
                                                        {props?.userInfo?.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Controller
                                                        name="approval_flow.internal_approver_temp.user_name"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_approver_temp.user_name"
                                                                label="氏名"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    },
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="approval_flow.internal_approver_temp.position"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_approver_temp.position"
                                                                label="役職"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    {/* バリデーション（入力規則チェック）を実装する */}
                                                    <Controller
                                                        name="approval_flow.internal_approver_temp.email"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_approver_temp.email"
                                                                label="メールアドレス"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onBlur={e => {
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    field.onBlur();
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (touched[field.name]) {
                                                                        if (value && !validator.isEmail(value)) {
                                                                            error = "メールアドレスの形式が正しくありません。";
                                                                        }
                                                                        setErrors(prev => ({
                                                                            ...prev,
                                                                            [field.name]: error
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Box>
                                            {/* <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <TextField
                                                        value={selectedApproverUser?.user_name || ''}
                                                        id="remand.user_name"
                                                        label="氏名"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        onChange={e => setSelectedApproverUser({ ...selectedApproverUser, user_name: e.target.value })}
                                                    />
                                                    <TextField
                                                        value={selectedApproverUser?.position || ''}
                                                        id="remand.position"
                                                        label="役職"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        onChange={e => setSelectedApproverUser({ ...selectedApproverUser, position: e.target.value })}
                                                    />
                                                    <TextField
                                                        value={selectedApproverUser?.email || ''}
                                                        id="remand.email"
                                                        label="メールアドレス"
                                                        variant="standard"
                                                        sx={readOnlyTextFieldStyle}
                                                        onChange={e => setSelectedApproverUser({ ...selectedApproverUser, email: e.target.value })}
                                                    />
                                                </Box>
                                            </Box> */}
                                        </Box>
                                    </Box>
                                    <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                        <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addInternalApprovers} >追加する</Button>
                                        <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempInternalApprover} disabled={workFlowApprovalList.length === 0}>クリア</Button>
                                    </Box>
                                    <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                        {(workFlowApprovalList.length === 0 &&
                                            !(
                                                (getValues('approval_flow.internal_authorizer.user_name') || '').trim() ||
                                                (getValues('approval_flow.internal_authorizer.position') || '').trim() ||
                                                (getValues('approval_flow.internal_authorizer.email') || '').trim()
                                            )
                                        ) ? (
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                    承認フローは登録されていません
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: '100%' }}>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                            <TableRow>
                                                                {/* <TableCell sx={{ ...getTableHeaderStyle(), width: '10%' }}>承認順番</TableCell> */}
                                                                <TableCell align="left" sx={{ ...getTableHeaderStyle(), width: '10%' }}></TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '5%' }}></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {workFlowApprovalList?.map((row: any, index: any) => (
                                                                <TableRow
                                                                    key={index}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    {/* <TableCell component="th" scope="row" sx={getTableCellStyle(row)}>{index + 1}</TableCell> */}
                                                                    <TableCell align="center" sx={{ padding: 0 }}>
                                                                        <IconButton
                                                                            size="medium"
                                                                            onClick={() => handleMoveInternalApprover(index, index - 1)}
                                                                            disabled={index === 0}
                                                                            sx={{
                                                                                backgroundColor: '#ffe0b2',
                                                                                marginRight: '10px',
                                                                                '&:hover': { backgroundColor: '#ffb74d' },
                                                                                paddingTop: 0,
                                                                                paddingBottom: 0,
                                                                                minHeight: 0,
                                                                                height: '32px',
                                                                                width: '32px',
                                                                                lineHeight: 1,
                                                                                '& .MuiSvgIcon-root': {
                                                                                    padding: 0,
                                                                                    margin: 0,
                                                                                    minHeight: 0,
                                                                                    height: '20px',
                                                                                }
                                                                            }}
                                                                        >
                                                                            <ArrowUpwardIcon fontSize="medium" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="medium"
                                                                            onClick={() => handleMoveInternalApprover(index, index + 1)}
                                                                            disabled={index === workFlowApprovalList.length - 1}
                                                                            sx={{
                                                                                backgroundColor: '#e3f2fd',
                                                                                '&:hover': { backgroundColor: '#90caf9' },
                                                                                paddingTop: 0,
                                                                                paddingBottom: 0,
                                                                                minHeight: 0,
                                                                                height: '32px',
                                                                                width: '32px',
                                                                                lineHeight: 1,
                                                                                '& .MuiSvgIcon-root': {
                                                                                    padding: 0,
                                                                                    margin: 0,
                                                                                    minHeight: 0,
                                                                                    height: '20px',
                                                                                }
                                                                            }}
                                                                        >
                                                                            <ArrowDownwardIcon fontSize="medium" />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                    <TableCell align="center" sx={{ padding: 0 }}>
                                                                        <IconButton
                                                                            size="medium"
                                                                            onClick={() => handleDeleteApprover(index)}
                                                                            sx={{
                                                                                backgroundColor: '#ffebee',
                                                                                marginLeft: '10px',
                                                                                '&:hover': { backgroundColor: '#ffcdd2' },
                                                                                padding: 0,
                                                                                minHeight: 0,
                                                                                height: '32px',
                                                                                width: '32px',
                                                                                lineHeight: 1,
                                                                                '& .MuiSvgIcon-root': {
                                                                                    padding: 0,
                                                                                    margin: 0,
                                                                                    minHeight: 0,
                                                                                    height: '20px',
                                                                                }
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="medium" />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                            {(
                                                                getValues('approval_flow.internal_authorizer.user_name') ||
                                                                getValues('approval_flow.internal_authorizer.position') ||
                                                                getValues('approval_flow.internal_authorizer.email')
                                                            ) && (
                                                                    <TableRow
                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0, backgroundColor: 'yellow' } }}
                                                                    >
                                                                        <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} ></TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.user_name') || ''}</TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.position') || ''}</TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.email') || ''}</TableCell>
                                                                    </TableRow>
                                                                )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}
                                    </Box>
                                </TabPanel>
                                <TabPanel value={createNewAgreementValue} index={3} dir={createNewAgreementTheme.direction}>
                                    <Box bgcolor="white" sx={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                        {/* <Box sx={{ width: '100%' }}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>通知先</Typography>
                                        </Box> */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                            <Box sx={{ width: '30%', minWidth: '200px', marginRight: '20px' }}>
                                                <FormControl variant="standard" sx={{ width: '100%' }}>
                                                    <InputLabel id='pulldown'></InputLabel>
                                                    <Select
                                                        id='pulldown'
                                                        value={selecteNotifierValue ?? ''}
                                                        onChange={handleSelectNotifierChange}
                                                        sx={{ fontWeight: 'bold', fontSize: '20px' }}
                                                    >
                                                        {props.userInfo.map((user: any) => (
                                                            <MenuItem key={user.user_name} value={user.user_name}>
                                                                {user.user_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <Box sx={{ width: '70%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Controller
                                                        name="approval_flow.internal_notifier_temp.user_name"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_notifier_temp.user_name"
                                                                label="氏名"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    },
                                                                    inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="approval_flow.internal_notifier_temp.position"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_notifier_temp.position"
                                                                label="役職"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            // onBlur={handleBlurForPicInputForm}
                                                            />
                                                        )}
                                                    />
                                                    {/* バリデーション（入力規則チェック）を実装する */}
                                                    <Controller
                                                        name="approval_flow.internal_notifier_temp.email"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                id="approval_flow.internal_notifier_temp.email"
                                                                label="メールアドレス"
                                                                variant="standard"
                                                                sx={{ width: '100%' }}
                                                                InputProps={{
                                                                    style: {
                                                                        paddingLeft: '20px',
                                                                        fontSize: '20px',
                                                                        fontWeight: 'bold'
                                                                    }, inputProps: {
                                                                        maxLength: validationRules.TEXT_FIELD_DEFAULT_LIMIT // 最大文字数を設定
                                                                    }
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                                error={!!touched[field.name] && !!errors[field.name]}
                                                                helperText={touched[field.name] ? errors[field.name] : ''}
                                                                onBlur={e => {
                                                                    setTouched(prev => ({ ...prev, [field.name]: true }));
                                                                    field.onBlur();
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (value && !validator.isEmail(value)) {
                                                                        error = "メールアドレスの形式が正しくありません。";
                                                                    }
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        [field.name]: error
                                                                    }));
                                                                }}
                                                                onChange={e => {
                                                                    field.onChange(e);
                                                                    const value = e.target.value;
                                                                    let error = '';
                                                                    if (touched[field.name]) {
                                                                        if (value && !validator.isEmail(value)) {
                                                                            error = "メールアドレスの形式が正しくありません。";
                                                                        }
                                                                        setErrors(prev => ({
                                                                            ...prev,
                                                                            [field.name]: error
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box bgcolor="grey.200" sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px', marginBottom: '20px', padding: '10px', borderRadius: '4px' }}>
                                        <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={addInternalNotifier} >追加する</Button>
                                        <Button variant="contained" color="primary" sx={{ width: '8em', marginRight: '10px', '&:hover': { backgroundColor: 'darkblue' } }} onClick={clearTempInternalNotifier} disabled={workFlowNotifierList?.length == 0}>クリア</Button>
                                    </Box>
                                    <Box bgcolor='white' sx={{ marginBottom: '20px' }}>
                                        {workFlowNotifierList?.length == 0 ? (
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                    通知先は登録されていません
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: '100%' }}>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                            <TableRow>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '5%' }}></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {workFlowNotifierList?.map((row: any, index: any) => (
                                                                <TableRow
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                    <TableCell align="center" sx={{ padding: 0 }}>
                                                                        <IconButton
                                                                            size="medium"
                                                                            onClick={() => handleDeleteNotifier(index)}
                                                                            sx={{
                                                                                backgroundColor: '#ffebee',
                                                                                marginLeft: '10px',
                                                                                '&:hover': { backgroundColor: '#ffcdd2' },
                                                                                padding: 0,
                                                                                minHeight: 0,
                                                                                height: '32px',
                                                                                width: '32px',
                                                                                lineHeight: 1,
                                                                                '& .MuiSvgIcon-root': {
                                                                                    padding: 0,
                                                                                    margin: 0,
                                                                                    minHeight: 0,
                                                                                    height: '20px',
                                                                                }
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="medium" />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}
                                    </Box>
                                </TabPanel>
                            </Box >
                            {/* <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <Button onClick={handleComformationDialogOpen} color="primary" variant="contained" sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }} disabled={!isCheckworkFlowName} >入力内容を確認する</Button>
                                <Button onClick={handleEditDialogClose} color="primary" variant="contained" sx={{ width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button>
                            </Box> */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                {createNewAgreementValue === 0 && (
                                    <>
                                        {/* <Button
                                            onClick={handleEditDialogClose}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}
                                        >
                                            キャンセル
                                        </Button> */}
                                        <Button
                                            onClick={() => handleTabChange(1)}
                                            color="primary"
                                            variant="contained"
                                            sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                        // disabled={!isFormValid}
                                        >
                                            次へ
                                        </Button>
                                    </>
                                )}
                                {createNewAgreementValue === 1 && (
                                    <>
                                        <Button
                                            onClick={() => handleTabChange(0)}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}
                                        >
                                            前へ戻る
                                        </Button>
                                        <Button
                                            onClick={() => handleTabChange(2)}
                                            color="primary"
                                            variant="contained"
                                            sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                        // disabled={!isFormValid}
                                        >
                                            次へ
                                        </Button>
                                    </>
                                )}
                                {createNewAgreementValue === 2 && (
                                    <>
                                        <Button
                                            onClick={() => handleTabChange(1)}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}
                                        >
                                            前へ戻る
                                        </Button>
                                        <Button
                                            onClick={() => handleTabChange(3)}
                                            color="primary"
                                            variant="contained"
                                            sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                        // disabled={!isFormValid}
                                        >
                                            次へ
                                        </Button>
                                    </>
                                )}
                                {createNewAgreementValue === 3 && (
                                    <>
                                        <Button
                                            onClick={() => handleTabChange(2)}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightblue' } }}
                                        >
                                            前へ戻る
                                        </Button>
                                        <Button
                                            onClick={handleComformationDialogOpen}
                                            color="primary"
                                            variant="contained"
                                            sx={{
                                                marginRight: '10px',
                                                width: '12em',
                                                backgroundColor: '#d81b60',
                                                color: 'white',
                                                '&:hover': { backgroundColor: '#ad174a' }
                                            }}
                                            disabled={!isCheckworkFlowName}
                                        >
                                            入力内容を確認する
                                        </Button>
                                    </>
                                )}
                                {/* <Button
                                    onClick={handleComformationDialogOpen}
                                    color="primary"
                                    variant="contained"
                                    sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                    disabled={!isFormValid}
                                >
                                    入力内容を確認する
                                </Button>
                                <Button
                                    onClick={handleEditDialogClose}
                                    color="primary"
                                    variant="contained"
                                    sx={{ width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    onClick={() => handleTabChange(0)}
                                    variant="outlined"
                                    sx={{ marginLeft: '10px' }}
                                >
                                    担当者
                                </Button>
                                <Button
                                    onClick={() => handleTabChange(1)}
                                    variant="outlined"
                                    sx={{ marginLeft: '10px' }}
                                >
                                    代表者
                                </Button>
                                <Button
                                    onClick={() => handleTabChange(2)}
                                    variant="outlined"
                                    sx={{ marginLeft: '10px' }}
                                >
                                    承認フロー
                                </Button>
                                <Button
                                    onClick={() => handleTabChange(3)}
                                    variant="outlined"
                                    sx={{ marginLeft: '10px' }}
                                >
                                    通知先
                                </Button> */}
                            </Box>
                        </Box>
                    )}
                    {isModify === 'CONFIRM' && (
                        <Box sx={{ padding: '20px', backgroundColor: 'grey.200', borderRadius: '4px', boxShadow: 24, width: '100%', maxWidth: 'xl', height: '100%' }}>
                            <Typography sx={{ backgroundColor: 'darkgreen', padding: '8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', fontSize: '1.5rem', width: '100%' }}>
                                {selectedRow?.workflow_name}
                            </Typography>
                            <Typography sx={{ padding: '8px', borderRadius: '4px', color: 'darkred', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem', width: '100%' }}>
                                こちらの内容で修正します。よろしいですか？
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', flex: 1, marginBottom: '5px' }}>
                                <Button
                                    onClick={handleEditDialogClose}
                                    color="error"
                                    variant="outlined"
                                    sx={{ width: '12em', marginRight: '10px', '&:hover': { backgroundColor: 'lightred' } }}
                                >
                                    キャンセル
                                </Button>
                            </Box>
                            <Box sx={{ height: '77%', width: '100%', overflowY: 'auto' }}>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        担当者
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '100%' }}>
                                            <TextField
                                                value={getValues('approval_flow.internal_pic.user_name')}
                                                label="氏名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_pic.position')}
                                                label="役職"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_pic.email')}
                                                label="メールアドレス"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        代表者
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        <Box sx={{ width: '70%' }}>
                                            <TextField
                                                value={getValues('approval_flow.internal_authorizer.user_name')}
                                                label="氏名"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_authorizer.position')}
                                                label="役職"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                            <TextField
                                                value={getValues('approval_flow.internal_authorizer.email')}
                                                label="メールアドレス"
                                                variant="standard"
                                                sx={readOnlyTextFieldStyle}
                                                disabled={true}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                width: '30%',
                                                minWidth: '180px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '10px',
                                                border: '1px solid lightgray',
                                                borderRadius: '8px',
                                                marginLeft: '20px',
                                                backgroundColor: '#fafafa',
                                                height: '100%'
                                            }}
                                        >
                                            {getValues('representative_seal_temp') ? (
                                                <img
                                                    src={`data:image/png;base64,${getValues('representative_seal_temp')}`}
                                                    alt="代表印"
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                                />
                                            ) : (
                                                <Typography sx={{ color: 'darkred', fontWeight: 'bold', fontSize: '16px' }}>
                                                    代表印がありません
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        承認フロー
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        {(workFlowApprovalList.length === 0 &&
                                            !(
                                                (getValues('approval_flow.internal_authorizer.user_name') || '').trim() ||
                                                (getValues('approval_flow.internal_authorizer.position') || '').trim() ||
                                                (getValues('approval_flow.internal_authorizer.email') || '').trim()
                                            )
                                        ) ? (
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                    承認フローは登録されていません
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: '100%' }}>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ ...getTableHeaderStyle(), width: '15%' }}></TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {workFlowApprovalList?.map((row: any, index: any) => (
                                                                <TableRow
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row" sx={getTableCellStyle(row)}></TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                            {(
                                                                getValues('approval_flow.internal_authorizer.user_name') ||
                                                                getValues('approval_flow.internal_authorizer.position') ||
                                                                getValues('approval_flow.internal_authorizer.email')
                                                            ) && (
                                                                    <TableRow
                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0, backgroundColor: 'yellow' } }}
                                                                    >
                                                                        <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} ></TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.user_name') || ''}</TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.position') || ''}</TableCell>
                                                                        <TableCell align="right" sx={{ fontSize: '16px', fontWeight: 'bold', color: 'darkred', paddingTop: '10px', paddingBottom: '10px' }} >{getValues('approval_flow.internal_authorizer.email') || ''}</TableCell>
                                                                    </TableRow>
                                                                )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                <Box bgcolor="white" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', marginBottom: '10px', borderRadius: '4px', border: '1px solid lightgray' }}>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                                        通知先
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', padding: '10px', borderRadius: '4px' }}>
                                        {workFlowNotifierList?.length == 0 ? (
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px', color: 'darkred', fontSize: '1.2rem' }}>
                                                    通知先は登録されていません
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: '100%' }}>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: '100%', border: '1px solid lightgray' }} aria-label="simple table">
                                                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                                            <TableRow>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '20%' }}>氏名</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '25%' }}>役職</TableCell>
                                                                <TableCell align="right" sx={{ ...getTableHeaderStyle(), width: '40%' }}>メールアドレス</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {workFlowNotifierList?.map((row: any, index: any) => (
                                                                <TableRow
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.user_name}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.position}</TableCell>
                                                                    <TableCell align="right" sx={getTableCellStyle(row)}>{row.email}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box >
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <Button onClick={handleModifyFlow} color="error" variant="contained" sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkred' } }} >実行する</Button>
                                <Button onClick={handleReturnEditDialog} color="primary" variant="contained" sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}>戻る</Button>
                                {/* <Button onClick={handleEditDialogClose} color="primary" variant="contained" sx={{ width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button> */}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal >
            < div >
                <Modal open={deleteDialogOpen}>
                    <Box sx={{ ...resendSighUrlDialogStyleConcluded_one, backgroundColor: 'grey.200', position: 'relative', height: '20vh' }}>
                        <Typography sx={{ padding: '8px', borderRadius: '4px', color: 'darkred', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5em', marginTop: '20px', marginBottom: '30px' }}>
                            承認フローを削除します。よろしいですか？
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={handleDeleteFlow} color="error" variant="contained" sx={{ marginRight: '10px', width: '12em', '&:hover': { backgroundColor: 'darkred' } }} disabled={!isFormValid} >実行する</Button>
                            <Button onClick={handleDeleteDialogClose} color="primary" variant="contained" sx={{ width: '12em', '&:hover': { backgroundColor: 'darkblue' } }}>キャンセル</Button>
                        </Box>
                    </Box>
                </Modal >
            </div >
            <ApiGetAdditionalDataDialog open={executeApiWaitingDialog} handleClose={handleExecuteApiWaitingDialogClose} />
            <ApiProcessingDialog open={executeApiDialog} handleClose={handleExecuteApiDialogClose} />
            {/* <SuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} /> */}
            <AutoCloseSuccessDialog open={executeSuccessApiDialog} handleClose={handleExecuteSuccessApiDialogClose} handleCloseModalDialog={closeRegisterUserDialog} />
            <ErrorDialog open={executeFailedApiDialog} handleClose={handleExecuteFailedApiDialogClose} errorCode={errorCode} errorProcess={errorProcess} />
        </>
    )
};

export default WorkFlowView;