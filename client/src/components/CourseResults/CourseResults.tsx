import React, { FC, useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux';
import { FetchCourse, SetShowResults } from "../../redux/actions";
import "./CourseResults.scss"



const mapStateToProps = (state: AppState) => {
    let { availableQuarters, selectedQuarter } = state.quarterState;
    let quarter = availableQuarters[selectedQuarter];
    return {
        courses: quarter?.courses,
        quarterID: quarter?.id,
        courseSearchState: state.courseSearchState
    };
}

const mapDispatchToProps = {
    FetchCourse, SetShowResults
}


const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>



interface LiProps {
    course: { sub: string, courseNum: string, section: string }
    selected: boolean
    onClick: (course: { sub: string, courseNum: string, section: string }) => void
}

const Li: FC<LiProps> = ({ course, selected, onClick }) => {
    const ref = useRef<HTMLLIElement>(null);
    if (selected) {
        ref.current?.scrollIntoView({ block: "end" })
    }
    const onClickHandler = () => {
        onClick(course);
    }
    return (<li className={selected ? "selected" : undefined} onClick={onClickHandler} ref={ref} >{`${course.sub} ${course.courseNum} - ${course.section}`}</li>)
}

interface props extends reduxProps {
}


const CourseResults: FC<props> = ({ courseSearchState: { cursor, coursesResults, showResults }, SetShowResults, courses, FetchCourse, quarterID }) => {

    if (!showResults) {
        return null;
    }

    let onClickItem = (course: { sub: string, courseNum: string, section: string }) => {
        if (!courses) return;
        let courseID = courses[course.sub][course.courseNum][course.section];
        SetShowResults(false);
        FetchCourse(courseID, quarterID);
    };

    return (
        <div className="results">
            {coursesResults ?
                <ul >
                    {coursesResults.map((str, i) => <Li key={i} course={str} selected={i === cursor} onClick={onClickItem} />)}
                </ul> 
                : <div className="typeHint">Need at least 2 or more characters</div>}
        </div>
    )
}


export default connected(CourseResults)
