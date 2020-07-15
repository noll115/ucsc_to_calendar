import { QuarterSeasons } from "../../../shared/types";
import { Action } from 'redux'

export enum ActionTypesCourses {
    FETCH_COURSES = "FETCH_COURSES",
    FETCH_COURSES_SUCCESS = "COURSES_SUC",
    FETCH_COURSES_FAIL = "COURSES_FAIL"
}

export interface fetchCourseAction
    extends Action<ActionTypesCourses.FETCH_COURSES> {

}
export interface fetchFailedCourseAction
    extends Action<ActionTypesCourses.FETCH_COURSES_FAIL> {

}

export interface fetchSuccessCourseAction
    extends Action<ActionTypesCourses.FETCH_COURSES_SUCCESS> {

}

export type CoursesAvailableState = {
    [key in QuarterSeasons]: string[]
}

export type CourseActionTypes = fetchCourseAction | fetchSuccessCourseAction | fetchFailedCourseAction;