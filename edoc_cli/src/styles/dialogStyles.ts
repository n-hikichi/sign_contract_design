// --- 画面でよく使うスタイルを「base」を接頭辞にして定義する ---
// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const basePageStyle = {
    bgcolor: 'grey.200',
    height: 'auto',
    minHeight: 'calc(100vh - 35px)',
    paddingTop: '80px',
    paddingBottom: '5px'
};

// 登録画面、更新画面、復元画面のモーダルウィンドウの設定
export const baseFormStyle = {
    bgcolor: 'white',
    padding: '50px',
    marginBottom: '20px',
    borderRadius: '20px'
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
    justifyContent: 'flex-end'
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
    width: '50%',
    height: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 復元ダイアログのスタイル
export const pdfPreviewDialogStyle = {
    position: 'absolute' as 'absolute',
    width: '100%',
    height: '100%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};

// 承認フロー開始確認ダイアログのスタイル
export const approveStartDialogStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '15px',
};