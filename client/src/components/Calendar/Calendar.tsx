import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux'
import Button from '../Button/Button'
import "./Calendar.scss"
const mapStateToProps = (state: AppState) => ({

})

const mapDispatchToProps = {

}


const connected = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connected>

export const Calendar: FC<ReduxProps> = () => {


    return (
        <div className="calendarComponent">
            <label className="label">Schedule</label>
            <Button><i className="fas fa-download"></i></Button>
            <div className="calendar">
                <div className="days">
                    <div></div>
                    <div className="day">M</div>
                    <div className="day">Tu</div>
                    <div className="day">W</div>
                    <div className="day">Th</div>
                    <div className="day">F</div>
                </div>
                <div className="times">
                    <div>7am</div>
                    <div>8am</div>
                    <div>9am</div>
                    <div>10am</div>
                    <div>11am</div>
                    <div>12am</div>
                    <div>1pm</div>
                    <div>2pm</div>
                    <div>3pm</div>
                    <div>4pm</div>
                    <div>5pm</div>
                    <div>6pm</div>
                    <div>7pm</div>
                    <div>8pm</div>
                    <div>9pm</div>
                    <div>10pm</div>
                </div>

                <div className="content">
                    <span className="border"></span>
                    <span className="border"></span>
                    <span className="border"></span>
                    <span className="border"></span>
                    <span className="border"></span>
                    <span className="border"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                    <span className="crossBorder"></span>
                </div>
            </div>
        </div>
    )
}

export default connected(Calendar)
