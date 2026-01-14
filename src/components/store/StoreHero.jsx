import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
    {
        id: 1,
        title: "Grand Savings on Medicines",
        subtitle: "Flat 25% OFF + Extra 10% Cashback",
        color: "bg-teal-600",
        image: "https://img.freepik.com/free-photo/composition-medical-objects-with-copyspace_23-2147822643.jpg",
        textColor: "text-white"
    },
    {
        id: 2,
        title: "Ayurvedic Wellness",
        subtitle: "Natural remedies for a healthier life",
        color: "bg-orange-100",
        image: "https://img.freepik.com/free-photo/alternative-medicine-with-herbs_23-2148507026.jpg",
        textColor: "text-orange-900"
    },
    {
        id: 3,
        title: "Daily Essentials",
        subtitle: "Vitamins, Supplements & more",
        color: "bg-blue-600",
        image: "https://img.freepik.com/free-photo/top-view-pills-container-with-copy-space_23-2148533519.jpg",
        textColor: "text-white"
    }
];

export function StoreHero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

    return (
        <div className="relative w-full h-[280px] md:h-[350px] overflow-hidden rounded-3xl group">
            {/* Slides container */}
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className={`w-full flex-shrink-0 h-full ${banner.color} relative px-8 md:px-16 flex items-center`}
                    >
                        {/* Background Image Overlay */}
                        <div
                            className="absolute inset-x-0 right-0 top-0 bottom-0 w-full md:w-2/3 ml-auto opacity-20 md:opacity-100 mix-blend-overlay md:mix-blend-normal bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${banner.image})`,
                                maskImage: 'linear-gradient(to right, transparent, black)'
                            }}
                        />

                        {/* Content */}
                        <div className="relative z-10 max-w-lg">
                            <span className={`inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-4 ${banner.textColor}`}>
                                Limited Time Offer
                            </span>
                            <h2 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight ${banner.textColor}`}>
                                {banner.title}
                            </h2>
                            <p className={`text-lg md:text-xl mb-8 opacity-90 ${banner.textColor}`}>
                                {banner.subtitle}
                            </p>
                            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-0 font-semibold rounded-xl h-12 px-8">
                                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons (Visible on Hover) */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
