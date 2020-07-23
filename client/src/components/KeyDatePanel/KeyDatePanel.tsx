import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from 'src/redux'
import { SetShowKeyDate } from "../../redux/actions";
import Button from "../Button/Button";

import "./KeyDatePanel.scss"
import Modal from '../Modal/Modal';

const mapStateToProps = (state: AppState) => {
    let { availableQuarters, selectedQuarter, showKeyDates } = state.quarterState;
    let currentQuarter = availableQuarters[selectedQuarter];
    return {
        currentQuarter: currentQuarter || null,
        quarterSeason: selectedQuarter,
        showKeyDates
    }
}

const mapDispatchToProps = {
    SetShowKeyDate
}

const connected = connect(mapStateToProps, mapDispatchToProps);

type ReduxProps = ConnectedProps<typeof connected>;


const KeyDatePanel: FC<ReduxProps> = ({ currentQuarter, quarterSeason, showKeyDates, SetShowKeyDate }) => {

    if (currentQuarter && showKeyDates) {
        const HideKeyDate = () => {
            SetShowKeyDate(false);
        }

        let { keyDates, year } = currentQuarter;
        let firstDayOfFinal = new Date(keyDates?.finals[0] as string).toDateString();
        let lastDayOfFinal = new Date(keyDates?.finals[keyDates.finals.length - 1] as string).toDateString();
        let strFirstDayFinal = firstDayOfFinal.substring(firstDayOfFinal.indexOf(" ") + 1, firstDayOfFinal.lastIndexOf(" "));
        let strLastDayOfFinal = lastDayOfFinal.substring(lastDayOfFinal.indexOf(" ") + 1, lastDayOfFinal.lastIndexOf(" "));
        let holidayDates = (keyDates?.holidays as string[]).map((dateStr: string) => {
            let date = new Date(dateStr).toDateString();
            return date.substring(date.indexOf(" ") + 1, date.lastIndexOf(" "));
        });
        let instrBeg = new Date(keyDates?.quarter.begins as string).toDateString();
        let instrEnd = new Date(keyDates?.quarter.ends as string).toDateString();


        return (
            <Modal styleName="keyDataInfo">
                <div>{`${(quarterSeason as string).charAt(0).toUpperCase() + (quarterSeason as string).slice(1)} ${year}`}</div>
                <div>
                    <p>-Instruction-</p>
                    <span>
                        <div>Begins:</div>
                        <div>Ends:</div>
                    </span>
                    <span>
                        <div>{instrBeg.substring(instrBeg.indexOf(" "), instrBeg.lastIndexOf(" "))}</div>
                        <div>{instrEnd.substring(instrEnd.indexOf(" "), instrEnd.lastIndexOf(" "))}</div>
                    </span>
                </div>
                <div>
                    <p>-Finals-</p>
                    <p>{`${strFirstDayFinal} - ${strLastDayOfFinal}`}</p>
                </div>
                <div>
                    <p>-Holidays-</p>
                    <p>{`${holidayDates.join(", ")}`}</p>
                </div>
                <Button onClick={HideKeyDate} >Done</Button>
            </Modal>
        );
    }
    return null;
}


export default connected(KeyDatePanel)
