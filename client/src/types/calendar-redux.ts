import { Course } from '../../../shared/types'
import { QuarterSeasons } from '../../../shared/types'
import { Action } from 'redux'


export enum ActionTypesCalendar {
    Add_COURSE = "ADD_COURSE",
    REMOVE_COURSE = "REM_COURSE",
    QUERY_COURSE = "QUERY_COURSE",

}

export interface CourseAdded {
    course: Course,
    labChosen: number
}


interface AddCourseAction
    extends Action<ActionTypesCalendar.Add_COURSE> {
    payload: {
        newCourse: CourseAdded,
        quarter: QuarterSeasons,
        isNew: boolean
    }
}

interface RemoveCourseAction
    extends Action<ActionTypesCalendar.REMOVE_COURSE> {
    payload: {
        courseID: number
        quarter: QuarterSeasons
    }
}


export type CalendarState = {
    calendars: { [key in QuarterSeasons]: CourseAdded[] }
}


export type CalendarActionTypes = AddCourseAction | RemoveCourseAction;

