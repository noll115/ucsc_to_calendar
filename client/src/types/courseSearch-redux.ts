import { Action } from "redux";

export enum ActionTypesCourseSearch {
    CURSOR_UP = "CURSOR_UP",
    CURSOR_DOWN = "CURSOR_DOWN",
    SET_RESULTS = "SET_RESULTS",
    SET_SHOW_RESULTS = "SET_SHOW_RESULTS"
}

interface CursorUpAction
    extends Action<ActionTypesCourseSearch.CURSOR_UP> {

}

interface CursorDownAction
    extends Action<ActionTypesCourseSearch.CURSOR_DOWN> {

}


interface SetCourseResultsAction
    extends Action<ActionTypesCourseSearch.SET_RESULTS> {
    payload: {
        courseResults: { sub: string, courseNum: string, section: string }[] | null
    }
}

interface SetShowResultsAction
    extends Action<ActionTypesCourseSearch.SET_SHOW_RESULTS> {
    payload: {
        show: boolean
    }
}

export interface CourseSearchState {
    cursor: number,
    coursesResults: { sub: string, courseNum: string, section: string }[] | null,
    currentCourse: { sub: string, courseNum: string, section: string } | null,
    showResults: boolean
}

export type CourseSearchActionTypes = CursorUpAction | CursorDownAction | SetCourseResultsAction | SetShowResultsAction;