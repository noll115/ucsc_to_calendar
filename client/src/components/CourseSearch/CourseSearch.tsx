import React, { FC, ChangeEvent, useRef, useEffect, KeyboardEvent } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux'
import "./CourseSearch.scss"
import CourseResults from '../CourseResults/CourseResults'
import { CursorUp, CursorDown, SetResults, FetchCourse, SetShowResults } from "../../redux/actions";
import CoursePanel from '../CoursePanel/CoursePanel'

const mapStateToProps = (state: AppState) => {
    let { selectedQuarter } = state.quarterState;
    let quarter = state.quarterState.availableQuarters[selectedQuarter];
    return {
        courses: quarter ? quarter.courses : {},
        quarterID: quarter?.id,
        courseSearchState: state.courseSearchState
    }
}

const mapDispatchToProps = {
    CursorUp, CursorDown, SetResults, FetchCourse, SetShowResults
}

const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>

const inputRegex = /(\w+)\s*(\w*)\s*-*\s*(\d*)\s*/i;




const CourseSearch: FC<reduxProps> = ({ FetchCourse, CursorDown, CursorUp, SetResults, SetShowResults, courseSearchState, courses, quarterID }) => {
    let { currentCourse, showResults } = courseSearchState

    let onChange = (e: ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;
        if (input.length < 2) {
            SetResults(null)
            return;
        }
        let regexResults = input.match(inputRegex);
        if (regexResults) {
            let [, subject, courseNumber, section,] = regexResults;
            let subs = Object.keys(courses);
            let reg = new RegExp("^" + subject, "i");

            let matchedCourses: { sub: string, courseNum: string, section: string }[] = [];
            let subStr = subject.toUpperCase();
            let courseNumStr = courseNumber.toUpperCase();
            if (courses && courses[subStr] && courses[subStr][courseNumStr] && courses[subStr][courseNumStr][section]) {
                return SetResults([{ sub: subStr, courseNum: courseNumStr, section: section }])
            }

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
            SetResults(matchedCourses);
        }
    }


    const courseInputRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);


    const handleKeyDown = (e: KeyboardEvent) => {
        if (showResults) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
                switch (e.key) {
                    case "ArrowDown":
                        CursorDown();
                        break;
                    case "ArrowUp":
                        CursorUp();
                        break;
                    case "Enter":
                        if (currentCourse) {
                            let { sub, courseNum, section } = currentCourse;
                            let courseID = courses[sub][courseNum][section];
                            FetchCourse(courseID, quarterID)
                            SetShowResults(false);
                        }
                        break;
                }
                e.preventDefault();
            }
        }
    }

    useEffect(() => {
        const handleClickedOutside = (e: MouseEvent) => {
            if (courseInputRef.current && !courseInputRef.current.contains(e.target as Node)) {
                showResults !== false && SetShowResults(false)
            }
            else {
                showResults !== true && SetShowResults(true)
            }
        }
        SetResults(null)

        document.addEventListener('mousedown', handleClickedOutside)
        if (inputRef.current)
            inputRef.current.value = "";
        return () => {
            document.removeEventListener('mousedown', handleClickedOutside)
        }
    }, [courseInputRef, courses, SetShowResults,SetResults,showResults])



    return (
        <div className="courseSearch">
            <label htmlFor="courseInput" className="label">Add Class</label>
            <p className="hint">e.g cse, cse 3, cse 3 - 01</p>
            <div className="courseInput" ref={courseInputRef}>
                <i className="fas fa-search" onClick={() => inputRef.current?.focus()}></i>
                <input type="text" ref={inputRef} name="courseInput" onKeyDown={handleKeyDown} onChange={onChange} id="courseInput" maxLength={20} />
                <CourseResults />
            </div>
        </div>
    )
}


export default connected(CourseSearch)
