import { QuarterSeasons } from "../../../shared/types";
import { Action } from 'redux'

export enum ActionTypesCourses {
    FETCH_COURSES,
    FETCH_COURSES_SUCCESS,
    FETCH_COURSES_FAIL
}

export interface fetchCourseAction
    extends Action<ActionTypesCourses.FETCH_COURSES> {

}

export type CoursesAvailableState = {
    [key in QuarterSeasons]: string[]
}

export type CourseActionTypes = fetchCourseAction