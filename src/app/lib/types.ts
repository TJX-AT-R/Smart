
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  category: string;
  imageUrl?: string;
  explanation?: string;
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
