import { Quarters, QuarterSeasons } from '../../../shared/types'
import { Action } from 'redux'


export enum ActionTypesQuarters {
    SELECT_QUARTER = "SELECT_QUARTER",
    QUARTERS_REQUESTED = "QUARTERS_REQ",
    QUARTERS_SUCCESS = "QUARTERS_SUC",
    QUARTERS_FAILED = "QUARTERS_FAIL",
    SET_SHOW_KEYDATES = "SET_SHOW_KEYDATES"
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
        quarterSeason: QuarterSeasons
    }
}


interface FailFetchAvailQuartersAction
    extends Action<ActionTypesQuarters.QUARTERS_FAILED> {
    payload: {
        errCode: number,
        errMessage: string
    }
}

interface SetShowKeydates
    extends Action<ActionTypesQuarters.SET_SHOW_KEYDATES> {
    payload: {
        show: boolean
    }
}

export interface QuartersState {
    availableQuarters: Quarters | null,
    selectedQuarter: QuarterSeasons,
    fetching: boolean,
    showKeyDates: boolean,
    errMessage: string,
    errCode: Number
}

export type QuarterActionTypes =
    SelectQuarterAction
    | SuccessFetchAvailQuartersAction
    | FailFetchAvailQuartersAction
    | FetchAvailQuartersAction
    | SetShowKeydates
