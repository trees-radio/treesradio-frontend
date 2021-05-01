import React, { useState } from 'react'

const Dropdown = (props) => {
    const [dropdownToggle, setDropdownToggle] = useState(false);

    function toggleDropdown() {
        setDropdownToggle(!dropdownToggle);
    }

    return (
        <div class="dropdown">
            <a href="#" class="btn btn-primary dropdown-btn" onClick={toggleDropdown}>{props.title}</a>
            {dropdownToggle && <div class="dropdown-list">
                {props.children}
            </div>}
        </div>
    );
}

export default Dropdown;