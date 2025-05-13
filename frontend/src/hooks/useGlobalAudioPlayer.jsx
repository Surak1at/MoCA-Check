// ✅ useGlobalAudioPlayer.js (เฉพาะส่วนที่ต้องแก้)

import { useRef, useState } from 'react';

const useGlobalAudioPlayer = () => {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (src) => {
    return new Promise((resolve) => {
      const audio = audioRef.current;

      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.crossOrigin = "anonymous"; // ✅ เพิ่มตรงนี้ รองรับมือถือ
      audio.src = src;

      const handleEnded = () => {
        setIsPlaying(false);
        resolve();
        cleanup();
      };

      const handleError = () => {
        setIsPlaying(false);
        resolve();
        cleanup();
      };

      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay); // ✅ เปลี่ยนจาก canplaythrough
      };

      const handleCanPlay = () => {
        audio.play().catch(() => {
          setIsPlaying(false);
          resolve();
          cleanup();
        });
      };

      // ✅ fallback สำหรับมือถือบางรุ่นที่ไม่ trigger canplay
      setTimeout(() => {
        audio.play().catch(() => {
          setIsPlaying(false);
          resolve();
          cleanup();
        });
      }, 0);

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay, { once: true }); // ✅ เปลี่ยนจาก canplaythrough

      setIsPlaying(true);
    });
  };

  const preloadAudio = (src) => {
    const preloadAudio = new Audio(src);
    preloadAudio.preload = 'auto';
    preloadAudio.load();
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.removeAttribute('src'); // ✅ ล้างจริง ๆ กัน resume
    audio.load();
    setIsPlaying(false);
  };

  return { playAudio, isPlaying, preloadAudio, stopAudio };
};

export default useGlobalAudioPlayer;
