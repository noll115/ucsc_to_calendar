import React, { useState, ReactElement } from 'react';
import "./DropDownMenu.scss";

export interface Option<T> {
    value: T,
    label: string
}


interface MenuProps<T> {
    initialValue: T,
    options: Option<T>[]
    onClickOption: (arg: T) => void
}

interface OptionProps<T> {
    option: Option<T>,
    optionAction: (arg: T) => void
}


function DropDownOption<T>({ option: { value, label }, optionAction }: OptionProps<T>): ReactElement<OptionProps<T>> {
    const onClick = () => { optionAction(value) }
    return (
        <li className="option" onClick={onClick}>{label}</li>
    );
}

function DropDownMenu<T>({ initialValue, options, onClickOption }: MenuProps<T>): ReactElement<MenuProps<T>> {
    let [dropDownActive, setDropDownActive] = useState(false);

    const toggleDropDown = () => setDropDownActive(!dropDownActive);
    const clickedOnOption = (value: T) => {
        toggleDropDown();
        onClickOption(value)
    }
    let initialOption = options.find(op => op.value === initialValue);
    let leftOverOptions = options.filter(op => op.value !== initialValue);
    return (
        <span onClick={toggleDropDown} className={`dropdown dropdown-${dropDownActive ? 'open' : 'closed'}`}>
            <span className="option-chosen" >{initialOption?.label} <i className="fas fa-chevron-down"></i>
            </span>
            <ul className="options" >
                {leftOverOptions.map((option: Option<T>, i) => (<DropDownOption<T> key={i} option={option} optionAction={clickedOnOption} />))}
            </ul>

        </span>
    )
}



export default DropDownMenu
