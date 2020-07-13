import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../../redux'
import DropDownMenu, { Option } from "../DropDownMenu/DropDownMenu"
export const QuarterSelect = () => {
    return (
        <div>
            <label htmlFor=""></label>

        </div>
    )
}

const mapStateToProps = (state: AppState) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(QuarterSelect)
