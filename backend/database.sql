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
  title VARCHAR(255) UNIQUE NOT NULL DEFAULT 'untitled',
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL REFERENCES users(user_id) -- foreign key
);

-- test insert into notes table
INSERT INTO notes (title, content, user_id) VALUES ('note 1', 'content 1', 1);

-- select all notes own by a user
SELECT users.user_id, users.username, notes.*
FROM users
INNER JOIN notes
ON users.user_id = notes.user_id
WHERE users.username = 'test1';