import React, { useState } from 'react'

const Dropdown = (props) => {
    const [dropdownToggle, setDropdownToggle] = useState(false);

    function toggleDropdown() {
        setDropdownToggle(!dropdownToggle);
    }

    const dropdownClasses = props.toright ? 'dropdown-list to-right' : 'dropdown-list';

    return (
        <div className="dropdown">
            <a href="#" className="btn btn-primary dropdown-btn" onClick={toggleDropdown} id={props.id}>{props.title}</a>
            {dropdownToggle && <div className={dropdownClasses}>
                {props.children}
            </div>}
        </div>
    );
}

export default Dropdown;