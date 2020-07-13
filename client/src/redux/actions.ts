import { ActionTypesQuarters, QuarterActionTypes } from "../types/quarter-redux";
import { CalendarActionTypes, ActionTypesCalendar } from "../types/calendar-redux";

import { Course, QuarterSeasons, RecentQuarters, CourseCatalogue } from '../../../shared/types';
import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk';
import { AppState } from '.';
import axios, { AxiosError } from "axios";


export const addCourse: ActionCreator<CalendarActionTypes>
    = (course: Course, quarter: QuarterSeasons) => ({
        type: ActionTypesCalendar.Add_COURSE,
        payload: {
            course,
            quarter
        }
    })


export const removeCourse: ActionCreator<CalendarActionTypes>
    = (classID: number, quarter: QuarterSeasons) => {
        return {
            type: ActionTypesCalendar.REMOVE_COURSE,
            payload: {
                classID,
                quarter
            }
        }
    }

export const setQuarter: ActionCreator<ThunkAction<Promise<QuarterActionTypes>, AppState, null, QuarterActionTypes>>
    = (quarterSeason: QuarterSeasons) =>
        async (dispatch) => {
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
                let { data: recentQuarters } = await axios.get<RecentQuarters>("localhost:4000/quarters");
                let quartersAction: QuarterActionTypes = {
                    type: ActionTypesQuarters.QUARTERS_SUCCESS,
                    payload: {
                        availableQuarters: recentQuarters.quarters
                    }
                }
                await dispatch(setQuarter(recentQuarters.currentQuarter))
                dispatch(quartersAction);
            } catch (err) {
                let res = err as AxiosError;
                console.log(res.response);
                if (res.response)
                    dispatch({
                        type: ActionTypesQuarters.QUARTERS_FAILED, payload: {
                            code: res.response.status, errMessage: res.response.statusText
                        }
                    });
            }
        }
