import React, { useState, ReactElement } from 'react';

export interface Option<T> {
    value: T,
    label: string
}


interface MenuProps<T> {
    defaultVal: Option<T>,
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
        <li onClick={onClick}>{label}</li>
    );
}

function DropDownMenu<T>({ defaultVal, options, onClickOption }: MenuProps<T>): ReactElement<MenuProps<T>> {
    let [dropDownActive, setDropDownActive] = useState(false);

    const toggleDropDown = () => setDropDownActive(!dropDownActive);
    const clickedOnOption = (value: T) => {
        toggleDropDown();
        onClickOption(value)
    }
    return (
        <span onClick={toggleDropDown} className={`quarter-dropdown-${dropDownActive ? 'open' : 'closed'}`}>
            <span >{defaultVal.label}</span>
            <ul className="quarter-options" >
                {options.map((option: Option<T>, i) => (<DropDownOption<T> key={i} option={option} optionAction={clickedOnOption} />))}
            </ul>
        </span>
    )
}



export default DropDownMenu
