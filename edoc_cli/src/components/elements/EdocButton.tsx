import Button from '@mui/material/Button';
type Props = {
    text: string,
    variant: 'text' | 'contained' | 'outlined',
    handleClick?: (...args: any[]) => void,
    type?: "button" | "submit" | "reset" | undefined,
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined,
    disabled?: boolean,
    buttonMargin?: string,
    hoverColor?: "darkblue" | "darkred" | "darkgreen" | undefined,
}
/**
 * EdocButtonコンポーネント
 * 部品のボタンを定義する
 * パラメータは増える予定あり。
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.label - ボタン上に表示するテキスト
 * @param {'text' | 'contained' | 'outlined'} props.variant - ボタンの見た目の種類
 * @param {(...args:any[]) => void} props.handleClick - クリックした時に呼ばれるメソッド
 * @returns {JSX.Element} EdocButtonコンポーネント
 */
const EdocButton = ({ text, variant, type, color, handleClick, disabled }: Props) => {
    return (
        <Button
            variant={variant}
            onClick={handleClick}
            type={type}
            color={color || 'primary'}
            sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: 'darkblue' } }}
            disabled={disabled}
        >
            {text}
        </Button>
    )
};

/**
 * EdocButtonコンポーネント
 * 部品のボタンを定義する
 * パラメータは増える予定あり。
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.label - ボタン上に表示するテキスト
 * @param {'text' | 'contained' | 'outlined'} props.variant - ボタンの見た目の種類
 * @param {(...args:any[]) => void} props.handleClick - クリックした時に呼ばれるメソッド
 * @returns {JSX.Element} EdocButtonコンポーネント
 */
export const HoverButton = ({ text, variant, type, color, handleClick, disabled, hoverColor }: Props) => {
    return (
        <Button
            variant={variant}
            onClick={handleClick}
            type={type}
            color={color || 'primary'}
            sx={{ margin: '5px', width: '10em', '&:hover': { backgroundColor: hoverColor || 'darkblue' } }}
            disabled={disabled}
        >
            {text}
        </Button>
    )
};

export default EdocButton;