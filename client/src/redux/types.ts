export enum ActionTypes {
    ADD_CLASS = "add_class",
    REMOVE_CLASS = "remove_class"
}

interface AddClassAction {
    type: ActionTypes.ADD_CLASS,
    classID: number | null,
    className: string | null
}

interface RemoveClassAction {
    type: ActionTypes.REMOVE_CLASS,
    classID: number
}

export interface ClassInfo {

}

export interface ClassSelectionState {
    classesSelected: ClassInfo[]
}

export type ClassActionTypes = AddClassAction | RemoveClassAction;