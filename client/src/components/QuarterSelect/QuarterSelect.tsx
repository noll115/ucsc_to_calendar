import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps, Options } from 'react-redux'
import { AppState } from '../../redux'
import DropDownMenu, { Option } from "../DropDownMenu/DropDownMenu"
import { fetchQuarters, setQuarter } from "../../redux/actions";
import { QuarterSeasons } from '../../../../shared/types';
import "./QuarterSelect.scss"

const mapStateToProps = (state: AppState) => ({
    availableQuarters: state.quarterState.availableQuarters,
    currentQuarter: state.quarterState.selectedQuarter
})

const mapDispatchToProps = {
    fetchQuarters,
    setQuarter
}

const connected = connect(mapStateToProps, mapDispatchToProps);

type reduxProps = ConnectedProps<typeof connected>



const QuarterSelect: FC<reduxProps> = ({ fetchQuarters, availableQuarters, currentQuarter, setQuarter }) => {

    useEffect(() => {
        fetchQuarters();
    }, [])

    let quarters: Option<QuarterSeasons>[] = [];
    for (const season in availableQuarters) {
        const element = availableQuarters[season as QuarterSeasons];
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${element?.year}` })
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${element?.year}` })
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${element?.year}` })
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${element?.year}` })
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${element?.year}` })
        quarters.push({ value: season as QuarterSeasons, label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${element?.year}` })

    }

    let onClick = (season: QuarterSeasons) => { setQuarter(season) }
    return (
        <div>
            <div><label htmlFor="">For Quarter</label></div>
            <span>
                <DropDownMenu<QuarterSeasons>
                    initialValue={currentQuarter ? currentQuarter : "fall"}
                    options={quarters}
                    onClickOption={onClick}
                />
                <button >Key Dates</button>
            </span>
        </div>
    )
}


export default connected(QuarterSelect)
