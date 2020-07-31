import React, { FC, Fragment } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux';
import { ClosePanel } from "../../redux/actions";
import { Modal, Button, Loading } from "../index";
import CourseInfo from './CourseInfo';
import "./CoursePanel.scss";


const mapStateToProps = (state: AppState) => {
    return {
        panelState: state.coursePanelState
    }
}

const mapDispatchToProps = {
    ClosePanel
}

const connected = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connected>;



const CoursePanel: FC<ReduxProps> = ({ ClosePanel, panelState }) => {
    let { currentCourseViewing, fetching, showPanel } = panelState;



    let closeBtn = () => {
        ClosePanel();
    }

    return (
        <Modal styleName="coursePanel" show={showPanel} >
            {fetching ? <Loading /> :
                <Fragment>
                    <Button onClick={closeBtn} additionalClasses="exit"><i className="fas fa-times fa-2x"></i></Button>
                    {currentCourseViewing && <CourseInfo currCourseViewing={currentCourseViewing} />}
                </Fragment>
            }
        </Modal >
    )
}



export default connected(CoursePanel)
