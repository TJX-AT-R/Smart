
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  category: string;
  imageUrl?: string;
}

export interface LessonModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: string;
  progress: number;
}

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  priceDollars: number;
  downloadUrl: string;
  thumbnailUrl: string;
}

export interface UserProgress {
  userId: string;
  completedLessons: string[];
  testScores: {
    testId: string;
    score: number;
    totalQuestions: number;
    date: string;
  }[];
}

export type Category = 'Road Signs' | 'Rules of the Road' | 'Hazard Perception' | 'Safety' | 'Motorway';
