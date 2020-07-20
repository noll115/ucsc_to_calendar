import { Action } from 'redux';
import { Course } from '../../../shared/types';

export enum ActionTypesCoursePanel {
    FETCH_COURSE = "FETCH_COURSE",
    COURSE_LOADED = "COURSE_LOADED",
    COURSE_FAILED = "COURSE_FAILED",
    CLOSE_PANEL = "CLOSE_PANEL"

}


interface CourseFetchAction
    extends Action<ActionTypesCoursePanel.FETCH_COURSE> {
}

interface CourseLoadedAction
    extends Action<ActionTypesCoursePanel.COURSE_LOADED> {
    payload: {
        course: Course
    }
}

interface CourseFailedAction
    extends Action<ActionTypesCoursePanel.COURSE_FAILED> {
    payload: {
        errMessage: string,
        errorCode: number
    }
}


interface ClosePanelAction
    extends Action<ActionTypesCoursePanel.CLOSE_PANEL> {

}


export interface CoursePanelState {
    courseCache: { [index: number]: Course }
    currentCourseViewing: Course | null
    fetching: boolean
    showPanel: boolean,
    errMessage: string,
    errorCode: number
}


export type CoursePanelActionTypes = ClosePanelAction | CourseLoadedAction | CourseFailedAction | CourseFetchAction;