"use client";
import { motion } from 'motion/react';
import React from 'react';

type Filter = {
    name: string
    count: number
}

export function FilterButton({
    children,
    isActive,
    onClick,
}: {
    children: React.ReactNode
    isActive: boolean
    onClick: () => void
}) {
    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onClick={onClick}
                aria-pressed={isActive}
                className={`relative z-10 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                {isActive && (
                    <motion.span
                        layoutId="active-filter-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 34 }}
                        className="absolute inset-0 -z-10 rounded-full bg-muted"
                    />
                )}

                <span className="w-2 h-2 rounded-full shrink-0 transition-all duration-200 " style={{
                    background: "blue"
                }} />
                {children}
            </button>
        </span>
    )
}


const filters: Filter[] = [
    {
        name: "All",
        count: 12
    },
    {
        name: "Read",
        count: 5
    },
    {
        name: "Watch",
        count: 3
    },
    {
        name: "Listen",
        count: 4
    },
]
export function FilterButtonGroup() {
    const [activeFilter, setActiveFilter] = React.useState(filters[0].name)

    return (
        <div className="flex space-x-2">
            {filters.map((filter) => (
                <FilterButton
                    key={filter.name}
                    isActive={activeFilter === filter.name}
                    onClick={() => setActiveFilter(filter.name)}
                >
                    {filter.name} ({filter.count})
                </FilterButton>
            ))}
        </div>
    )
}