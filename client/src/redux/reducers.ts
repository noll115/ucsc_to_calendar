import { ClassSelectionState, ActionTypes } from './types';

const initialState: ClassSelectionState = {
    classesSelected: []
}

export function classReducer(state = initialState, action: ActionTypes): ClassSelectionState {
    switch (action) {
        case ActionTypes.ADD_CLASS:
            return {
                classesSelected: []
            }
            break;
        case ActionTypes.REMOVE_CLASS:
            return {
                classesSelected: []
            }
            break;
        default:
            return state;
            break;
    }
}