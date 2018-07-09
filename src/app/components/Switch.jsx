import React from 'react'

export const Switch = ({checked, onClick}) => (
<div className="onoffswitch" onClick={onClick}>
    <input type="checkbox"
          name="onoffswitch"
          className="onoffswitch-checkbox"
          onChange={onClick}
          id="myonoffswitch" checked={checked} />
    <label className="onoffswitch-label" htmlFor="myonoffswitch">
        <span className="onoffswitch-inner"></span>
        <span className="onoffswitch-switch"></span>
    </label>
</div>
)

export default Switch