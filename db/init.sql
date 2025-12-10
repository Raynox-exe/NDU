CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password VARCHAR(255) NOT NULL,
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
