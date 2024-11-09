CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects(
    project_id UUID PRIMARY KEY,
    project_created_by VARCHAR(255) REFERENCES users(username) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_owners(
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_admin BOOLEAN DEFAULT FALSE,
    last_opened TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS files (
    file_id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(project_id) NOT NULL,
    file_created_by VARCHAR(255) REFERENCES users(username) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_extension VARCHAR(255) NOT NULL,
    file_data JSONB,
    file_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_live_users(
    project_id UUID REFERENCES projects(project_id) NOT NULL,   
    username VARCHAR(255) REFERENCES users(username) NOT NULL,
    project_live_users_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, username)
); 

CREATE TABLE IF NOT EXISTS live_users(
    file_id UUID REFERENCES files(file_id) NOT NULL,
    project_id UUID REFERENCES projects(project_id) NOT NULL,   
    username VARCHAR(255) REFERENCES users(username) NOT NULL,
    is_active_in_tab BOOLEAN DEFAULT FALSE NOT NULL,
    is_live BOOLEAN DEFAULT FALSE NOT NULL,
    live_users_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (file_id, username)
);

CREATE TABLE IF NOT EXISTS file_tree(
    file_tree_id UUID PRIMARY KEY, -- in root file it will be parent_id == file_tree_id == file_id
    -- file_tree_id UUID REFERENCES files(file_id) PRIMARY KEY, -- in root file it will be parent_id == file_tree_id == file_id
    project_id UUID REFERENCES projects(project_id) NOT NULL,
    parent_id UUID REFERENCES file_tree(file_tree_id),  
    name VARCHAR(255) NOT NULL,
    is_folder BOOLEAN NOT NULL,
    file_tree_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_tree_expand_user( -- only for folders
    user_id UUID REFERENCES users(id) NOT NULL,
    file_tree_id UUID REFERENCES file_tree(file_tree_id) NOT NULL,
    PRIMARY KEY (user_id, file_tree_id),
    file_tree_expand_user TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- also add which project had which file for each database, like active_files, live_users
