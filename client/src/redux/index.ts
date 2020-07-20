import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { calendarReducer, quarterReducer, coursePanelReducer } from './reducers'
import thunk from 'redux-thunk'

const rootReducer = combineReducers({
    calendarState: calendarReducer,
    quarterState: quarterReducer,
    coursePanelState: coursePanelReducer
});

export type AppState = ReturnType<typeof rootReducer>


export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

