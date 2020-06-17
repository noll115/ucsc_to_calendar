import { ActionTypes, ClassActionTypes } from './types';

export function addClass(classID: number | null, className: string | null): ClassActionTypes {
    return {
        type: ActionTypes.ADD_CLASS,
        classID,
        className
    }
}

export function removeClass(classID: number) {
    type: ActionTypes.REMOVE_CLASS,
        classID
}
