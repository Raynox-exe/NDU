CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Profile Fields
  dob DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(50),
  nationality VARCHAR(100),
  state_origin VARCHAR(100),
  lga VARCHAR(100),
  nin_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state_residence VARCHAR(100),
  nok_name VARCHAR(255),
  nok_phone VARCHAR(50),
  nok_address TEXT,
  qualification VARCHAR(50),
  employment_status VARCHAR(50),
  program_interest VARCHAR(100),
  experience_level VARCHAR(50),
  ref_name VARCHAR(255),
  ref_relationship VARCHAR(100),
  ref_phone VARCHAR(50),
  ref_email VARCHAR(255),
  
  -- Admin Flag
  is_admin BOOLEAN DEFAULT FALSE
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  description TEXT,
  lecturer_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  grade VARCHAR(5),
  UNIQUE(student_id, course_id)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INT DEFAULT 100,
  assignment_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  submission_file_url TEXT,
  submission_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  score INT,
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);
