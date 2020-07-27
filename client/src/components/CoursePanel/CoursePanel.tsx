import React, { FC, useState, Fragment, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux';
import { ClosePanel, addCourse } from "../../redux/actions";
import { Meeting } from '../../../../shared/types';
import { CourseAdded } from "../../types/calendar-redux"
import Modal from "../Modal/Modal";
import Button from '../Button/Button';
import "./CoursePanel.scss";
import Loading from '../Loading/Loading';


const mapStateToProps = (state: AppState) => {
    let { calendars } = state.calendarState;
    let quarterSeason = state.quarterState.selectedQuarter;
    let coursesAlreadyAdded = calendars[quarterSeason];
    return {
        coursePanelState: state.coursePanelState,
        quarterSeason,
        coursesAlreadyAdded
    }
}

const mapDispatchToProps = {
    ClosePanel,
    addCourse
}

const connected = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connected>;

const FullDays: Record<string, string> = {
    SU: "Sunday",
    MO: "Monday",
    TU: "Tuesday",
    WE: "Wednesday",
    TH: "Thursday",
    FR: "Friday",
    SA: "Saturday"
}

const CoursePanel: FC<ReduxProps> = ({ ClosePanel, addCourse, coursePanelState, quarterSeason, coursesAlreadyAdded }) => {

    let { currentCourseViewing, errorCode, errMessage, fetching, showPanel } = coursePanelState;
    let [selectedIndex, setSelectedIndex] = useState(-1);

    let courseInCalendar = coursesAlreadyAdded.find(({ course }) => course.id === currentCourseViewing?.id);

    useEffect(() => {
        if (courseInCalendar)
            setSelectedIndex(courseInCalendar.labChosen);
        else
            setSelectedIndex(-1);
    }, [currentCourseViewing])

    if (!showPanel) {
        return null
    }

    if (fetching || !currentCourseViewing) {
        return <Modal><Loading /></Modal>;
    }

    let { fullName, id, inst, labs: { labs, type: labType }, meets, sect, shortName, type } = currentCourseViewing;
    let days = meets.map(m => m.days.map(day => FullDays[day])).join();



    let meetingTime = meets.map(({ startTime, endTime }) => {
        if (startTime === "N/A" && endTime === "N/A") {
            return "N/A"
        }
        let startTimeStr = (startTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let endTimeStr = (endTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${startTimeStr} - ${endTimeStr}`
    }).join();

    let locations = meets[0].loc === "N/A" ? "N/A" : meets.map(m => m.loc).join();

    let sections = labs.map((lab, i) => {
        let { meet } = lab;
        if (meet === "N/A") {
            return (
                <div key={i} onClick={() => { setSelectedIndex(i) }} className={`section ${selectedIndex === i ? "selected" : ""}`}>
                    <span>{`${labType} ${lab.sect}`}</span>
                    <span>N/A</span>
                    <span>N/A</span>
                </div>)
        }
        let { days, endTime, startTime, loc } = meet as Meeting;

        let startTimeStr = (startTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        let endTimeStr = (endTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let totalTimeStr = `${days.join()} ${startTimeStr}-${endTimeStr}`;

        return (
            <div key={i} onClick={() => { setSelectedIndex(i) }} className={`section ${selectedIndex === i ? "selected" : ""}`}>
                <span>{`${labType} ${lab.sect}`}</span>
                <span>{totalTimeStr}</span>
                <span>{loc}</span>
            </div>
        )
    })
    console.log(courseInCalendar);

    let addBtn = () => {
        if (currentCourseViewing) {
            addCourse({ course: currentCourseViewing, labChosen: selectedIndex }, quarterSeason, courseInCalendar === undefined);
            ClosePanel();
        }
    }

    let closeBtn = () => {
        ClosePanel();
    }

    let hasSections = sections.length > 0;
    return (
        <Modal styleName="coursePanel" >
            <Button onClick={closeBtn} additionalClasses="exit"><i className="fas fa-times fa-2x"></i></Button>
            <div className="courseInfo">
                <div>
                    <p>{`${shortName} - ${sect}`}</p>
                </div>
                <div>
                    <div><label>Course Name:</label> <div>{fullName}</div></div>
                    <div><label>Instructor:</label> {inst}</div>
                    <div> <label>Class Number:</label> {id}</div>
                </div>
                <div>
                    <div><label> Meeting Days:</label> {days}</div>
                    <div><label> Meeting Times:</label> {meetingTime}</div>
                    <div><label> Location:</label> {locations}</div>
                </div>
            </div>
            {hasSections &&
                <Fragment>
                    < div className="sectionLabels">
                        <div>
                            <span>Sections: </span>
                            <span>Select one</span>
                        </div>
                        <div>
                            <span>Section</span>
                            <span>Time</span>
                            <span>Location</span>
                        </div>
                    </div>
                    <div className="sectionList">
                        {sections}
                    </div>
                </Fragment>
            }
            {
                courseInCalendar ?
                    <Button onClick={selectedIndex !== courseInCalendar.labChosen ? addBtn : undefined} disabled={selectedIndex === courseInCalendar.labChosen} >{selectedIndex !== courseInCalendar.labChosen ? "change" : "Already In Calendar"}</Button>
                    : <Button onClick={addBtn}>Add</Button>
            }
        </Modal >
    )
}



export default connected(CoursePanel)
