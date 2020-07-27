import React, { FC } from 'react'
import "./Modal.scss"

interface Props {
    styleName?: string,
}



const Modal: FC<Props> = ({ children, styleName }) => {
    return (
        <div className="background" >
            <div className={`modal ${styleName || ""}`}>
                {children}
            </div>
        </div>
    )
}
export default Modal;