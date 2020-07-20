import React, { FC, ChangeEvent, useState, useRef, useEffect, KeyboardEvent } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux'
import "./CourseSearch.scss"
import CourseResults from '../CourseResults/CourseResults'

const mapStateToProps = (state: AppState) => {
    let { selectedQuarter } = state.quarterState;
    let quarter = state.quarterState.availableQuarters[selectedQuarter];
    if (quarter)
        return {
            courses: quarter.courses,
        }
    else
        return {
            courses: {},
        }
}

const mapDispatchToProps = {

}

const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>

const inputRegex = /(\w+)\s*(\w*)\s*-*\s*(\d*)\s*/i;




const CourseSearch: FC<reduxProps> = ({ courses }) => {

    let [results, setResults] = useState<{ sub: string, courseNum: string, section: string }[] | null>(null);
    let [showResults, setShowResults] = useState(false);
    let [cursor, setCursor] = useState(-1);


    let onChange = (e: ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;
        if (input.length < 2) {
            setResults(null)
            return;
        }
        let regexResults = input.match(inputRegex);
        if (regexResults) {
            let [, subject, courseNumber, section,] = regexResults;
            let subs = Object.keys(courses);
            let reg = new RegExp("^" + subject, "i");

            let matchedCourses: { sub: string, courseNum: string, section: string }[] = [];
            for (let i = 0; i < subs.length; i++) {
                const sub = subs[i];
                if (reg.test(sub)) {
                    let subCourses = courses[sub];
                    let subCoursesKeys = Object.keys(subCourses);
                    if (courseNumber.length > 0) {
                        let regCourse = new RegExp("^" + courseNumber, "i");
                        for (let j = 0; j < subCoursesKeys.length; j++) {
                            const subCourseKey = subCoursesKeys[j];
                            if (regCourse.test(subCourseKey)) {
                                let sections = subCourses[subCourseKey];
                                let sectionKeys = Object.keys(sections);
                                if (section.length > 0) {
                                    for (let k = 0; k < sectionKeys.length; k++) {
                                        const sectionNumStri = sectionKeys[k];
                                        if (sectionNumStri.indexOf(section) !== -1) {
                                            matchedCourses.push({
                                                sub, courseNum: subCourseKey, section: sectionNumStri
                                            });
                                        }
                                    }
                                } else {
                                    matchedCourses = matchedCourses.concat(sectionKeys.map(str => ({ sub, courseNum: subCourseKey, section: str })))
                                }
                            }
                        }
                    } else {
                        for (let j = 0; j < subCoursesKeys.length; j++) {
                            const subCourse = subCoursesKeys[j];
                            let sectionKeys = Object.keys(subCourses[subCourse]);
                            matchedCourses = matchedCourses.concat(sectionKeys.map(str => ({ sub, courseNum: subCourse, section: str })))
                        }
                    }

                }
            }
            setResults(matchedCourses);
        }
    }


    const courseInputRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const showResRef = useRef(showResults);

    const handleClickedOutside = (e: MouseEvent) => {
        if (courseInputRef.current && !courseInputRef.current.contains(e.target as Node)) {
            setShowResults(false)
            showResRef.current = false;
        }
        else {
            setShowResults(true)
            showResRef.current = true;

        }
    }


    const handleKeyDown = (e: KeyboardEvent) => {
        if (!showResRef.current)
            return
        if (results) {
            if (e.key === 'ArrowDown' && cursor < results.length - 1) {
                console.log("DOWN");
                setCursor(prev => prev + 1);
                e.preventDefault();

            } else if (e.key === 'ArrowUp' && cursor > 0) {
                console.log("UP");
                setCursor(prev => prev - 1);
                e.preventDefault();
            }
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickedOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickedOutside)
        }
    }, [courseInputRef])



    return (
        <div className="courseSearch">
            <label htmlFor="courseInput" className="label">Add Class</label>
            <p className="hint">e.g cse, cse 3, cse 3 - 01</p>
            <div className="courseInput" ref={courseInputRef}>
                <i className="fas fa-search" onClick={() => inputRef.current?.focus()}></i>
                <input type="text" ref={inputRef} name="courseInput" onKeyDown={handleKeyDown} onChange={onChange} id="courseInput" maxLength={20} />
                <CourseResults show={showResults} results={results} cursor={cursor} />
            </div>
        </div>
    )
}


export default connected(CourseSearch)
