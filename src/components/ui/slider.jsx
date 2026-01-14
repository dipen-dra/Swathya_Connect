import React from 'react';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef(({ className, min = 0, max = 100, step = 1, value = [0], onValueChange, ...props }, ref) => {
    const handleChange = (e) => {
        const val = parseFloat(e.target.value);
        onValueChange?.([val]);
    };

    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)} {...props} ref={ref}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
});

Slider.displayName = "Slider";

export { Slider };
