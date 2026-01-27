// read onlyで定義するテキストフィールドのスタイル
export const readOnlyTextFieldStyle = {
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
        fontWeight: 'bold'
    }
};

export const readOnlyTextFieldStyle_labelColor = {
    width: '100%',
    '& .Mui-disabled': {
        color: 'gray',
        opacity: 1,
        '-webkit-text-fill-color': 'gray',
        fontSize: '16px',
    },
    '& .MuiInputBase-input.Mui-disabled': {
        color: 'black',
        opacity: 1,
        '-webkit-text-fill-color': 'black',
        fontSize: '20px',
        paddingLeft: '20px',
        fontWeight: 'bold'
    }
};

export const readOnlyTextFieldStyle_Register = {
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
        fontWeight: 'bold'
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none', // アウトラインの線をなくす
    },
    '& .MuiFilledInput-underline': {
        borderBottom: 'none', // フィルドバリアントの下線をなくす
    },
};

export const readOnlyTextFieldPaddingLessStyle = {
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
        fontWeight: 'bold'
    }
};

// read onlyで定義するテキストフィールドのスタイル
export const readOnlyMultiTextFieldStyle = {
    marginBottom: '16px',
    '& .MuiInputBase-input.Mui-disabled': {
        color: 'black',
        opacity: 1,
        fontWeight: 'bold',
        fontSize: '20px',
        '-webkit-text-fill-color': 'black',
    }
};

// writeで定義するテキストフィールドのスタイル
export const writeEnableTextFieldStyle = {
    style: {
        paddingLeft: '20px',
        fontSize: '20px',
        fontWeight: 'bold'
    },
};