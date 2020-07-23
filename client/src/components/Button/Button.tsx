import React, { FC } from "react";
import "./Button.scss"

interface Props {
    onClick: () => void,
    disabled?: boolean
}

const Button: FC<Props> = ({ children, onClick, disabled }) => {
    return (
        <button className="btn" onClick={onClick} disabled={disabled} >{children}</button>
    )
}

export default Button;