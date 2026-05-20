"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Course as CourseType } from "@/types/types";

type Props = {
    courses?: CourseType[];
    placeholder?: string;
    onSelect?: (course: CourseType) => void;
};

export default function SearchComponent({
    courses: initialCourses,
    placeholder = "Sök kurser...",
    onSelect,
}: Props) {
    const [courses, setCourses] = useState<CourseType[]>(initialCourses ?? []);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialCourses) return;
        let mounted = true;
        setLoading(true);

        fetch("/api/courses")
            .then((res) => res.json())
            .then(async (data) => {
                if (!mounted) return;
                if (!Array.isArray(data)) return;

                const coursesWithBlocks = await Promise.all(
                    data.map(async (course) => {
                        try {
                            const blockRes = await fetch(`/api/courses/${course.id}/blocks`);
                            const blockData = await blockRes.json();
                            const blocks = blockData.blocks ?? blockData;
                            return { ...course, blocksList: blocks };
                        } catch {
                            return course;
                        }
                    })
                );

                if (mounted) setCourses(coursesWithBlocks);
            })
            .catch(() => {})
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [initialCourses]);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(query.trim()), 200);
        return () => clearTimeout(id);
    }, [query]);

    const fuse = useMemo(() => {
        return new Fuse(courses as any, {
            keys: ["title", "category.name", "textContent", "courseBlocks.title", "blocksList.title"],
            threshold: 0.2,
            ignoreLocation: true,
            includeScore: true,
            minMatchCharLength: 3,
        });
    }, [courses]);

    const results = useMemo(() => {
        if (!debouncedQuery) return [];
        try {
            const found = fuse.search(debouncedQuery);
            return found.map((r) => r.item as CourseType);
        } catch (e) {
            return courses.filter((course) => {
                const text = (
                    course.title + " " + (course.category?.name ?? "") + " " + (course.textContent ?? "")
                ).toLowerCase();
                return text.includes(debouncedQuery.toLowerCase());
            });
        }
    }, [debouncedQuery, fuse, courses]);

    const showResults = debouncedQuery.length > 0;

    return (
        <div className="w-full max-w-lg">
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-4 pr-3 py-2 rounded-full border bg-background text-sm"
                aria-label="Sök kurser"
            />
            {showResults && (
                <div className="mt-2 bg-card rounded-lg shadow-sm max-h-64 overflow-auto">
                    {loading ? (
                        <div className="p-3 text-sm text-muted-foreground">Laddar...</div>
                    ) : results.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">Inga träffar</div>
                    ) : (
                        results.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.id}`}
                                onClick={() => onSelect?.(course)}
                                className="block p-3 hover:bg-muted"
                            >
                                <div className="font-semibold text-sm">{course.title}</div>
                                {course.category && (
                                    <div className="text-xs text-muted-foreground">{course.category.name}</div>
                                )}
                                {course.textContent && (
                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.textContent}</div>
                                )}
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}