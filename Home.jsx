
import React, { useState } from 'react';
import DappCard from '../components/DappCard';
import Web2Card from '../components/Web2Card';
import RewardModal from '../components/RewardModal';

const Home = () => {
  const [showReward, setShowReward] = useState(true);

  return (
    <div className="p-6">
      <RewardModal visible={showReward} onClose={() => setShowReward(false)} />
      <section className="mb-8">
        <video controls className="w-full rounded-xl">
          <source src="/video/intro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <DappCard title="Uniswap" icon="/assets/uniswap.png" link="https://uniswap.org" />
        <DappCard title="IPFS Video" icon="/assets/ipfs.png" link="https://video.ipfs.io" />
      </section>
      <section className="bg-gray-100 p-4 rounded-xl">
        <h3 className="text-lg font-bold mb-2">تطبيقات Web2</h3>
        <div className="flex flex-wrap">
          <Web2Card title="YouTube" icon="/assets/youtube.png" link="https://youtube.com" />
          <Web2Card title="Gmail" icon="/assets/gmail.png" link="https://mail.google.com" />
        </div>
      </section>
    </div>
  );
};

export default Home;
