-- create users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMP;
-- ALTER TABLE users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;


-- create notes table
CREATE TABLE notes (
  note_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'untitled',
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL REFERENCES users(user_id) -- foreign key
);

-- create permission table
CREATE TABLE note_permission (
  perm_id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(user_id),
  note_id INT NOT NULL REFERENCES notes(note_id),
  user_id INT NOT NULL REFERENCES users(user_id), -- user that grant permission by owner
  can_view BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE
);