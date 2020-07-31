import { Reducer } from 'redux';
import { ActionTypesQuarters, QuarterActionTypes, QuartersState } from "../types/quarter-redux";
import { CalendarState, CalendarActionTypes, ActionTypesCalendar } from "../types/calendar-redux";
import { CoursePanelState, CoursePanelActionTypes, ActionTypesCoursePanel } from 'src/types/coursePanel-redux';
import { CourseSearchState, CourseSearchActionTypes, ActionTypesCourseSearch } from "src/types/courseSearch-redux";


const initialCalendarState: CalendarState = {
    calendars: {
        fall: [],
        winter: [],
        spring: [],
        summer: []
    }
}

export const calendarReducer: Reducer<CalendarState, CalendarActionTypes>
    = (prevState = initialCalendarState, action) => {
        switch (action.type) {
            case ActionTypesCalendar.Add_COURSE:
                let { newCourse, isNew } = action.payload;
                let prevCoursesAdded = prevState.calendars[action.payload.quarter];
                if (!isNew) {
                    prevCoursesAdded = prevCoursesAdded.filter(({ course }) => course.id !== newCourse.course.id)
                }
                let withNewCourse = {
                    ...prevState.calendars,
                    [action.payload.quarter]: [...prevCoursesAdded, newCourse]
                }
                sessionStorage.setItem("calendars", JSON.stringify(withNewCourse));
                return {
                    calendars: withNewCourse
                };
            case ActionTypesCalendar.REMOVE_COURSE:
                let { courseID, quarter } = action.payload
                let prevCalendar = prevState.calendars[quarter];

                let newCalendar = prevCalendar.filter(({ course }) => course.id !== courseID);
                let removedCourse = {
                    ...prevState.calendars,
                    [quarter]: newCalendar
                }
                sessionStorage.setItem("calendars", JSON.stringify(removedCourse));
                return {
                    calendars: removedCourse
                }
            case ActionTypesCalendar.SET_CALENDARS:
                let { calendars } = action.payload;
                return { calendars: calendars };
            default:
                return prevState;
        }
    }

const initialQuarterState: QuartersState = {
    availableQuarters: null,
    selectedQuarter: "fall",
    fetching: false,
    showKeyDates: false,
    errMessage: "",
    errCode: 0
}

export const quarterReducer: Reducer<QuartersState, QuarterActionTypes>
    = (prevState = initialQuarterState, action) => {
        switch (action.type) {
            case ActionTypesQuarters.SELECT_QUARTER:
                let { quarterSeason } = action.payload;
                return {
                    ...prevState,
                    selectedQuarter: quarterSeason
                }
            case ActionTypesQuarters.QUARTERS_REQUESTED:
                return {
                    ...prevState,
                    fetching: true
                }
            case ActionTypesQuarters.QUARTERS_SUCCESS:
                let { quarterSeason: chosenSeason } = action.payload;
                return {
                    ...prevState,
                    availableQuarters: action.payload.availableQuarters,
                    selectedQuarter: chosenSeason,
                    fetching: false,
                }
            case ActionTypesQuarters.QUARTERS_FAILED:
                return {
                    ...prevState,
                    ...action.payload,
                    fetching: false,
                }
            case ActionTypesQuarters.SET_SHOW_KEYDATES:
                return {
                    ...prevState,
                    showKeyDates: action.payload.show
                }
            default:
                return prevState;
        }
    }

const initialCoursePanelState: CoursePanelState = {
    currentCourseViewing: null,
    fetching: false,
    courseCache: {},
    showPanel: false,
    errMessage: "",
    errCode: 0
}



export const coursePanelReducer: Reducer<CoursePanelState, CoursePanelActionTypes>
    = (prevState = initialCoursePanelState, action) => {
        switch (action.type) {
            case ActionTypesCoursePanel.CLOSE_PANEL:
                return { ...prevState, showPanel: false, fetching: false };
            case ActionTypesCoursePanel.FETCH_COURSE:
                return { ...prevState, showPanel: true, fetching: true };
            case ActionTypesCoursePanel.COURSE_LOADED:
                let { courseCache } = prevState;
                let { course } = action.payload;
                return { ...prevState, fetching: false, currentCourseViewing: action.payload.course, courseCache: { ...courseCache, [course.id]: course } };
            case ActionTypesCoursePanel.COURSE_FAILED:
                return { ...prevState, ...action.payload, fetching: false }
            default:
                return prevState;
        }
    }



const initialCourseSearchState: CourseSearchState = {
    coursesResults: null,
    cursor: -1,
    currentCourse: null,
    showResults: false
}


export const CourseSearchReducer: Reducer<CourseSearchState, CourseSearchActionTypes>
    = (prevState = initialCourseSearchState, action) => {
        switch (action.type) {
            case ActionTypesCourseSearch.CURSOR_UP:
                if (prevState.coursesResults) {
                    let { cursor, coursesResults } = prevState;
                    let nextCursorLoc = cursor > 0 ? --cursor : cursor;
                    return { ...prevState, cursor: nextCursorLoc, currentCourse: coursesResults[nextCursorLoc] };
                }
                return prevState;
            case ActionTypesCourseSearch.CURSOR_DOWN:
                if (prevState.coursesResults) {
                    let { cursor, coursesResults } = prevState;
                    let nextCursorLoc = cursor < coursesResults.length - 1 ? ++cursor : cursor;
                    return { ...prevState, cursor: nextCursorLoc, currentCourse: coursesResults[nextCursorLoc] };
                }
                return prevState;
            case ActionTypesCourseSearch.SET_RESULTS:
                return { ...prevState, coursesResults: action.payload.courseResults, cursor: -1, currentCourse: null }

            case ActionTypesCourseSearch.SET_SHOW_RESULTS:
                return { ...prevState, showResults: action.payload.show }
            default:
                return prevState;
        }
    }
