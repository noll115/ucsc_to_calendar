import React, { FC, Fragment, useState, useEffect } from 'react';
import { Meeting, Course } from '../../../../shared/types';
import { ClosePanel, AddCourse } from "../../redux/actions";
import { AppState } from 'src/redux';
import { ConnectedProps, connect } from 'react-redux';
import Button from 'src/components/Button/Button';



const mapStateToProps = (state: AppState) => {
    let { calendars } = state.calendarState;
    let quarterSeason = state.quarterState.selectedQuarter;
    let coursesAlreadyAdded = calendars[quarterSeason];
    return {
        quarterSeason,
        coursesAlreadyAdded
    }
}

const mapDispatchToProps = {
    ClosePanel,
    AddCourse
}


const FullDays: Record<string, string> = {
    SU: "Sunday",
    MO: "Monday",
    TU: "Tuesday",
    WE: "Wednesday",
    TH: "Thursday",
    FR: "Friday",
    SA: "Saturday"
}
const connected = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connected>;

interface CourseInfoProps extends ReduxProps {
    currCourseViewing: Course,
}


const CourseInfo: FC<CourseInfoProps> = ({ quarterSeason, currCourseViewing, coursesAlreadyAdded, AddCourse, ClosePanel }) => {
    let [selectedIndex, setSelectedIndex] = useState(-1);

    let courseInCalendar = coursesAlreadyAdded.find(({ course }) => course.id === currCourseViewing?.id);

    useEffect(() => {
        if (courseInCalendar)
            setSelectedIndex(courseInCalendar.labChosen);
        else
            setSelectedIndex(-1);
    }, [currCourseViewing, setSelectedIndex,courseInCalendar])


    let { fullName, id, inst, labs: { labs, type: labType }, meets, sect, shortName, type } = currCourseViewing;
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
        AddCourse({ course: currCourseViewing, labChosen: selectedIndex }, quarterSeason, courseInCalendar === undefined);
        ClosePanel();
    }




    return (
        <Fragment>
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
            {
                sections.length > 0 &&
                <Fragment>
                    < div className="sectionLabels">
                        <div>
                            <span>Sections:</span>
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
        </Fragment>
    )
}

export default connected(CourseInfo);