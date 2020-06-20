import React, { FC, useState, ChangeEvent, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';
import { addCourse } from '../../redux/actions'
import ResultsDropDown from './ResultsDropDown';
import { words } from "../../test";
import QuarterSelector from '../QuarterSelector/QuarterSelector';

const mapStateToProps = (state: AppState) => ({
})

const mapDispatchToProps = {
    addCourse
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connector>

interface CourseInputProps extends reduxProps {
}

const CourseInput: FC<CourseInputProps> = ({ addCourse }) => {
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
    return (
        <span className="courseInput">
            <span>
                <label htmlFor="course">Course</label>
                <input value={input} onChange={onInputChange} type="text" name="course" id="course" />
                <ResultsDropDown typing={typing != null} query={coursesQuery} />
            </span>
            <QuarterSelector />
        </span>
    )
}


export default connector(CourseInput)
