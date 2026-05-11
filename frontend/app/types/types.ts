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
}

export interface Blocks {
  id: number,
  
}

export interface Quiz {
  id: number;
  courseId: number;
  questionText: string;
  correctAnswer: string | null;
}

