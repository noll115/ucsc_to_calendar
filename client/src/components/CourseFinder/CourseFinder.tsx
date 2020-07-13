import React, { FC, useState, ChangeEvent } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';
import { addCourse, setQuarter } from '../../redux/actions'

import DropDownMenu, { Option } from '../DropDownMenu/DropDownMenu';

import './CourseFinder.scss'
import { Quarters } from '../../../../shared/types';


const CourseFinder: FC = () => {
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState<NodeJS.Timeout | null>(null);

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let text = e.target.value;
        setInput(text);
        typing && clearTimeout(typing);
        if (text.length >= 2) {
            let timeout = setTimeout(async () => {
                setTyping(null)
            }, 1000);
            setTyping(timeout);
        }
    }



    return (
        <span className="course-input" >
            <span className="course-textbox">
                <span></span>
                <input value={input} onChange={onInputChange} type="text" name="course" id="course" />
                {/* <ResultsDropDown typing={typing != null} query={coursesQuery} /> */}
            </span>
        </span>
    )
}

export default CourseFinder;
