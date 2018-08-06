import React from 'react';

export const Checkmark = () => (
  <svg
    className="checkmark"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 25"
  >
    <circle className="checkmark__circle" cx="12" cy="12" r="12" fill="none" />
    <path
      className="checkmark__check"
      fill="none"
      d="M14.1 27.2l7.1 7.2 16.7-16.8"
    />
  </svg>
);

export default Checkmark;
