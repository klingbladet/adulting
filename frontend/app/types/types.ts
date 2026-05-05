export interface Course {
  id: number;
  userId: string | null;
  categoryId: string | null;
  title: string;
  textContent: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  time: number | null;
  blocks: number | null;
  status: string | null;
}

export interface Quiz {
  id: number;
  courseId: number;
  questionText: string;
  correctAnswer: string | null;
}

export interface UserProgress {
  id: number;
  userId: string;
  courseId: number;
  status: string;
  score: number | null;
}
