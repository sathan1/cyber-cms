export type Role = 'ADMIN' | 'STAFF' | 'STUDENT' | 'PAID_USER';

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface MentorId {
  id: number;
  staff_id: string;
  mentor_code: string;
  department_id: number;
  department?: Department;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  mentor_id?: number | null;
  year?: number | null;
  roll_number?: string | null;
  status: string;
  email_verified_at?: string | null;
  mentor?: MentorId;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  pass_score: number;
  max_retries: number;
  questions_json: QuizQuestion[];
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  position: number;
  has_quiz: boolean;
  quiz?: Quiz;
}

export interface Assignment {
  id: number;
  course_id: number;
  created_by: number;
  title: string;
  description: string;
  due_date?: string | null;
  max_score: number;
  status: 'draft' | 'published';
  submissions_count?: number;
  my_submission?: AssignmentSubmission | null;
  course?: Pick<Course, 'id' | 'title' | 'slug'>;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  content: string;
  score?: number | null;
  feedback?: string | null;
  status: 'submitted' | 'graded';
  submitted_at: string;
  user?: User;
}

export interface QuizAttemptRecord {
  lesson_title: string;
  quiz_title: string;
  max_retries: number;
  student_name: string;
  student_email: string;
  roll_number: string;
  attempt_number: number;
  score_pct: number;
  passed: boolean;
  created_at: string;
}

export interface Course {
  id: number;
  department_id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  created_by: number;
  lessons_count?: number;
  department?: Department;
  creator?: User;
  lessons?: Lesson[];
  assignments?: Assignment[];
  is_enrolled?: boolean;
  progress_pct?: number;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  progress_pct: number;
  completed_at?: string | null;
  course?: Course;
}

export interface Remark {
  id: number;
  student_id: number;
  roll_number: string;
  mentor_id?: number;
  year: number;
  course_id: number;
  question: string;
  reply?: string | null;
  replied_by?: number | null;
  status: 'pending' | 'replied';
  created_at: string;
  student?: User;
  course?: Course;
  replier?: User;
  mentor?: MentorId;
}

export interface Payment {
  id: number;
  user_id: number;
  course_id: number;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  amount: number;
  status: 'pending' | 'successful' | 'failed';
  created_at: string;
  user?: User;
  course?: Course;
}
