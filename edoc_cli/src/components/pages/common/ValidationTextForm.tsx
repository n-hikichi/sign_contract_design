import { Box, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { readOnlyTextFieldStyle } from '../../../styles/fontStyles';
import validationRules from "../../../utils/validationRules";

/***
 * 
 * テキストフィールド
 * 
 */
const ValidationTextForm = (props: any) => {
    return (
        <Box py={1}>
            <Controller
                name={props.name}
                control={props.control}
                rules={props?.rules}
                render={({ field, fieldState }) => (
                    <>
                        <TextField
                            {...field}
                            label={props.label}
                            variant='standard'
                            fullWidth
                            margin='dense'
                            error={fieldState.invalid}
                            helperText={fieldState.error?.message}
                            sx={readOnlyTextFieldStyle}
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
                        />
                    </>
                )}
            />
        </Box>
    )
}

export default ValidationTextForm;