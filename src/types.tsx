export interface Courses {
    id: string;
    name: string;
    description: string;
    categoryname: string;
  }
  
  export interface Category {
    id: string;
    name: string;
    courses: Courses[];
    isLoading?: boolean;
  }
  
  export interface Tutor {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  }
  
  export interface SearchFilter {
    tutor: string[];
    category: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
    course: string;
  }
  