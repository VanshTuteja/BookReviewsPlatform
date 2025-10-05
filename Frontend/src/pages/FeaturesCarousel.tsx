import React, { useState, useEffect } from 'react';
import { BookOpen, Users, TrendingUp, BookMarked, Star, Sparkles } from 'lucide-react';

const FeaturesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Features data with 6 cards
  const features = [
  {
    id: '1',
    title: 'Personalized Book Suggestions',
    description: 'Get book recommendations based on your past reads and favorite genres, helping you discover hidden gems.',
    icon: BookOpen,
    gradient: 'from-cyan-400 to-blue-500'
  },
  {
    id: '2',
    title: 'Community Reviews',
    description: 'Read and share honest reviews from book lovers around the world, and participate in discussions on your favorite books.',
    icon: Users,
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: '3',
    title: 'Reading Stats & Insights',
    description: 'Track your reading habits, see which genres you enjoy most, and monitor your review activity over time.',
    icon: TrendingUp,
    gradient: 'from-orange-400 to-red-500'
  },
  {
    id: '4',
    title: 'Featured Reviews',
    description: 'Write reviews that matter—get your insights highlighted on community boards and help others choose their next read.',
    icon: Star,
    gradient: 'from-yellow-400 to-orange-500'
  },
  {
    id: '5',
    title: 'Quick Book Discovery',
    description: 'Search for books instantly, get notified about new reviews, and stay updated on trending titles in the community.',
    icon: Sparkles,
    gradient: 'from-purple-400 to-pink-500'
  }
];


  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  const getItemPosition = (index: number) => {
    const diff = index - currentIndex;
    const totalItems = features.length;
    
    let position = diff;
    if (position > totalItems / 2) position -= totalItems;
    if (position < -totalItems / 2) position += totalItems;
    
    return position;
  };

  const getItemStyle = (index: number) => {
    const position = getItemPosition(index);
    const isCenter = position === 0;
    
    let transform = '';
    let zIndex = 0;
    let opacity = 0.4;
    let scale = 0.7;
    
    if (isCenter) {
      transform = 'translateX(0) translateZ(0) rotateY(0deg)';
      zIndex = 10;
      opacity = 1;
      scale = 1.2;
    } else if (position === -1) {
      transform = 'translateX(-320px) translateZ(-200px) rotateY(25deg)';
      zIndex = 5;
      opacity = 0.7;
      scale = 0.9;
    } else if (position === 1) {
      transform = 'translateX(320px) translateZ(-200px) rotateY(-25deg)';
      zIndex = 5;
      opacity = 0.7;
      scale = 0.9;
    } else if (position < -1) {
      transform = 'translateX(-480px) translateZ(-400px) rotateY(35deg)';
      zIndex = 1;
      opacity = 0.3;
      scale = 0.7;
    } else if (position > 1) {
      transform = 'translateX(480px) translateZ(-400px) rotateY(-35deg)';
      zIndex = 1;
      opacity = 0.3;
      scale = 0.7;
    }
    
    return {
      transform: `${transform} scale(${scale})`,
      zIndex,
      opacity,
    };
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Powerful Features for Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Reading Journey
            </span>
          </h2>
          <p className="text-lg text-gray-700 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to discover, track, and share your love for books
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative w-full h-[500px] mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]"
          style={{ perspective: '1500px' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {features.map((feature, index) => {
              const style = getItemStyle(index);
              const isMainCard = Math.abs((index - currentIndex + features.length) % features.length) < 0.1 || 
                                Math.abs((index - currentIndex + features.length) % features.length) > features.length - 0.1;
              const Icon = feature.icon;
              
              return (
                <div
                  key={feature.id}
                  className={`absolute bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg transition-all duration-1000 ease-out cursor-pointer ${
                    isMainCard 
                      ? 'w-96 h-80 shadow-xl shadow-blue-300/30 dark:shadow-cyan-400/20 ring-4 ring-blue-400/40 dark:ring-cyan-400/30' 
                      : 'w-80 h-72'
                  }`}
                  style={style}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="p-8 text-center space-y-6 h-full flex flex-col justify-center relative z-10">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className={`font-bold text-gray-900 dark:text-white ${
                      isMainCard ? 'text-2xl' : 'text-xl'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-gray-700 dark:text-slate-400 leading-relaxed ${
                      isMainCard ? 'text-base' : 'text-sm'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-slate-700/10 rounded-2xl" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesCarousel;