import React from 'react';
import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
    return (
        <div className={cn("grid gap-2", className)} ref={ref} {...props}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        checked: child.props.value === value,
                        onChange: () => onValueChange?.(child.props.value)
                    });
                }
                return child;
            })}
        </div>
    );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ className, value, checked, onChange, ...props }, ref) => {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={checked}
            data-state={checked ? "checked" : "unchecked"}
            value={value}
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-blue-600 border-blue-600" : "border-gray-400",
                className
            )}
            onClick={onChange}
            ref={ref}
            {...props}
        >
            {checked && (
                <span className="flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-white" />
                </span>
            )}
        </button>
    );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
