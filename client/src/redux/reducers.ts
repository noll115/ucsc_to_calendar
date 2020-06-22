import { CalendarState, ActionTypes, CourseActionTypes, QuartersState, QuarterActionTypes, Quarters } from './types';
import { Reducer } from 'redux';

const initialCalendarState: CalendarState = {
    Fall: [],
    Winter: [],
    Spring: [],
    Summer: []
}

export const calendarReducer: Reducer<CalendarState, CourseActionTypes>
    = (prevState = initialCalendarState, action) => {
        switch (action.type) {
            case ActionTypes.Add_COURSE:
                let { [action.payload.quarter]: prevCourses } = prevState;
                return {
                    ...prevState,
                    [action.payload.quarter]: [...prevCourses, action.payload.course]
                };
            case ActionTypes.REMOVE_COURSE:
                return {
                    ...prevState,
                }
            default:
                return prevState;
        }
    }

const initialQuarterState: QuartersState = {
    availableQuarters: [],
    selectedQuarter: Quarters.FALL,
    coursesAvailable: {
        Fall: [],
        Winter: [],
        Spring: [],
        Summer: []
    }
}

export const quarterReducer: Reducer<QuartersState, QuarterActionTypes>
    = (prevState = initialQuarterState, action) => {
        switch (action.type) {
            case ActionTypes.SELECT_QUARTER:
                return {
                    ...prevState,
                    selectedQuarter: action.payload.quarter
                }
            case ActionTypes.SET_AVAIL_QUARTERS:
                return {
                    ...prevState,
                    availableQuarters: action.payload.availableQuarters
                }
            default:
                return prevState;
        }
    }
