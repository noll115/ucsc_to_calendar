import React, { useState, ReactElement } from 'react';
import "./SelectMenu.scss";

export interface Option<T> {
    value: T,
    label: string
}


interface MenuProps<T> {
    initialValue: T,
    options: Option<T>[]
    onClickOption: (arg: T) => void,
    disabled?: boolean
}

interface OptionProps<T> {
    option: Option<T>,
    optionAction: (arg: T) => void
}


function SelectMenuOption<T>({ option: { value, label }, optionAction }: OptionProps<T>): ReactElement<OptionProps<T>> {
    const onClick = () => { optionAction(value) }
    return (
        <li className="option" onClick={onClick}>{label}</li>
    );
}

function SelectMenu<T>({ initialValue, options, disabled, onClickOption }: MenuProps<T>): ReactElement<MenuProps<T>> {
    let [dropDownActive, setDropDownActive] = useState(false);

    const toggleDropDown = () => setDropDownActive(!dropDownActive);
    const clickedOnOption = (value: T) => {
        toggleDropDown();
        onClickOption(value)
    }
    let initialOption = options.find(op => op.value === initialValue);
    let leftOverOptions = options.filter(op => op.value !== initialValue);
    return (
        <span onClick={!disabled ? toggleDropDown : undefined} className={`dropdown ${disabled ? "disabled" : ""} dropdown-${dropDownActive ? 'open' : 'closed'}`}>
            <span className="option-chosen" ><span>{initialOption?.label}</span> <i className="fas fa-chevron-down"></i>
            </span>
            <ul className="options" >
                {leftOverOptions.map((option: Option<T>, i) => (<SelectMenuOption<T> key={i} option={option} optionAction={clickedOnOption} />))}
            </ul>
        </span>
    )
}



export default SelectMenu
