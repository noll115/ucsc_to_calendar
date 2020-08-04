import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { AppState } from '../../redux'
import { Option } from "../SelectMenu/SelectMenu"
import { FetchQuarters, SetQuarter, SetShowKeyDate } from "../../redux/actions";
import { QuarterSeasons } from '../../../../shared/types';
import { Button, Loading, SelectMenu } from "../index";
import "./QuarterSelect.scss"

const mapStateToProps = (state: AppState) => ({
    quarterState: state.quarterState
})

const mapDispatchToProps = {
    FetchQuarters,
    SetQuarter,
    SetShowKeyDate

}

const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>


const QuarterSelect: FC<reduxProps> = ({ FetchQuarters, SetQuarter, SetShowKeyDate, quarterState }) => {
    let { availableQuarters, selectedQuarter, fetching } = quarterState;
    useEffect(() => {
        FetchQuarters();
    }, [FetchQuarters])

    let quarters: Option<QuarterSeasons>[] = [];
    for (const season in availableQuarters) {
        const quarter = availableQuarters[season as QuarterSeasons];
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${quarter?.year}` })
    }

    let onOptionClick = (season: QuarterSeasons) => { SetQuarter(season) }
    let setShowPanel = () => {
        SetShowKeyDate(true)
    };
    return (
        <div className="quarterInfo">
            <label className="label">For Quarter</label>
            <span className="quarterSelect" >
                <SelectMenu<QuarterSeasons>
                    disabled={!fetching && availableQuarters === null}
                    initialValue={selectedQuarter}
                    options={quarters}
                    onClickOption={onOptionClick}
                />
                {!fetching ? <Button disabled={!availableQuarters} onClick={setShowPanel}>Key Dates</Button> : <Loading />}
            </span>
        </div >
    )
}


export default connected(QuarterSelect)
