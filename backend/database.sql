-- create users table
CREATE TABLE users (
  user_id SERIAL UNIQUE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create notes table
CREATE TABLE notes (
  note_id SERIAL UNIQUE PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'untitled',
  content TEXT,
  pin_by_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published BOOLEAN DEFAULT FALSE,
  folder_id INT DEFAULT NULL,
  user_id INT NOT NULL REFERENCES users(user_id), -- foreign key
  CONSTRAINT fk_folder FOREIGN KEY(folder_id) REFERENCES folders(folder_id) ON DELETE SET NULL
);
/*
ALTER TABLE notes
  ADD COLUMN folder_id INT NULL,
  ADD CONSTRAINT fk_folder FOREIGN KEY(folder_id) REFERENCES folders(folder_id) ON DELETE SET NULL;
*/

-- create permission table
CREATE TABLE note_permission (
  perm_id SERIAL UNIQUE PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(user_id),
  note_id INT NOT NULL REFERENCES notes(note_id),
  user_id INT NOT NULL REFERENCES users(user_id), -- user that grant permission by owner
  can_view BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE
);

-- create public note table
CREATE TABLE public_note_template (
  note_id INT UNIQUE NOT NULL REFERENCES notes(note_id),
  title VARCHAR(255) NOT NULL,
  user_id INT NOT NULL REFERENCES users(user_id), -- no need
  username TEXT NOT NULL REFERENCES users(username),
  note_public_description VARCHAR(255),
  note_public_tags TEXT[]
);

-- create folders table
CREATE TABLE folders (
  folder_id SERIAL UNIQUE PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL DEFAULT 'untitled_folder',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  parent_id INT DEFAULT NULL, -- for nested folders
  user_id INT NOT NULL REFERENCES users(user_id),
  CONSTRAINT fk_parent FOREIGN KEY(parent_id) REFERENCES folders(folder_id) ON DELETE CASCADE
);