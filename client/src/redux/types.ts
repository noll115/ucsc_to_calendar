
import { Course } from '../models/courses-types'
import { Action } from 'redux'
export enum ActionTypes {
    Add_COURSE,
    REMOVE_COURSE,
    QUERY_COURSE,
    SELECT_QUARTER,
    SET_AVAIL_QUARTERS,
}
export enum Quarter {
    WINTER = "Winter",
    FALL = "Fall",
    SPRING = "Spring",
    SUMMER = "Summer"
}

interface AddCourseAction
    extends Action<ActionTypes.Add_COURSE> {
    payload: {
        course: Course,
        quarter: Quarter
    }
}

interface RemoveCourseAction
    extends Action<ActionTypes.REMOVE_COURSE> {
    payload: {
        classID: number
        quarter: Quarter
    }
}


export type CalendarState = {
    [key in Quarter]: Array<Course>
}


export type CourseActionTypes = AddCourseAction | RemoveCourseAction;



interface SelectQuarterAction
    extends Action<ActionTypes.SELECT_QUARTER> {
    payload: {
        quarter: Quarter
    }
}


interface SetAvailQuartersAction
    extends Action<ActionTypes.SET_AVAIL_QUARTERS> {
    payload: {
        availableQuarters: Array<Quarter>
    }
}

type CoursesAvailable = {
    [key in Quarter]: Array<string>
}

export interface QuartersState {
    availableQuarters: Array<Quarter>,
    selectedQuarter: Quarter,
    coursesAvailable: CoursesAvailable
}

export type QuarterActionTypes = SelectQuarterAction | SetAvailQuartersAction
