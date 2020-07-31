import React, { FC, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux'
import { CSSTransition } from 'react-transition-group'
import "./ErrorDisplay.scss";


const mapStateToProps = (state: AppState) =>
    ({
        panelError: {
            errCode: state.coursePanelState.errCode,
            errMessage: state.coursePanelState.errMessage
        },
        quarterError: {
            errCode: state.quarterState.errCode,
            errMessage: state.quarterState.errMessage
        }
    })

const mapDispatchToProps = {

}

const connected = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connected>;


const ErrorDisplay: FC<ReduxProps> = ({ panelError, quarterError }) => {

    const [showError, setShowError] = useState(false);

    useEffect(() => {

        if (panelError.errMessage === "" && quarterError.errMessage === "") {
            if (showError)
                setShowError(false);
        } else if (!showError) {
            setShowError(true);
        }

    }, [showError, setShowError, quarterError.errMessage, panelError.errMessage])

    let errMsg, errCode;
    if (panelError.errMessage !== "") {
        errMsg = panelError.errMessage;
        errCode = panelError.errCode;
    } else {
        errMsg = quarterError.errMessage;
        errCode = quarterError.errCode;
    }
    if (showError) {
        setTimeout(() => {
            setShowError(false)
        }, 5000);
    }
    return (
        <CSSTransition
            in={showError}
            appear
            timeout={300}
            classNames="errorDisplay">
            <div className="errorDisplay">
                <div>
                    <span>
                        {errCode}
                    </span>
                    <span>
                        {errMsg}
                    </span>
                </div>
            </div>
        </CSSTransition>
    )
}




export default connected(ErrorDisplay)
