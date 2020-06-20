import React, { Component, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';
import { removeCourse } from '../../redux/actions'
import { Course } from '../../models/courses-types';


const mapDispatchToProps = {
    removeCourse
}

const connector = connect(undefined, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connector>

interface Props extends reduxProps {
    course: Course
}

const CourseSelected: FC<Props> = ({ removeCourse, course }) => {
    return (
        <div>
            <span>
                <span></span>
                <button></button>
            </span>
        </div>
    )
}
export default connector(CourseSelected)
