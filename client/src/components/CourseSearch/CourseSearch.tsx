import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux'
import "./CourseSearch.scss"

const mapStateToProps = (state: AppState) => {
    let { selectedQuarter } = state.quarterState;
    return {
        courses: state.courseState[selectedQuarter]
    }
}

const mapDispatchToProps = {
    
}

const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>



const CourseSearch: FC<reduxProps> = ({courses}) => {
    return (
        <div className="courseSearch">
            <label htmlFor="courseInput" className="label">Add Class</label>
            <p className="hint">e.g cse, cse 3, cse 3 - 01</p>
            <div className="courseInput">
                <i className="fas fa-search"></i>
                <input type="text" name="course input" id="courseInput" />
            </div>
        </div>
    )
}


export default connected(CourseSearch)
