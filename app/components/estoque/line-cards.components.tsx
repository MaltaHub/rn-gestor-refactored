import React from 'react';
import Link from 'next/link';

type DataItem = { id: string | number; [key: string]: string | number };

interface LineCardProps<T extends DataItem> {
    data: T[];
    navigateTo?: { path: string; keyPath: keyof T };
}

function isValidKeyPath<T extends DataItem>(data: T[], keyPath: keyof T): boolean {
    return data.every((item) => keyPath in item);
}

const LineCards = <T extends DataItem>({ data, navigateTo }: LineCardProps<T>) => {
    if (navigateTo && !isValidKeyPath(data, navigateTo.keyPath)) {
        console.error(`Invalid keyPath: ${String(navigateTo.keyPath)} does not exist in data items.`);
        return null;
    }

    const keys = data.length > 0 ? Object.keys(data[1]).filter((key) => key !== 'id') : [];

    return (
        <div className="flex flex-col w-full">
            {/* Header */}
            <div className="flex bg-gray-200 font-bold">
                {keys.map((key) => (
                    <div key={key} className="flex-1 px-4 py-2 border border-gray-300">
                        {key}
                    </div>
                ))}
            </div>

            {/* Rows */}
            {data.map((row) => (
                <Link
                    key={row.id}
                    href={navigateTo ? `${navigateTo.path}/${row[navigateTo.keyPath]}` : '#'}
                    className="flex hover:bg-gray-100 cursor-pointer"
                >
                    {keys.map((key) => (
                        <div key={key} className="flex-1 px-4 py-2 border border-gray-300">
                            {row[key]}
                        </div>
                    ))}
                </Link>
            ))}
        </div>
    );
};

export default LineCards;