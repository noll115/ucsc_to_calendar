import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { calendarReducer, quarterReducer, coursesAvailableReducer } from './reducers'
import thunk from 'redux-thunk'

const rootReducer = combineReducers({
    calendarState: calendarReducer,
    quarterState: quarterReducer,
    courseState: coursesAvailableReducer
});

export type AppState = ReturnType<typeof rootReducer>


export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

