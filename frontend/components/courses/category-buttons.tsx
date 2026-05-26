"use client"

import { Category } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CategoryButtons({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const colors = [
        "bg-category-one text-category-one-text",
        "bg-category-two text-category-two-text",
        "bg-category-three text-category-three-text"
    ]

    return (
        <div>
            {categories.slice(0, 3).map((category, index) => (
                <button
                    className={`${colors[index]} border rounded-lg px-4 font-medium drop-shadow-category-drop mr-1 mt-2`}
                    key={category.id}
                    onClick={() => router.push(`/courses`)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    )
}