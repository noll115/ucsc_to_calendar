import React, { useEffect, FC, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux'
import SelectMenu, { Option } from "../SelectMenu/SelectMenu"
import { FetchQuarters, setQuarter } from "../../redux/actions";
import { QuarterSeasons, Quarter } from '../../../../shared/types';
import "./QuarterSelect.scss"

const mapStateToProps = (state: AppState) => ({
    availableQuarters: state.quarterState.availableQuarters,
    currentQuarter: state.quarterState.selectedQuarter,
    fetching: state.quarterState.fetching,
    errmessage: state.quarterState.errMessage,
    code: state.quarterState.errorCode
})

const mapDispatchToProps = {
     FetchQuarters,
    setQuarter
}

const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>


function KeyDatePanel(quarter: Quarter | undefined, quarterSeason: QuarterSeasons, onClick: () => void) {
    if (quarter) {
        let { keyDates, year } = quarter;
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
            <div className="container keyDataInfo">
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
                <button onClick={onClick} className="btn">Done</button>
            </div>
        );
    }
    return null;
}


const QuarterSelect: FC<reduxProps> = ({ FetchQuarters, availableQuarters, currentQuarter, setQuarter, fetching }) => {

    useEffect(() => {
        FetchQuarters();
    }, [FetchQuarters])

    const [keyDatesShown, setKeyDatesShown] = useState(false);
    let quarters: Option<QuarterSeasons>[] = [];
    for (const season in availableQuarters) {
        const quarter = availableQuarters[season as QuarterSeasons];
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${quarter?.year}` })
    }

    let onOptionClick = (season: QuarterSeasons) => { setQuarter(season) }
    let onPanelClick = () => { setKeyDatesShown(false) };
    let showKeyDates = () => { setKeyDatesShown(true) };
    return (
        <div className="quarterInfo">
            <label className="label">For Quarter</label>
            <span className="quarterSelect" >
                <SelectMenu<QuarterSeasons>
                    initialValue={currentQuarter}
                    options={quarters}
                    onClickOption={onOptionClick}
                />
                {!fetching ? <button className="btn" onClick={showKeyDates}>Key Dates</button> : null}
            </span>
            {keyDatesShown ?
                < div className="panelShadow">
                    {KeyDatePanel(availableQuarters[currentQuarter], currentQuarter, onPanelClick)}
                </div> : null}
        </div >
    )
}


export default connected(QuarterSelect)
