
import React from 'react';

const Web2Card = ({ title, icon, link }) => (
  <div className="w-16 h-16 m-2 flex flex-col items-center text-center">
    <a href={link} target="_blank" rel="noopener noreferrer">
      <img src={icon} alt={title} className="w-12 h-12" />
      <p className="text-xs mt-1">{title}</p>
    </a>
  </div>
);

export default Web2Card;
