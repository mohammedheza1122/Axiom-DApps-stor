
import React from 'react';

const RewardModal = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4">🎉 مبروك!</h2>
        <p>لقد ربحت 5 توكن! فعّل محفظتك خلال 24 ساعة للاستفادة منها.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">حسنًا</button>
      </div>
    </div>
  );
};

export default RewardModal;
