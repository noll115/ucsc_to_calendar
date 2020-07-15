import { ActionTypesQuarters, QuarterActionTypes } from "../types/quarter-redux";
import { CalendarActionTypes, ActionTypesCalendar } from "../types/calendar-redux";

import { Course, QuarterSeasons, RecentQuarters, CourseCatalogue } from '../../../shared/types';
import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk';
import { AppState } from '.';
import axios, { AxiosError } from "axios";


export function addCourse(course: Course, quarter: QuarterSeasons): CalendarActionTypes {
    return {
        type: ActionTypesCalendar.Add_COURSE,
        payload: {
            course,
            quarter
        }
    }
}


export function removeCourse(classID: number, quarter: QuarterSeasons): CalendarActionTypes {
    return {
        type: ActionTypesCalendar.REMOVE_COURSE,
        payload: {
            classID,
            quarter
        }
    }
}


export function setQuarter(quarterSeason: QuarterSeasons): QuarterActionTypes {
    
    return {
        type: ActionTypesQuarters.SELECT_QUARTER,
        payload: {
            quarterSeason
        }
    }
}


export const fetchQuarters: ActionCreator<ThunkAction<void, AppState, null, QuarterActionTypes>>
    = () =>
        async (dispatch, getState) => {
            dispatch({ type: ActionTypesQuarters.QUARTERS_REQUESTED });
            try {
                let { data: recentQuarters } = await axios.get<RecentQuarters>("/quarters");
                console.log(recentQuarters);

                let quartersAction: QuarterActionTypes = {
                    type: ActionTypesQuarters.QUARTERS_SUCCESS,
                    payload: {
                        availableQuarters: recentQuarters.quarters,
                        quarterSeason: recentQuarters.currentQuarter
                    }
                }
                dispatch(quartersAction);
            } catch (err) {
                let res = err as AxiosError;
                console.log(res.response);
                if (res.response) {
                    dispatch({
                        type: ActionTypesQuarters.QUARTERS_FAILED, payload: {
                            code: res.response.status, errMessage: res.response.statusText
                        }
                    });
                } else {
                    dispatch({
                        type: ActionTypesQuarters.QUARTERS_FAILED, payload: {
                            code: 500, errMessage: "Something went wrong!"
                        }
                    });
                }
            }
        }
