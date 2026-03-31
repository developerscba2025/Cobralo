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
                    <div key={i} className="card-premium p-6 md:p-8">
                        <div className="skeleton h-3 w-24 rounded-md mb-4"></div>
                        <div className="skeleton h-10 w-32 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className="space-y-4 w-full">
                {skeletons.map((_, i) => (
                    <div key={i} className="card-premium p-6 flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1 pt-1">
                                <div className="skeleton h-5 w-48 rounded-lg"></div>
                                <div className="skeleton h-4 w-24 rounded-md"></div>
                            </div>
                            <div className="skeleton h-8 w-20 rounded-lg"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="skeleton h-16 w-full rounded-xl"></div>
                            <div className="skeleton h-16 w-full rounded-xl"></div>
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
                        <td className="p-4"><div className="skeleton h-5 w-32 rounded-md"></div></td>
                        <td className="p-4"><div className="skeleton h-5 w-24 rounded-md"></div></td>
                        <td className="p-4"><div className="skeleton h-5 w-20 rounded-md"></div></td>
                        <td className="p-4"><div className="skeleton h-8 w-8 rounded-lg ml-auto"></div></td>
                    </tr>
                ))}
            </>
        );
    }

    if (variant === 'chart') {
        return (
            <div className="card-premium p-6 md:p-8 w-full">
                 <div className="skeleton h-5 w-40 rounded-lg mb-8"></div>
                 <div className="skeleton h-48 md:h-64 w-full rounded-xl"></div>
            </div>
        );
    }

    return null;
};

export default SkeletonCard;
