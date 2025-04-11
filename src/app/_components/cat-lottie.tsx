'use client';

import Lottie from 'lottie-react';

import loadingAnimation from './loading.json';

export default function CatLottie() {
  return (
    <div className="-mx-5">
      <Lottie
        animationData={loadingAnimation}
        style={{ width: 100, height: 100 }}
      />
    </div>
  );
}
