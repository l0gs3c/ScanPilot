-- ScanPilot Database Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wildcards table
CREATE TABLE IF NOT EXISTS wildcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    pattern VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Targets table
CREATE TABLE IF NOT EXISTS targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER DEFAULT 80,
    protocol VARCHAR(10) DEFAULT 'http',
    wildcard_id UUID REFERENCES wildcards(id),
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, testing, closed
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scan tools table
CREATE TABLE IF NOT EXISTS scan_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    command_template TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID REFERENCES targets(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES scan_tools(id),
    command TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, paused, completed, failed, stopped
    progress INTEGER DEFAULT 0,
    result_file VARCHAR(255),
    output_file VARCHAR(255),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scan results table for storing key findings
CREATE TABLE IF NOT EXISTS scan_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    result_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- info, low, medium, high, critical
    title VARCHAR(255),
    description TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_targets_created_by ON targets(created_by);
CREATE INDEX IF NOT EXISTS idx_targets_wildcard_id ON targets(wildcard_id);
CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(status);
CREATE INDEX IF NOT EXISTS idx_scans_target_id ON scans(target_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_by ON scans(created_by);
CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_severity ON scan_results(severity);

-- Insert default scan tools
INSERT INTO scan_tools (name, command_template, description, category) VALUES
('DirSearch', 'python3 {tool_path}/dirsearch-0.4.3/dirsearch.py -u {target_url} -e {extensions} -o {output_file}', 'Directory and file brute-force tool', 'discovery'),
('Nmap Port Scan', 'nmap -sV -sC -oN {output_file} {target_host}', 'Network port scanner', 'discovery'),
('Nikto Web Scan', 'nikto -h {target_url} -o {output_file}', 'Web vulnerability scanner', 'vulnerability'),
('Gobuster Dir', 'gobuster dir -u {target_url} -w {wordlist} -o {output_file}', 'Directory brute-force tool', 'discovery')
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123)
-- Note: In production, this should be changed immediately
INSERT INTO users (username, email, hashed_password, is_superuser) VALUES
('admin', 'admin@scanpilot.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBUtrDFEpTqBiq', TRUE)
ON CONFLICT (username) DO NOTHING;