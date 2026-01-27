import { TextField, Autocomplete } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import apiStatus from '../../utils/apiStatus';
import { Select, MenuItem } from '@mui/material';
import { basePulldownFormStyle } from '../../styles/styles';

type MenuItemProps = {
    "keyPropertyName": string,
    "valuePropertyName": string,
    "displayNamePropertyName": string,
};

type Props = {
    "id": string,
    "name": string,
    // ControlにはuseForm<Inputs>に対応するジェネリクスInputsを渡すことが望ましい。
    // Control<Inputs, any>が望ましいが実装難易度の高さと、影響範囲の小ささを考慮して
    // 後の課題とする。
    "control": Control<any, any>,
    "label": string,
    "defaultValue": any,
    "data": Array<Record<string, number>>,
    menuItemProps: MenuItemProps,
    "width"?: string,
};

type Props_ = {
    "id": string,
    "name": string,
    // ControlにはuseForm<Inputs>に対応するジェネリクスInputsを渡すことが望ましい。
    // Control<Inputs, any>が望ましいが実装難易度の高さと、影響範囲の小ささを考慮して
    // 後の課題とする。
    "control": Control<any, any>,
    "label": string,
    "defaultValue": any,
    // "width"?: string,
};

const PulldownForm = (props: Props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    id={props.id}
                    options={props.data}
                    getOptionLabel={(option) => option && option[props.menuItemProps.displayNamePropertyName] ? option[props.menuItemProps.displayNamePropertyName] : ""}
                    defaultValue={props.defaultValue}
                    onChange={(event, newValue) => {
                        field.onChange(newValue ? newValue[props.menuItemProps.valuePropertyName] : "");
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={props.label}
                            variant="outlined"
                            sx={{
                                width: props.width || '17em',
                                ...params.inputProps.style,
                            }}
                            inputProps={{
                                ...params.inputProps,
                                style: {
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    ...params.inputProps.style
                                },
                            }}
                        />
                    )}
                    value={props.data.find(option => option[props.menuItemProps.valuePropertyName] === field.value) || ""}
                />
            )}
        />

    );
};

export const PulldownForm_agreementType = (props: Props_) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field }) => (
                <Select
                    {...field}
                    id={props.id}
                    defaultValue={props.defaultValue}
                    onChange={(event) => {
                        field.onChange(event.target.value);
                    }}
                    sx={{
                        ...basePulldownFormStyle
                    }}
                >
                    {Object.entries(apiStatus.agreementType).map(([key, value]) => (
                        <MenuItem
                            key={key}
                            value={value}
                        >
                            {value}
                        </MenuItem>
                    ))}
                </Select>
            )}
        />

    );
};

export const PulldownForm_expiredDate = (props: Props_) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field }) => (
                <Select
                    {...field}
                    id={props.id}
                    defaultValue={props.defaultValue}
                    onChange={(event) => {
                        field.onChange(event.target.value);
                    }}
                    sx={{
                        ...basePulldownFormStyle
                    }}
                >
                    {Object.entries(apiStatus.expiredDate).map(([key, value]) => (
                        <MenuItem
                            key={key}
                            value={Number(key)}
                        >
                            {value}
                        </MenuItem>
                    ))}
                </Select>
            )}
        />

    );
};

export default PulldownForm;