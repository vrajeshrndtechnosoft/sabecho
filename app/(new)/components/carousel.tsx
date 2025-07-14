'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const imageList = [
  { src: '/slider1.png', alt: 'Slider 1' },
  { src: '/slider2.png', alt: 'Slider 2' },
  { src: '/slider3.png', alt: 'Slider 3' },
  { src: '/slider4.png', alt: 'Slider 4' },
  { src: '/slider5.png', alt: 'Slider 5' },
];

export default function ImageCarousel() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextImage = () => setCurrent((prev) => (prev + 1) % imageList.length);
  const prevImage = () => setCurrent((prev) => (prev - 1 + imageList.length) % imageList.length);

  useEffect(() => {
    timeoutRef.current = setTimeout(nextImage, 3000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current]);

  return (
    <div className="relative w-full max-w-screen-2xl mx-auto aspect-[295/100]">
      <div className="relative w-full h-full">
        <Image
          src={imageList[current].src}
          alt={imageList[current].alt}
          fill
          className="object-cover transition-all duration-700"
          priority
        />
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevImage}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full z-10"
      >
        <ArrowLeft className="w-6 h-6 text-black" />
      </button>

      <button
        onClick={nextImage}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full z-10"
      >
        <ArrowRight className="w-6 h-6 text-black" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {imageList.map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full ${
              current === idx ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
