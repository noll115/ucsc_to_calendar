import React, { FC } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../../redux'


const mapStateToProps = (state: AppState) => ({

})

const mapDispatchToProps = {

}

interface Props {
    query: string[],
    typing: boolean
}

const DropDown: FC<Props> = ({ query, typing }) => {

    return (
        <ul>
            {!typing ? query.map((courseTitle, i) => <li key={i}>{courseTitle}</li>) : null}
        </ul>
    )
}



export default connect(mapStateToProps, mapDispatchToProps)(DropDown)
