import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';

const heroSlides = [
    {
        image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        title: 'Summer Collection 2023',
        subtitle: 'Discover the latest trends',
        buttonText: 'SHOP NOW',
        textPosition: 'left',
        bgOverlay: 'bg-primary/20',
        padding: 'pb-32 md:pb-40 pl-2 md:pl-10 pr-4'
    },
    {
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        title: 'Limited Time Offer',
        subtitle: 'Up to 50% off selected items',
        buttonText: 'DISCOVER DEALS',
        textPosition: 'center',
        bgOverlay: 'bg-secondary/20',
        padding: 'pb-24 md:pb-40 px-6 md:px-12'
    },
    {
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
        title: 'New Arrivals',
        subtitle: 'Fresh styles just landed',
        buttonText: 'EXPLORE',
        textPosition: 'left',
        bgOverlay: 'bg-accent-red/20',
        padding: 'pb-40 md:pb-48 pl-4 md:pl-10'
    }
];

const Hero = () => {
    const swiperRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const textAlignments = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-start text-left'
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) {
                setProgress((prev) => {
                    if (prev >= 100) {
                        requestAnimationFrame(() => {
                            swiperRef.current?.slideNext();
                        });
                        return 0;
                    }
                    return prev + 2;
                });
            }
        }, 100);
        return () => clearInterval(interval);
    }, [isPaused]);

    return (
        <section className="relative w-full h-screen max-h-[800px]">
            <Swiper
                onSwiper={(swiper) => swiperRef.current = swiper}
                modules={[Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                className="w-full h-full"
            >
                {heroSlides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className={`relative w-full h-full ${slide.bgOverlay}`}>
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />

                            {/* Vertical Progress Bar */}
                            <div className="absolute top-32 right-4 md:right-8 w-2 h-60 bg-white/30 rounded-full overflow-hidden z-20">
                                <div
                                    className="bg-primary w-full rounded-full transition-all duration-100 ease-linear"
                                    style={{ height: `${progress}%` }}
                                />
                            </div>

                            {/* Content */}
                            <div className={`relative z-10 h-full flex flex-col justify-end ${textAlignments[slide.textPosition]} ${slide.padding}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="max-w-2xl"
                                >
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl md:text-2xl text-white mb-6">
                                        {slide.subtitle}
                                    </p>
                                    <button className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition duration-300 transform hover:scale-105 shadow-lg">
                                        {slide.buttonText}
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;
