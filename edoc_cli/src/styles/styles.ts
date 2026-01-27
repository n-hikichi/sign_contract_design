// --- 画面でよく使うスタイルを「base」を接頭辞にして定義する ---

import zIndex from "@mui/material/styles/zIndex";

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const basePageStyle = {
    bgcolor: 'transparent',
    height: 'auto',
    minHeight: 'calc(100vh - 35px)',
    paddingTop: '80px',
    paddingBottom: '5px'
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const baseFormStyle = {
    bgcolor: 'white',
    padding: '40px',
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const baseTextFieldStyle = {
    width: '100%',
    paddingBottom: '15px',
    '& .MuiInputBase-input': { fontSize: '1.5em', }
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const basePulldownFormStyle = {
    width: '100%',
    height: '100%',
    fontSize: '1.5em',
    display: 'flex',
    alignItems: 'center',
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const baseContentsStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

// --- ここからは個別のスタイル定義 ---
// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const childTextFieldStyle = {
    width: '60%',
    display: 'flex',
    justifyContent: 'flex-end',
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const parentTextFieldStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginLeft: '20px',
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const modalStyleUpload = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '1200px',
    height: '900px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
};

// 承認フロー設定ダイアログのスタイル
export const modalStyleApprovalFlow = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '85%',
    height: '85%',
    minWidth: '80%',
    minHeight: '80%',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    padding: '20px', 
    // overflow: 'auto'
};

// 登録完了、更新完了のモーダルウィンドウ
export const modalRegisterComplete = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    height: '30%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    zIndex: 9999
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const modalStyleRegister = {
    position: 'absolute' as 'absolute',
    top: '5%',
    left: '5%',
    width: '90%',
    height: '90%',
    bgcolor: 'background.paper',
    border: 'none',
    boxShadow: 24,
    p: 3,
};
export const modalStyleRestore = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '1200px',
    height: '900px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
};

// 削除ダイアログのスタイル
export const modalStyleConfirm = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

export const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
};

export const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px 40px',
    borderRadius: '4px',
    textAlign: 'center',
};

// 復元ダイアログのスタイル
export const restoreDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '55%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 破棄理由記載ダイアログのスタイル
export const deleteReasonDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '40%',
    height: '35%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 署名用URL再発行依頼ダイアログのスタイル
export const resendSighUrlDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '50%',
    height: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 差戻しダイアログのスタイル
export const remandDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '60%',
    height: '95%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 差戻しダイアログのスタイル
export const remandRequestDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '60%',
    height: '90%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#ffeeee',
    border: '2px solid #000',
    boxShadow: 24,
    p: '30px',
};

// 復元ダイアログのスタイル
export const pdfPreviewDialogStyle = {
    position: 'absolute' as 'absolute',
    width: '100%',
    height: '100%',
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    boxShadow: 24,
    // p: '5px',
    zIndex: 9999
};

// 承認フロー開始確認ダイアログのスタイル
export const approveStartDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    minHeight: '40%',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 承認フロー開始確認ダイアログのスタイル
export const registerHomeInputErrorDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    minHeight: '20%',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 承認フロー開始確認ダイアログのスタイル
export const processingDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40%',
    minHeight: '20%',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 承認フロー更新ダイアログのスタイル
export const modifyapproveFlowDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '45%',
    height: '25%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 削除ダイアログのスタイル
export const deleteModalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '60%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 削除ダイアログのスタイル
export const deleteSettingModalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '30%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 企業情報更新ダイアログのスタイル
export const companyInfoModifyModalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '45%',
    height: '65%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 削除ダイアログのスタイル
export const customerApproveFlowStartDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '45%',
    height: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 削除ダイアログのスタイル
export const restartApploveFlowModalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '45%',
    height: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 新規契約書作成ダイアログのスタイル（データ引継ぎ）
export const createNewAgreementRequestDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '80%',
    height: '100%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '30px',
};

// 契約締結後の署名用URL発行依頼ダイアログのスタイル
export const resendSighUrlDialogStyleConcluded_one = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '50%',
    height: '80%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 契約締結後の署名用URL発行依頼ダイアログのスタイル
export const resendSighUrlDialogStyleConcluded = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '50%',
    height: '80%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 契約締結後の署名用URL発行依頼ダイアログのスタイル
export const resendSighUrlDialogStyleConcluded_all = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '50%',
    height: '80%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'grey.200',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 新規契約書作成ダイアログのスタイル（データ引継ぎ）
export const createNewWorkLoadDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '60%',
    height: '90%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#eeffee',
    border: '2px solid #000',
    boxShadow: 24,
    p: '30px',
};