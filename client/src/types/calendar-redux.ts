import { Course } from '../../../shared/types'
import { QuarterSeasons } from '../../../shared/types'
import { Action } from 'redux'


export enum ActionTypesCalendar {
    Add_COURSE = "ADD_COURSE",
    REMOVE_COURSE = "REM_COURSE",
    QUERY_COURSE = "QUERY_COURSE",

}


interface AddCourseAction
    extends Action<ActionTypesCalendar.Add_COURSE> {
    payload: {
        course: Course,
        quarter: QuarterSeasons
    }
}

interface RemoveCourseAction
    extends Action<ActionTypesCalendar.REMOVE_COURSE> {
    payload: {
        classID: number
        quarter: QuarterSeasons
    }
}


export type CalendarState = {
    calendars: { [key in QuarterSeasons]: Course[] }
}


export type CalendarActionTypes = AddCourseAction | RemoveCourseAction;

