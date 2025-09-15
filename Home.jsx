import React, { useState } from 'react';
// سنحتاج أيقونات جديدة، لذا نستوردها من مكتبة شائعة مثل "react-icons"
// لتثبيتها، شغّل في الطرفية: npm install react-icons
import { FiPlus } from 'react-icons/fi'; // أيقونة الزائد (+)

// افترض أن هذه المكونات موجودة لديك
import DappCard from './DappCard.jsx';
import RewardModal from './RewardModal.jsx';

const Home = () => {
  const [showReward, setShowReward] = useState(true);

  return (
    // استخدمنا لونا متدرجا مشابها لتصميمك للخلفية
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-indigo-300 p-4 sm:p-6">
      <div className="max-w-md mx-auto bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg p-6">
        
        {/* --- 1. المنطقة العلوية وشريط البحث المحسّن --- */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <img src="/assets/axm-logo.png" alt="Axiom Logo" className="w-8 h-8" /> {/* تأكد من وجود الشعار في هذا المسار */}
            <span className="text-2xl font-bold text-gray-800">Axiom</span>
          </div>
          <div className="bg-white/50 rounded-full px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm">
            💎 10 AXM
          </div>
        </header>

        <div className="relative mb-6">
          <input
            type="search"
            // **التعديل 1: إضافة نص توضيحي (Placeholder)**
            placeholder="ابحث عن تطبيق أو DApp..."
            className="w-full bg-white rounded-full py-3 pl-10 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* --- 2. قسم "المفضلة" المحسّن --- */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">المفضلة</h2>
          <div className="grid grid-cols-4 gap-4">
            {/* أمثلة لتطبيقات Web3 */}
            <DappCard title="Uniswap" icon="/assets/uniswap.png" link="#" />
            <DappCard title="OpenSea" icon="/assets/opensea.png" link="#" />
            <DappCard title="Aave" icon="/assets/aave.png" link="#" />
            
            {/* **التعديل 2: استبدال الثلاث نقاط بأيقونة "إضافة" واضحة** */}
            <button className="flex flex-col items-center justify-center bg-gray-200/60 rounded-2xl aspect-square hover:bg-gray-300/80 transition-colors">
              <FiPlus className="h-6 w-6 text-gray-600" />
              <span className="text-xs mt-1 text-gray-600">إضافة</span>
            </button>
          </div>
        </section>

        {/* --- 3. بطاقة الحث على اتخاذ إجراء (CTA) المعاد تصميمها --- */}
        {showReward && (
          <section className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white p-5 rounded-2xl shadow-lg mb-6 text-center">
            <div className="flex justify-center items-center mb-3">
              <span className="text-4xl mr-3">🎁</span>
              <div>
                <h3 className="font-bold text-lg">مكافأة تسجيل الدخول!</h3>
                <p className="text-sm opacity-90">لقد حصلت على 5 توكنات AXM</p>
              </div>
            </div>
            
            {/* **التعديل 3: تبسيط الأزرار وتحسين التسلسل الهرمي** */}
            <div className="flex flex-col gap-2">
              <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105">
                تفعيل المحفظة الآن
              </button>
              <button 
                onClick={() => setShowReward(false)}
                className="w-full text-white/80 font-semibold py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                لاحقًا
              </button>
            </div>
          </section>
        )}

        {/* قسم تطبيقات Web2 (يمكنك إبقاؤه أو حذفه حسب رؤيتك) */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">اكتشف المزيد</h3>
          {/* هنا يمكنك وضع قائمة بتطبيقات DApps الشائعة */}
        </section>

      </div>
    </div>
  );
};

export default Home;

