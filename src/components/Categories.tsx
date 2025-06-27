"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const categories = [
  {
    name: "Buffet",
    image: "/images/categories-images/Buffet.png",
    color: "#FFB6C1",
    slug: "buffet"
  },
  {
    name: "Pizzaria",
    image: "/images/categories-images/Pizzaria.png",
    color: "#FFE4B5",
    slug: "pizzaria"
  },
  {
    name: "Churrascaria",
    image: "/images/categories-images/Churrascaria.png",
    color: "#F0E68C",
    slug: "churrascaria"
  },
  {
    name: "Doces",
    image: "/images/categories-images/Doceria.png",
    color: "#DDA0DD",
    slug: "doces"
  },
  {
    name: "Hamburgueria",
    image: "/images/categories-images/Hamburgueria.png",
    color: "#F0E68C",
    slug: "hamburgueria"
  },
  {
    name: "Sorveteria",
    image: "/images/categories-images/Sorveteria.png",
    color: "#B0E0E6",
    slug: "sorveteria"
  },
  { 
    name: "Bar", 
    image: "/images/categories-images/Bar.png", 
    color: "#98FB98",
    slug: "bar"
  },
  {
    name: "Adega",
    image: "/images/categories-images/Adega.png",
    color: "#DDA0DD",
    slug: "adega"
  },
  {
    name: "Cervejaria",
    image: "/images/categories-images/cervejaria.png",
    color: "#F0E68C",
    slug: "cervejaria"
  },
];

interface CategoriesProps {
  onCategorySelect?: (category: string) => void;
  showScrollButtons?: boolean;
  className?: string;
}

export function Categories({ onCategorySelect, showScrollButtons = true, className = "" }: CategoriesProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);

  useEffect(() => {
    const checkScrollableContent = () => {
      setHasScrollableContent(window.innerWidth < 1500);
    };
    
    checkScrollableContent();
    window.addEventListener('resize', checkScrollableContent);
    
    return () => window.removeEventListener('resize', checkScrollableContent);
  }, []);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -250, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  useEffect(() => {
    const current = scrollRef.current;
    if (current) {
      setTimeout(checkScrollButtons, 100);
      
      current.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      
      return () => {
        current.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollButtons();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`py-4 md:py-8 bg-white ${className}`}>
      <div className="container mx-auto px-4 md:px-6">        
        <div className="relative">
          {showScrollButtons && hasScrollableContent && (
            <>
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-[5] pointer-events-none" />
              )}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-[5] pointer-events-none" />
              )}
            </>
          )}

          {showScrollButtons && hasScrollableContent && canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={handleScrollLeft}
              className="absolute left-1 top-1/2 cursor-pointer -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:shadow-xl transition-all duration-200"
            >
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
          )}

          {showScrollButtons && hasScrollableContent && canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={handleScrollRight}
              className="absolute right-1 cursor-pointer top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:shadow-xl transition-all duration-200"
            >
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          )}         

          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`flex justify-start 2xl:justify-center items-center gap-3 md:gap-6 overflow-x-auto pb-4 scrollbar-hide ${
              hasScrollableContent && showScrollButtons ? 'px-10' : 'justify-center'
            }`}
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch"
            }}
            onScroll={checkScrollButtons}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category.slug)}
                className="flex flex-col items-center gap-2 md:gap-3 font-medium cursor-pointer group min-w-[80px] md:min-w-[100px] flex-shrink-0 select-none"
              >
                <div
                  className="rounded-xl md:rounded-2xl h-16 w-20 md:h-20 md:w-24 lg:h-24 lg:w-32 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300"
                  style={{
                    background: `linear-gradient(180deg, ${category.color} 55%, #FFFFFF 55%)`,
                  }}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={42}
                    height={42}
                    className="object-contain md:w-10 md:h-10 lg:w-12 lg:h-12"
                  />
                </div>
                <span className="text-xs md:text-sm text-gray-700 font-medium text-center leading-tight max-w-[80px] md:max-w-none">
                  {category.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110">
            <span className="text-white text-lg font-bold">💬</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
