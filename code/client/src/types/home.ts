export interface TimetableItem {
  classTime: number;
  subject: string;
  teacher?: string;
  hasAssessment?: boolean;
  assessmentTitle?: string;
}

export interface Assessment {
  id: number;
  title: string;
  maxScore: number;
  period: number;
  examDate: string;
  teacherName: string;
  subjectName: string;
}

export interface Meal {
  menu: string;
  mealType: string;
}
