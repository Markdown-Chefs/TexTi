-- create users table
CREATE TABLE users (
  user_id SERIAL UNIQUE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMP;
-- ALTER TABLE users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE users ADD UNIQUE (user_id);
-- ALTER TABLE users ADD UNIQUE (username);

-- create notes table
CREATE TABLE notes (
  note_id SERIAL UNIQUE PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'untitled',
  content TEXT,
  pin_by_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published BOOLEAN DEFAULT FALSE,
  user_id INT NOT NULL REFERENCES users(user_id) -- foreign key
);
-- ALTER TABLE notes ADD pin_by_owner BOOLEAN DEFAULT FALSE;
-- ALTER TABLE notes ADD last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE notes ADD published BOOLEAN DEFAULT FALSE;
-- ALTER TABLE notes ADD UNIQUE (note_id);

-- create permission table
CREATE TABLE note_permission (
  perm_id SERIAL UNIQUE PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(user_id),
  note_id INT NOT NULL REFERENCES notes(note_id),
  user_id INT NOT NULL REFERENCES users(user_id), -- user that grant permission by owner
  can_view BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE
);
-- ALTER TABLE note_permission ADD UNIQUE (perm_id);

CREATE TABLE public_note_template (
  note_id INT UNIQUE NOT NULL REFERENCES notes(note_id),
  user_id INT UNIQUE NOT NULL REFERENCES users(user_id), -- no need
  username TEXT UNIQUE NOT NULL REFERENCES users(username),
  note_public_description VARCHAR(255),
  note_public_tags TEXT[]
);