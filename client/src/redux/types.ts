
import { Course } from '../models/courses-types'
import { Action } from 'redux'
export enum ActionTypes {
    Add_COURSE,
    REMOVE_COURSE,
    QUERY_COURSE,
    SELECT_QUARTER,
    SET_AVAIL_QUARTERS,
}
export enum Quarters {
    WINTER = "Winter",
    FALL = "Fall",
    SPRING = "Spring",
    SUMMER = "Summer"
}

interface AddCourseAction
    extends Action<ActionTypes.Add_COURSE> {
    payload: {
        course: Course,
        quarter: Quarters
    }
}

interface RemoveCourseAction
    extends Action<ActionTypes.REMOVE_COURSE> {
    payload: {
        classID: number
        quarter: Quarters
    }
}


export type CalendarState = {
    [key in Quarters]: Array<Course>
}


export type CourseActionTypes = AddCourseAction | RemoveCourseAction;



interface SelectQuarterAction
    extends Action<ActionTypes.SELECT_QUARTER> {
    payload: {
        quarter: Quarters
    }
}


interface SetAvailQuartersAction
    extends Action<ActionTypes.SET_AVAIL_QUARTERS> {
    payload: {
        availableQuarters: Array<Quarters>
    }
}

type CoursesAvailable = {
    [key in Quarters]: Array<string>
}

export interface QuartersState {
    availableQuarters: Array<Quarters>,
    selectedQuarter: Quarters,
    coursesAvailable: CoursesAvailable
}

export type QuarterActionTypes = SelectQuarterAction | SetAvailQuartersAction
