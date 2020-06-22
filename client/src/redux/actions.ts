import { ActionTypes, CourseActionTypes, QuarterActionTypes, Quarters } from './types';
import { Course } from '../models/courses-types';
import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk';
import { AppState } from '.';

export const addCourse: ActionCreator<ThunkAction<Promise<CourseActionTypes>, AppState, number, CourseActionTypes>>
    = (courseID: number) => {
        return async (dispatch, getState) => {

            let course: Course = await (await fetch("https://app.fakejson.com/q/XYpwaVv4?token=B_Fwikj8mKS-Fvj47RKL9Q", {
                method: "GET"
            })).json();
            let quarter = getState().quarterState.selectedQuarter;
            let addAction: CourseActionTypes = { type: ActionTypes.Add_COURSE, payload: { course, quarter } }
            return dispatch(addAction)
        }
    }

export const removeCourse: ActionCreator<ThunkAction<CourseActionTypes, AppState, number, CourseActionTypes>>
    = (classID: number) => {
        return (dispatch, getState) => {
            let quarter = getState().quarterState.selectedQuarter;
            return {
                type: ActionTypes.REMOVE_COURSE,
                payload: {
                    classID,
                    quarter
                }
            }
        }

    }

export const setQuarter = (quarter: Quarters): QuarterActionTypes => {
    return {
        type: ActionTypes.SELECT_QUARTER,
        payload: {
            quarter
        }
    }
}

export const setQuarters = (quarters: Array<Quarters>): QuarterActionTypes => {
    return {
        type: ActionTypes.SET_AVAIL_QUARTERS,
        payload: {
            availableQuarters: quarters
        }
    }
}
