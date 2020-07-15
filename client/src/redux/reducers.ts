import { Reducer } from 'redux';
import { ActionTypesQuarters, QuarterActionTypes, QuartersState } from "../types/quarter-redux";
import { CalendarState, CalendarActionTypes, ActionTypesCalendar } from "../types/calendar-redux";
import { CoursesAvailableState, ActionTypesCourses, CourseActionTypes } from 'src/types/courses-redux';


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
                let prevCourses = prevState.calendars[action.payload.quarter];
                return {
                    calendars: {
                        [action.payload.quarter]: [...prevCourses, action.payload.course],
                        ...prevState.calendars
                    }
                };
            case ActionTypesCalendar.REMOVE_COURSE:
                let { classID, quarter } = action.payload
                let prevCalendar = prevState.calendars[quarter];
                let newCalendar = prevCalendar.filter(course => course.id != classID);
                return {
                    calendars: {
                        [quarter]: newCalendar,
                        ...prevState.calendars
                    }
                }
            default:
                return prevState;
        }
    }

const initialQuarterState: QuartersState = {
    availableQuarters: {},
    selectedQuarter: null,
    fetching: false,
    errMessage: "",
    code: 0
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
            default:
                return prevState;
        }
    }


const initialCoursesAvailableState: CoursesAvailableState = {
    fall: [],
    winter: [],
    spring: [],
    summer: []
}


export const coursesAvailableReducer: Reducer<CoursesAvailableState, CourseActionTypes>
    = (prevState = initialCoursesAvailableState, action) => {
        switch (action.type) {
            case ActionTypesCourses.FETCH_COURSES:
                return prevState;
            case ActionTypesCourses.FETCH_COURSES_SUCCESS:
                return prevState;
            case ActionTypesCourses.FETCH_COURSES_FAIL:
                return prevState;
            default:
                return prevState;
        }
    }
