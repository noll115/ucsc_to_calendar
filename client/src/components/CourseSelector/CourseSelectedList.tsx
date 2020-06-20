import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';

const mapStateToProps = (state: AppState) => {
    let { selectedQuarter } = state.quarterState;
    let coursesSelected = state.calendarState[selectedQuarter]
    return {
        courses: coursesSelected
    }
}

const mapDispatchToProps = {
}


const connector = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connector>


interface Props extends ReduxProps {

}


const CourseSelectedList: FC<Props> = ({ courses }) => {

    let courseElems = courses.map((course) =>
        (<div>
            {course.title}
        </div>))

    return (
        <div>
            {courseElems}
        </div>
    )
}



export default connector(CourseSelectedList)
