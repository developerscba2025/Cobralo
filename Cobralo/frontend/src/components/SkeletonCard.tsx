import React from 'react';

type SkeletonVariant = 'stat' | 'card' | 'row' | 'chart';

interface SkeletonProps {
    variant: SkeletonVariant;
    count?: number;
}

const SkeletonCard: React.FC<SkeletonProps> = ({ variant, count = 1 }) => {
    const skeletons = Array.from({ length: count });

    if (variant === 'stat') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                {skeletons.map((_, i) => (
                    <div key={i} className="card-premium p-8">
                        <div className="skeleton h-3 w-20 rounded-md mb-6 opacity-30"></div>
                        <div className="skeleton h-10 w-32 rounded-xl"></div>
                        <div className="skeleton h-2 w-16 rounded-md mt-6 opacity-20"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className="space-y-6 w-full">
                {skeletons.map((_, i) => (
                    <div key={i} className="card-premium p-8 flex flex-col gap-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4 flex-1 pt-1">
                                <div className="skeleton h-6 w-64 rounded-xl"></div>
                                <div className="skeleton h-4 w-32 rounded-lg opacity-40"></div>
                            </div>
                            <div className="skeleton h-10 w-24 rounded-2xl opacity-50"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, j) => (
                                <div key={j} className="skeleton h-20 w-full rounded-3xl opacity-30"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'row') {
        return (
            <>
                {skeletons.map((_, i) => (
                    <tr key={i} className="border-b border-border-main/20">
                        <td className="p-6"><div className="skeleton h-5 w-48 rounded-xl"></div></td>
                        <td className="p-6"><div className="skeleton h-5 w-32 rounded-xl opacity-60"></div></td>
                        <td className="p-6"><div className="skeleton h-8 w-24 rounded-2xl opacity-40"></div></td>
                        <td className="p-6 text-right"><div className="skeleton h-10 w-10 rounded-xl ml-auto opacity-30"></div></td>
                    </tr>
                ))}
            </>
        );
    }

    if (variant === 'chart') {
        return (
            <div className="card-premium p-8 w-full">
                 <div className="skeleton h-6 w-48 rounded-xl mb-12"></div>
                 <div className="skeleton h-72 w-full rounded-[2rem] opacity-20"></div>
            </div>
        );
    }

    return null;
};

export default SkeletonCard;
