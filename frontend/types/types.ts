import { JSONContent } from "@tiptap/core";

export interface Category {
  id: string;
  name: string;
  iconName: string | null;
}

export interface Course {
  id: number;
  userId: string | null;
  categoryId: string | null;
  category?: Category | null;
  title: string;
  textContent: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  time: number | null;
  blocks: number | null;
  status: string | null;
  isPublished: boolean;
  blocksList?: Block[];
  enrollments?: UserCourse[];
  userCourses?: UserCourse[];
}

export interface Block {
  id: number;
  courseId: number;
  orderIndex: number;
  title: string | null;
  content: JSONContent;
  createdAt?: string | null;
  updatedAt?: string | null;
  quizzes?: Quiz[];
}

export interface Quiz {
  id: number;
  blockId: number;
  questionText: string;
  correctAnswer: string | null;
}

export interface UserCourse {
  id: string;
  userId: string;
  courseId: number;
  status: "not_started" | "in_progress" | "completed" | string;
  knowledgeLevel: "beginner" | "intermediate" | string;
  enrolledAt: string;
  completedAt: string | null;
  score: number | null;
  course?: Course;
}

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement?: Achievement;
}

export interface UserInfo {
  name: string;
}
