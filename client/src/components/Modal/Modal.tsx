
import React, { FC } from 'react'
import "./Modal.scss"
import { CSSTransition } from 'react-transition-group';

interface Props {
    styleName?: string,
    show: boolean
}



const Modal: FC<Props> = ({ children, styleName, show }) => {
    return (
        <CSSTransition
            in={show}
            appear
            classNames="background"
            unmountOnExit
            timeout={300}
        >
            <div className="background" >
                <div className={`modal ${styleName || ""}`}>
                    {children}
                </div>
            </div>
        </CSSTransition>
    )
}
export default Modal;