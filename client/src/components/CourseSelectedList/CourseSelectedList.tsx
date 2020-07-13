import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux';

const mapStateToProps = (state: AppState) => {
    return {

    }
}

const mapDispatchToProps = {
}


const connector = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connector>


interface Props extends ReduxProps {

}


const CourseSelectedList: FC<Props> = () => {


    return (
        <div>
        </div>
    )
}



export default connector(CourseSelectedList)
