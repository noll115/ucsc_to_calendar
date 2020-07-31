import React, { FC, Fragment as div, MouseEvent, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';
import { RemoveCourse, FetchCourse, SetCalendars } from '../../redux/actions'
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { CourseAdded } from 'src/types/calendar-redux';
import { QuarterSeasons } from '../../../../shared/types';
import "./CoursesSelectedList.scss"

const mapStateToProps = (state: AppState) => {
    let { selectedQuarter } = state.quarterState;
    let courses = state.calendarState.calendars[selectedQuarter];
    let { availableQuarters } = state.quarterState;
    let currentQuarter = availableQuarters ? availableQuarters[selectedQuarter] || null : null;
    return {
        courses,
        currentQuarter,
        quarterSeason: selectedQuarter
    }
}

const mapDispatchToProps = {
    RemoveCourse,
    FetchCourse,
    SetCalendars
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connector>

interface Props extends reduxProps {
}

const CoursesSelectedList: FC<Props> = ({ RemoveCourse, SetCalendars, courses, quarterSeason, currentQuarter, FetchCourse }) => {
    let col = "#A9FFAC";
    useEffect(() => {
        let cacheHit = sessionStorage.getItem("calendars");
        console.log("s");

        if (cacheHit) {
            let calendars: { [key in QuarterSeasons]: CourseAdded[] } = JSON.parse(cacheHit);
            SetCalendars(calendars);
        }
    }, [SetCalendars])


    let list = courses.map((courseAdded, i) => {
        let { course } = courseAdded;
        let meeting = course.meets.map(({ startTime, endTime }) => {
            if (startTime === "N/A" && endTime === "N/A") {
                return "N/A";
            }
            let startTimeStr = (startTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let endTimeStr = (endTime as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `${startTimeStr} - ${endTimeStr}`
        }).join()

        let removeCourseHandler = (e: MouseEvent) => {
            RemoveCourse(course.id, quarterSeason)
            e.stopPropagation();
        }
        let editCourse = () => {
            FetchCourse(courseAdded.course.id, currentQuarter?.id)
        }
        return (

            <CSSTransition
                key={i}
                classNames="selectedCourse"
                timeout={300}
            >
                <div className="selectedCourse" onClick={editCourse} >
                    <span className="color" style={{ background: col }}></span>
                    <span>{`${course.shortName} - ${course.sect}`}</span>
                    <span>{meeting}</span>
                    <button onClick={removeCourseHandler}><i className="fas fa-times"></i></button>
                </div>
            </CSSTransition>
        )
    });

    return (
        <div className="coursesSelectedList" style={{ maxHeight: `calc(35px + ${list.length * 2.6}rem + ${Math.max(list.length - 1, 0) * 20}px)`, transition: "max-height 300ms" }}>
            <label className="label" >Classes Selected:</label>
            <TransitionGroup  >
                {list}
            </TransitionGroup>
        </div>
    )
}
export default connector(CoursesSelectedList)
