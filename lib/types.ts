export interface Professor {
  id: string
  name: string
  created_at: string
}

export interface Class {
  id: string
  title: string
  category: string | null
  professor_id: string | null
  meeting_days: string[]
  start_time: string | null  // e.g. "10:00"
  end_time: string | null    // e.g. "11:30"
  semester: string
  created_at: string
  // Joined
  professor?: Professor
}

export interface Review {
  id: string
  class_id: string
  overall_rating: number
  workload_rating: number
  comment: string | null
  tags: string[]
  semester: string
  helpful_count: number
  created_at: string
}

export interface ReviewVote {
  id: string
  review_id: string
  voter_key: string
  created_at: string
}

// Aggregated views
export interface ClassWithStats extends Class {
  avg_overall: number
  review_count: number
}

export interface ProfessorWithStats extends Professor {
  avg_overall: number
  review_count: number
}
