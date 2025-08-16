-- 初期スキーマ作成
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    janus_session_id BIGINT,
    janus_handle_id BIGINT,
    sip_username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS call_history (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    from_number VARCHAR(100),
    to_number VARCHAR(100),
    duration INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);