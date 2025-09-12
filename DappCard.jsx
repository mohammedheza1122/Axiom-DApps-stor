
import React from 'react';

const DappCard = ({ title, icon, link }) => (
  <div className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition">
    <img src={icon} alt={title} className="w-16 h-16 mb-2" />
    <h3 className="text-lg font-semibold">{title}</h3>
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2">افتح التطبيق</a>
  </div>
);

export default DappCard;
