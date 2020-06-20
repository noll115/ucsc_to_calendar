import React, { FC } from 'react';
import CourseInput from './CourseInput';
import CourseSelectedList from './CourseSelectedList';
import './CourseSelector.css';

export const CourseSelector: FC = () => {
    return (
        <div>
            <CourseInput />
            <CourseSelectedList />
        </div>
    )
}


