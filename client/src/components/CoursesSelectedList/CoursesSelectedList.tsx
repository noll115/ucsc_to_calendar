import React, { FC, Fragment as div } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';
import { removeCourse } from '../../redux/actions'
import "./CoursesSelectedList.scss"


const mapStateToProps = (state: AppState) => {
    let { selectedQuarter } = state.quarterState;
    let courses = state.calendarState.calendars[selectedQuarter];
    return {
        courses,
        currentQuarterSeason: state.quarterState.selectedQuarter
    }
}

const mapDispatchToProps = {
    removeCourse
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connector>

interface Props extends reduxProps {
}

const CoursesSelectedList: FC<Props> = ({ removeCourse, courses, currentQuarterSeason }) => {
    let col = "#A9FFAC";
    let list = courses.map((courseAdded, i) => {
        let { course, labChosen } = courseAdded;
        let meeting = course.meets.map(({ startTime, endTime }) => {
            if (startTime === "N/A" && endTime === "N/A") {
                return "N/A";
            }
            let startTimeStr = (startTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let endTimeStr = (endTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `${startTimeStr} - ${endTimeStr}`
        }).join()

        let removeCourseHandler = () => {
            removeCourse(course.id, currentQuarterSeason)
        }
        let editCourse = () => {

        }
        return (
            <div key={i} onClick={editCourse} >
                <span className="color" style={{ background: col }}></span>
                <span>{`${course.shortName} - ${course.sect}`}</span>
                <span>{meeting}</span>
                <button onClick={removeCourseHandler}><i className="fas fa-times "></i></button>
            </div>
        )
    })
    return (
        <div className="coursesSelectedList">
            <label className="label" >Classes Selected:</label>
            {list}
        </div>
    )
}
export default connector(CoursesSelectedList)
