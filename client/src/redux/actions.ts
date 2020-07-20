import { ActionTypesQuarters, QuarterActionTypes } from "../types/quarter-redux";
import { CalendarActionTypes, ActionTypesCalendar } from "../types/calendar-redux";

import { Course, QuarterSeasons, RecentQuarters } from '../../../shared/types';
import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk';
import { AppState } from '.';
import axios, { AxiosError } from "axios";
import { CoursePanelActionTypes, ActionTypesCoursePanel } from "src/types/course-redux";


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


export const FetchQuarters: ActionCreator<ThunkAction<void, AppState, null, QuarterActionTypes>>
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
                            errorCode: res.response.data.status, errMessage: res.response.data.msg
                        }
                    });
                } else {
                    dispatch({
                        type: ActionTypesQuarters.QUARTERS_FAILED, payload: {
                            errorCode: 500, errMessage: "Something went wrong!"
                        }
                    });
                }
            }
        }


export const FetchCourse: ActionCreator<ThunkAction<void, AppState, null, CoursePanelActionTypes>>
    = (courseID: number, quarterID: number) =>
        async (dispatch, getState) => {
            dispatch({ type: ActionTypesCoursePanel.FETCH_COURSE });
            let courseCached = getState().coursePanelState.courseCache[courseID];
            if (courseCached) {
                let courseLoaded: CoursePanelActionTypes = {
                    type: ActionTypesCoursePanel.COURSE_LOADED,
                    payload: {
                        course: courseCached
                    }
                }
                return dispatch(courseLoaded)
            }
            try {
                let { data: course } = await axios.get<Course>("/courses", { params: { courseID, quarterID } });
                console.log(course);
                let courseLoaded: CoursePanelActionTypes = {
                    type: ActionTypesCoursePanel.COURSE_LOADED,
                    payload: {
                        course
                    }
                }
                dispatch(courseLoaded)
            } catch (err) {
                let res = err as AxiosError;
                console.log(res.response);
                if (res.response) {
                    dispatch({
                        type: ActionTypesCoursePanel.COURSE_FAILED, payload: {
                            errorCode: res.response.data.status, errMessage: res.response.data.msg
                        }
                    })
                } else {
                    dispatch({
                        type: ActionTypesCoursePanel.COURSE_FAILED, payload: {
                            errorCode: 500, errMessage: "Something went wrong!"
                        }
                    });
                }
            }

        }


export function ClosePanel(): CoursePanelActionTypes {
    return {
        type: ActionTypesCoursePanel.CLOSE_PANEL
    }
} 