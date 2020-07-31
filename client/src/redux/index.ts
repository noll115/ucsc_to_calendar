import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { calendarReducer, quarterReducer, coursePanelReducer, CourseSearchReducer } from './reducers'
import thunk from 'redux-thunk'




const rootReducer = combineReducers({
    calendarState: calendarReducer,
    quarterState: quarterReducer,
    coursePanelState: coursePanelReducer,
    courseSearchState: CourseSearchReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

