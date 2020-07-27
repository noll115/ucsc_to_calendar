import React, { FC } from "react";
import "./Button.scss"

interface Props {
    onClick?: () => void,
    disabled?: boolean
    additionalClasses?: string
}

const Button: FC<Props> = ({ children, onClick, disabled, additionalClasses }) => {
    return (
        <button className={`btn ${additionalClasses}`} onClick={onClick} disabled={disabled} >{children}</button>
    )
}

export default Button;