import { Quarter, Quarters, QuarterSeasons, Courses, CourseCatalogue } from '../../../shared/types'
import { Action } from 'redux'


export enum ActionTypesQuarters {
    SELECT_QUARTER = "SELECT_QUARTER",
    QUARTERS_REQUESTED = "QUARTERS_REQ",
    QUARTERS_SUCCESS = "QUARTERS_SUC",
    QUARTERS_FAILED = "QUARTERS_FAIL",
}

interface SelectQuarterAction
    extends Action<ActionTypesQuarters.SELECT_QUARTER> {
    payload: {
        quarterSeason: QuarterSeasons
    }
}

interface FetchAvailQuartersAction
    extends Action<ActionTypesQuarters.QUARTERS_REQUESTED> {
}

interface SuccessFetchAvailQuartersAction
    extends Action<ActionTypesQuarters.QUARTERS_SUCCESS> {
    payload: {
        availableQuarters: Quarters,
        quarterSeason:QuarterSeasons
    }
}


interface FailFetchAvailQuartersAction
    extends Action<ActionTypesQuarters.QUARTERS_FAILED> {
    payload: {
        code: number,
        errMessage: string
    }
}

export interface QuartersState {
    availableQuarters: Quarters,
    selectedQuarter: QuarterSeasons | null,
    fetching: boolean,
    errMessage: string,
    code: Number
}

export type QuarterActionTypes = SelectQuarterAction | SuccessFetchAvailQuartersAction | FailFetchAvailQuartersAction | FetchAvailQuartersAction;
