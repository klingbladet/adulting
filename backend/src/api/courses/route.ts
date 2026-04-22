import { NextResponse } from "next/server";
import { db } from "@/db"; // Din drizzle-instans
import { courses } from "@/db/course-schema";
import { insertCourseSchema } from "@/db/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validera inkommande data
    const validatedData = insertCourseSchema.parse(body);

    // 2. Spara i databasen via Drizzle
    const newCourse = await db.insert(courses).values(validatedData).returning();

    // 3. Returnera svar
    return NextResponse.json(newCourse[0], { status: 201 });
    
  } catch (error) {
    // Hantera valideringsfel eller databasfel
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
}