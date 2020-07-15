import React, { Component, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux'

const mapStateToProps = (state: AppState) => ({

})

const mapDispatchToProps = {

}

const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>



const CourseSearch: FC<reduxProps> = () => {
    return (
        <div>

        </div>
    )
}


export default connected(CourseSearch)
