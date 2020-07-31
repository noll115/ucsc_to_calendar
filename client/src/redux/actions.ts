import { ActionTypesQuarters, QuarterActionTypes } from "../types/quarter-redux";
import { CalendarActionTypes, ActionTypesCalendar, CourseAdded } from "../types/calendar-redux";

import { Course, QuarterSeasons, RecentQuarters } from '../../../shared/types';
import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk';
import { AppState } from '.';
import axios, { AxiosError } from "axios";
import { CoursePanelActionTypes, ActionTypesCoursePanel } from "src/types/coursePanel-redux";
import { CourseSearchActionTypes, ActionTypesCourseSearch } from "src/types/courseSearch-redux";


export function AddCourse(course: CourseAdded, quarter: QuarterSeasons, isNew: boolean): CalendarActionTypes {
    return {
        type: ActionTypesCalendar.Add_COURSE,
        payload: {
            newCourse: course,
            quarter,
            isNew
        }
    }
}


export function RemoveCourse(courseID: number, quarter: QuarterSeasons): CalendarActionTypes {
    return {
        type: ActionTypesCalendar.REMOVE_COURSE,
        payload: {
            courseID,
            quarter
        }
    }
}

export function SetCalendars(calendars: { [key in QuarterSeasons]: CourseAdded[] }): CalendarActionTypes {
    for (const quarterSeason in calendars) {
        const coursesAdded = calendars[quarterSeason as QuarterSeasons];
        let coursesLocalized = coursesAdded.map((courseAdded) => {
            let { course } = courseAdded;
            course.meets = course.meets.map(({ days, endTime, loc, startTime }) => {
                return {
                    days: IcalToUCSC(days),
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    loc
                }
            });
            course.labs.labs = course.labs.labs.map(({ id, meet, sect }) => {
                if (meet !== "N/A" && meet !== "TBA") {
                    meet = {
                        days: IcalToUCSC(meet.days),
                        startTime: new Date(meet.startTime),
                        endTime: new Date(meet.endTime),
                        loc: meet.loc
                    }
                }
                return {
                    id,
                    meet,
                    sect
                }
            });
            return courseAdded;
        });
        calendars[quarterSeason as QuarterSeasons] = coursesLocalized;
    }


    return {
        type: ActionTypesCalendar.SET_CALENDARS,
        payload: {
            calendars
        }
    }
}


export function SetQuarter(quarterSeason: QuarterSeasons): QuarterActionTypes {

    return {
        type: ActionTypesQuarters.SELECT_QUARTER,
        payload: {
            quarterSeason
        }
    }
}


export function SetShowKeyDate(show: boolean): QuarterActionTypes {
    return {
        type: ActionTypesQuarters.SET_SHOW_KEYDATES,
        payload: {
            show
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

                    let { data } = res.response;
                    if (typeof data === "object") {
                        return dispatch({
                            type: ActionTypesQuarters.QUARTERS_FAILED,
                            payload: {
                                errCode: res.response.data.status,
                                errMessage: res.response.data.msg
                            }
                        });
                    }
                }
                dispatch({
                    type: ActionTypesQuarters.QUARTERS_FAILED,
                    payload: {
                        errCode: 500,
                        errMessage: "Can't connect to server!"
                    }
                });
            }
        }



const iCalDates = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const UCSCDates = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];



function IcalToUCSC(days: string[]) {
    return days.map((str, i) => {
        let index = iCalDates.indexOf(str);
        return UCSCDates[index];
    });
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
                course.meets = course.meets.map(({ days, endTime, loc, startTime }) => {
                    return {
                        days: IcalToUCSC(days),
                        startTime: new Date(startTime),
                        endTime: new Date(endTime),
                        loc
                    }
                });
                course.labs.labs = course.labs.labs.map(({ id, meet, sect }) => {
                    if (meet !== "N/A" && meet !== "TBA") {
                        meet = {
                            days: IcalToUCSC(meet.days),
                            startTime: new Date(meet.startTime),
                            endTime: new Date(meet.endTime),
                            loc: meet.loc
                        }
                    }
                    return {
                        id,
                        meet,
                        sect
                    }
                });
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
                    let { data } = res.response;

                    if (typeof data === "object") {
                        return dispatch({
                            type: ActionTypesCoursePanel.COURSE_FAILED, payload: {
                                errCode: data.status, errMessage: data.msg
                            }
                        })
                    }
                }
                dispatch({
                    type: ActionTypesCoursePanel.COURSE_FAILED, payload: {
                        errCode: 500, errMessage: "Can't connect to server!"
                    }
                });

            }

        }


export function ClosePanel(): CoursePanelActionTypes {
    return {
        type: ActionTypesCoursePanel.CLOSE_PANEL
    }
}


export function CursorUp(): CourseSearchActionTypes {
    return {
        type: ActionTypesCourseSearch.CURSOR_UP
    }
}
export function CursorDown(): CourseSearchActionTypes {
    return {
        type: ActionTypesCourseSearch.CURSOR_DOWN
    }
}
export function SetResults(results: { sub: string, courseNum: string, section: string }[] | null): CourseSearchActionTypes {
    return {
        type: ActionTypesCourseSearch.SET_RESULTS,
        payload: { courseResults: results }
    }
}

export function SetShowResults(show: boolean): CourseSearchActionTypes {
    return {
        type: ActionTypesCourseSearch.SET_SHOW_RESULTS,
        payload: {
            show
        }
    }
}
