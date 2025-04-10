"use client";
import React, { useEffect, useState, ReactNode } from "react";

interface AnimatedWrapperProps {
    children: ReactNode;
}

const AnimatedWrapper = ({ children }: AnimatedWrapperProps) => {
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        setIsPageLoaded(true);
    }, []);

    return (
        <div>
            {React.Children.map(children, (child, index) => (
                <div
                    className={`transition-all duration-700 ease-out ${
                        isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

export default AnimatedWrapper;