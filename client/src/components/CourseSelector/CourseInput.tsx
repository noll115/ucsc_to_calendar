import React, { FC, useState, ChangeEvent } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';
import { addCourse, setQuarter } from '../../redux/actions'
import ResultsDropDown from './ResultsDropDown';
import { words } from "../../test";
import { ReactComponent as SearchLogo } from "./search.svg";

import './CourseInput.scss'
import { Quarters } from '../../redux/types';
import DropDownMenu, { Option } from './DropDownMenu';

const mapStateToProps = (state: AppState) => {
    let { selectedQuarter } = state.quarterState;
    return {
        selectedQuarter
    }
}

const mapDispatchToProps = {
    addCourse,
    setQuarter
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connector>

interface CourseInputProps extends reduxProps {
}

const CourseInput: FC<CourseInputProps> = ({ addCourse, selectedQuarter, setQuarter }) => {
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState<NodeJS.Timeout | null>(null);
    const [coursesQuery, setCourseQuery] = useState<string[]>([]);

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let text = e.target.value;
        setInput(text);
        typing && clearTimeout(typing);
        if (text.length >= 2) {
            let timeout = setTimeout(async () => {
                setCourseQuery(["CSE", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS", "SCS"]);
                setTyping(null)
            }, 1000);
            setTyping(timeout);
        }
        // find course related to it can be just course number or course name (ie "1234" or "CSE 3")
    }

    const quarters: Option<Quarters>[] = [
        { label: Quarters.FALL, value: Quarters.FALL },
        { label: Quarters.WINTER, value: Quarters.WINTER },
        { label: Quarters.SPRING, value: Quarters.SPRING },
        { label: Quarters.SUMMER, value: Quarters.SUMMER }
    ];


    let q = quarters.findIndex((option) => option.value === selectedQuarter);
    let currentOption = quarters[q];
    return (
        <span className="course-input" >
            <span className="course-textbox">
                <SearchLogo />
                <input value={input} onChange={onInputChange} type="text" name="course" id="course" />
                {/* <ResultsDropDown typing={typing != null} query={coursesQuery} /> */}
            </span>
            <DropDownMenu defaultVal={currentOption} options={quarters.filter(op => op !== currentOption)} onClickOption={setQuarter} />
        </span>
    )
}


export default connector(CourseInput)
