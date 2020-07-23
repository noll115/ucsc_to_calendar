import React, { FC, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux';
import { ClosePanel } from "../../redux/actions";
import "./CoursePanel.scss";
import { Meeting, Course } from '../../../../shared/types';
import Modal from "../Modal/Modal";
import Button from '../Button/Button';

const mapStateToProps = (state: AppState) => ({
    coursePanelState: state.coursePanelState
})

const mapDispatchToProps = {
    ClosePanel
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
const iCalDates = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const UCSCDates = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];


let test: Course = {
    fullName: "Personal Computer Concepts: Software and Hardware",
    id: 22264,
    inst: "Moulds,G.B.",
    labs: {
        labs: [
            {
                id: 22682, sect: "01A", meet: {
                    days: ["TU"],
                    endTime: "2020-06-24T01:30:00.000Z",
                    loc: "N/A",
                    startTime: "2020-06-24T00:00:00.000Z"
                }
            },
            {
                id: 22683, sect: "01B", meet: {
                    days: ["TH"],
                    endTime: "2020-06-24T01:30:00.000Z",
                    loc: "Soc Sci 1 145",
                    startTime: "2020-06-24T00:00:00.000Z"
                }
            },
        ],
        type: "LBS"
    },
    meets: [{
        days: ["TU", "TH"],
        endTime: "2020-10-06T20:15:00.000Z",
        loc: "Remote Instruction",
        startTime: "2020-10-06T18:40:00.000Z"
    }],
    sect: "01",
    shortName: "CSE 3",
    type: "Lecture"
};

function IcalToUCSC(days: string[]) {
    return days.map((str, i) => {
        let index = iCalDates.indexOf(str);
        return UCSCDates[index];
    });
}



const CoursePanel: FC<ReduxProps> = ({ ClosePanel, coursePanelState }) => {
    let { currentCourseViewing, errorCode, errMessage, fetching, showPanel } = coursePanelState;
    let { fullName, id, inst, labs: { labs, type: labType }, meets, sect, shortName, type } = currentCourseViewing ? currentCourseViewing : test;
    let days = meets.map(m => m.days.map(day => FullDays[day])).join();


    let [selectedIndex, setSelectedIndex] = useState(-1);

    let meetingTime = meets.map(m => {
        let startTime = new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let endTime = new Date(m.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${startTime} - ${endTime}`
    }).join();
    let locations = meets.map(m => m.loc).join();

    let sections = labs.map((lab, i) => {
        let { meet } = lab;
        let { days, endTime, startTime, loc } = meet as Meeting;
        let startTimeStr = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        let endTimeStr = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
            <div onClick={() => { setSelectedIndex(i) }} className={`section ${selectedIndex === i ? "selected" : ""}`}>
                <span>{`${labType} ${lab.sect}`}</span>
                <span>{`${IcalToUCSC(days).join()} ${startTimeStr}-${endTimeStr}`}</span>
                <span>{loc}</span>
            </div>
        )
    })

    return (
        <Modal styleName="coursePanel">
            <p>{`${shortName} - ${sect}`}</p>
            <br />
            <div><span>Course Name:</span> {fullName}</div>
            <div><span>Instructor:</span> {inst}</div>
            <div> <span>Class Number:</span> {id}</div>
            <br />
            <div><span> Meeting Days:</span> {days}</div>
            <div><span> Meeting Times:</span> {meetingTime}</div>
            <div><span> Location:</span> {locations}</div>
            <div className="sectionDisplay">
                <div>
                    <span>Sections </span>
                    <span>Select one</span>
                </div>

                <div>
                    <div className="sectionLabels">
                        <span>Section</span>
                        <span>Time</span>
                        <span>Location</span>
                    </div>
                    <div className="sectionList">
                        {sections}
                    </div>
                </div>
            </div>
            <Button disabled={selectedIndex === -1} onClick={() => { }}>Add</Button>
        </Modal>
    )
}



export default connected(CoursePanel)
