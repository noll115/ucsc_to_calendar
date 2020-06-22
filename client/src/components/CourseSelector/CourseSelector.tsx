import React, { FC } from 'react';
import CourseInput from './CourseInput';
import CourseSelectedList from './CourseSelectedList';
import './CourseSelector.scss'
export const CourseSelector: FC = () => {
    return (
        <div className="course-selector">
            <CourseInput />
            <CourseSelectedList />
        </div>
    )
}


