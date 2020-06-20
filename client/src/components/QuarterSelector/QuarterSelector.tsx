import React, { Component, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux'

const mapStateToProps = (state: AppState) => ({

})

const mapDispatchToProps = {

}
const connector = connect(mapStateToProps, mapDispatchToProps)

type ReduxProps = ConnectedProps<typeof connector>

interface Props extends ReduxProps {

}

const QuarterSelector: FC<Props> = () => {
    const quarters = ["fall", "winter", "spring", "summer"];
    return (
        <span>
            {}
            <ul>
                {quarters.map(quarter => (<li>{quarter}</li>))}
            </ul>
        </span>

    )
}


export default connector(QuarterSelector)
