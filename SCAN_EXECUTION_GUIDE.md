# ScanPilot - Scan Execution Guide

## 📋 Overview

ScanPilot allows you to configure and execute security scanning tools (Subfinder, Dirsearch, Nuclei, Amass) through a web interface with real-time output streaming. Results are organized by target and stored with complete metadata in the database.

## 🏗️ System Architecture

- **Backend**: FastAPI with WebSocket support for real-time output streaming
- **Frontend**: React with TypeScript for configuration UI
- **Storage**: Results organized as `storage/scan_results/target_<id>/tool_name/`
- **Database**: SQLite with SQLAlchemy ORM, stores scan metadata and results
- **Process Management**: Asyncio subprocess execution for non-blocking scans

## 🚀 Quick Start

### 1. Prerequisites

#### Install Security Tools

**Subfinder** (Go binary - run directly):
```bash
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

**Dirsearch** (Python tool - already included in `tools/` directory):
- Located at: `tools/dirsearch-0.4.3/dirsearch.py`
- No additional installation needed
- Executed via Python: `python tools/dirsearch-0.4.3/dirsearch.py`

**Nuclei** (Go binary - run directly):
```bash
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
```

**Amass** (Go binary - run directly):
```bash
go install -v github.com/owasp-amass/amass/v4/...@master
```

**For Kali Linux**: Most tools may already be installed. Verify with:
```bash
which subfinder
which nuclei  
which amass
ls tools/dirsearch-0.4.3/dirsearch.py
```

### 2. Start Backend Server

```powershell
# From ScanPilot root directory
cd backend
python main.py
```

Backend will run on `http://localhost:8000`

### 3. Start Frontend Server

```powershell
# From ScanPilot root directory
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000` (or `http://localhost:3003` if 3000-3002 are busy)

## 🎯 Using the Scan Feature

### Step 1: Navigate to Scan Execution

1. Login to ScanPilot (default: `admin` / `admin123`)
2. Click "Scans" in the sidebar
3. Click "New Scan" button
4. Or navigate directly to `/scan/execute`

### Step 2:Configure Scan

#### A. Select Target
- Choose from existing targets in your database
- Displays domain, name, and type

#### B. Select Tool

##### **Subfinder** (Subdomain Discovery)
- **Use Case**: Find subdomains of a target domain
- **Configuration Options**:
  - Threads: Number of concurrent operations (default: 10)
  - Timeout: Request timeout in seconds (default: 30)
  - Verbose: Show verbose output
  - All Sources: Use all available subdomain sources

**Example Configuration:**
```json
{
  "threads": 15,
  "timeout": 45,
  "verbose": true,
  "all": true
}
```

##### **Dirsearch** (Directory/File Discovery)
- **Use Case**: Discover hidden directories and files on web servers
- **Configuration Options**:
  - Extensions: File extensions to search (e.g., php,html,js)
  - Wordlist: Path to wordlist file (default: `/tools/wordlist/common.txt`)
  - Threads: Number of threads (default: 20)
  - Recursive: Enable recursive directory scanning
  - Exclude Status: HTTP status codes to exclude (e.g., 404,403)
  - Random User-Agent: Use random user agents

**Example Configuration:**
```json
{
  "extensions": ["php", "html", "js", "txt"],
  "wordlist": "/wordlist/common.txt",
  "threads": 25,
  "recursive": true,
  "exclude_status": [404, 403, 500],
  "random_agent": true
}
```

##### **Nuclei** (Vulnerability Scanning)
- **Use Case**: Detect vulnerabilities using community templates
- **Configuration Options**:
  - Templates: Template paths (e.g., cves/, vulnerabilities/)
  - Severity: Filter by severity levels (critical, high, medium, low)
  - Threads: Number of concurrent templates (default: 10)
  - Rate Limit: Max requests per second (default: 150)
  - Timeout: Template timeout in seconds (default: 5)

**Example Configuration:**
```json
{
  "templates": ["cves/", "vulnerabilities/", "exposures/"],
  "severity": ["critical", "high"],
  "threads": 15,
  "rate_limit": 100,
  "timeout": 10
}
```

##### **Amass** (Advanced Subdomain Enumeration)
- **Use Case**: Comprehensive network mapping and asset discovery
- **Configuration Options**:
  - Passive: Use passive reconnaissance only
  - Active: Enable active reconnaissance
  - Brute Force: Enable brute force enumeration
  - Timeout: Overall timeout in minutes (default: 30)
  - Max DNS Queries: Maximum DNS queries per minute (default: 200)

**Example Configuration:**
```json
{
  "passive": false,
  "active": true,
  "brute": true,
  "timeout": 60,
  "max_dns_queries": 300
}
```

### Step 3: Start Scan

Click "Start Scan" button to begin execution.

### Step 4: View Real-Time Output

The terminal component will display:
- **Connection status** at the top (connecting, running, completed, error)
- **Real-time command output** with color-coded messages:
  - 🟢 Green: Normal output
  - 🔵 Blue: Info messages `[INFO]`
  - 🟡 Yellow: Warnings/Status `[WARN]` `[STATUS]`
  - 🟣 Purple: Commands `[CMD]`
  - 🔴 Red: Errors `[ERROR]`

**Terminal Features:**
- ✅ Auto-scroll toggle
- 📥 Download output
- 🗑️ Clear terminal
- 🎨 Color-coded output
- ⚡ Real-time WebSocket streaming

## 📁 Output Files & Storage

Scan results are organized by target for easy management:

```
storage/scan_results/
  └── target_<target_id>/
      ├── subfinder/
      │   └── subfinder_example_com_20260223_153045.txt
      ├── dirsearch/
      │   └── dirsearch_example_com_20260223_153245/
      │       └── report.txt
      ├── nuclei/
      │   └── nuclei_example_com_20260223_154012.json
      └── amass/
          └── amass_example_com_20260223_155330.txt
```

**Storage Benefits:**
- 📂 Organized by target_id for easy browsing
- 🔍 Separate folders for each tool
- 📅 Timestamped files prevent overwrites
- 🗄️ Scan metadata stored in database with file path reference

### Download Results

1. Wait for scan completion
2. Click download button in terminal header
3. Or use API endpoint: `GET /api/v1/scans/{scan_id}/download`
4. Directories (dirsearch) are automatically zipped

## 🔌 API Endpoints

### Create Scan
```http
POST /api/v1/scans/
Content-Type: application/json
Authorization: Bearer <token>

{
  "tool": "subfinder",
  "target_id": 1,
  "config": {
    "threads": 10,
    "verbose": true
  }
}
```

**Request Fields:**
- `tool`: Tool name (subfinder, dirsearch, nuclei, amass)
- `target_id`: ID of target from database (backend fetches domain/URL automatically)
- `config`: Tool-specific configuration object

**Response:**
```json
{
  "scan_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Scan created",
  "websocket_url": "/ws/scans/550e8400-e29b-41d4-a716-446655440000"
}
```

### WebSocket Connection

Connect to WebSocket for real-time output:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/scans/{scan_id}');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message.type, message.data);
};
```

**Message Types:**
- `connected`: Initial connection established
- `status`: Scan status updates
- `output`: Tool output lines
- `error`: Error messages
- `completed`: Scan finished

### Control Scan
```http
POST /api/v1/scans/{scan_id}/control
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "pause|resume|stop"
}
```

### Get Scan Details
```http
GET /api/v1/scans/{scan_id}
Authorization: Bearer <token>
```

### Download Results
```http
GET /api/v1/scans/{scan_id}/download
Authorization: Bearer <token>
```

## ⚙️ Technical Implementation

### Tool Execution Methods

**Dirsearch** (Python-based):
```bash
# Executed via Python interpreter
python tools/dirsearch-0.4.3/dirsearch.py -u <url> -e <extensions> -o <output>
```
- Located in `tools/dirsearch-0.4.3/` directory
- No PATH requirement - uses relative path
- Runs with system Python interpreter

**Subfinder, Nuclei, Amass** (Go binaries):
```bash
# Executed directly from PATH
subfinder -d <domain> -o <output>
nuclei -u <url> -o <output>
amass enum -d <domain> -o <output>
```
- Require installation in system PATH
- Run as standalone binaries
- May already be installed on Kali Linux

### Database Schema

**Scans Table:**
```sql
CREATE TABLE scans (
  id INTEGER PRIMARY KEY,
  scan_id VARCHAR(36) UNIQUE,
  target_id INTEGER FOREIGN KEY,
  tool VARCHAR(50),
  config JSON,
  status VARCHAR(50),
  output_file VARCHAR(500),
  output_lines TEXT,
  error_message TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP
)
```

**Benefits:**
- Full scan history per target
- Searchable scan metadata
- Output preview (last 1000 lines)
- Complete file path reference

### Process Management

- **AsyncIO**: Non-blocking subprocess execution
- **Streaming**: Real-time stdout via AsyncIterator
- **WebSocket**: JSON message streaming to browser
- **Control**: Pause/Resume (Unix), Stop (all platforms)

## 🛠️ Troubleshooting

### Dirsearch Not Running

**Error:** `FileNotFoundError: tools/dirsearch-0.4.3/dirsearch.py`

**Solution:**
1. Verify dirsearch exists: `ls tools/dirsearch-0.4.3/dirsearch.py`
2. Check backend runs from project root: `pwd` should show `ScanPilot` root
3. Verify dirsearch.py permissions: `chmod +x tools/dirsearch-0.4.3/dirsearch.py`

### Tools Not Found

**Error:** `Tool 'subfinder' not found in PATH`

**Solution:**
1. Verify tool installation: `which subfinder` (Unix) or `where subfinder` (Windows)
2. Add Go bin to PATH: `export PATH=$PATH:$HOME/go/bin`
3. Restart backend server after PATH changes

### WebSocket Connection Failed

**Error:** `WebSocket connection error`

**Solution:**
1. Check backend is running on port 8000
2. Verify CORS settings in `backend/app/core/config.py`
3. Check browser console for detailed error

### Scan Hangs/Timeout

**Solution:**
1. Check tool output in `storage/scan_results/`
2. Increase timeout values in configuration
3. Verify target is reachable
4. Check system resources (CPU/Memory)

### Permission Denied

**Error:** `Permission denied: /storage/scan_results/`

**Solution:**
```bash
# Create directory with proper permissions
mkdir -p storage/scan_results
chmod 755 storage/scan_results
```

## 📊 Best Practices

### 1. Start with Small Scopes
- Test with known targets first
- Use limited wordlists for dirsearch
- Set reasonable timeouts

### 2. Monitor Resource Usage
- Limit concurrent threads on slower systems
- Use rate limiting for nuclei
- Monitor disk space for results

### 3. Security Considerations
- Only scan authorized targets
- Use passive mode (amass) for stealth
- Respect rate limits and target policies

### 4. Result Management
- Regularly clean old scan results
- Archive important findings
- Export results for reporting

## 🎨 UI Dark Mode

The scan interface fully supports dark mode:
- Toggle via sidebar button
- Preference saved in localStorage
- Applies to terminal output
- Consistent color scheme

## 📝 Example Workflows

### Workflow 1: Full Domain Reconnaissance

1. **Subfinder**: Discover subdomains
2. **Dirsearch**: Find directories on discovered subdomains
3. **Nuclei**: Scan for vulnerabilities on discovered endpoints

### Workflow 2: Quick Vulnerability Assessment

1. **Nuclei** with CVE templates only
2. Filter by critical/high severity
3. Review results and export findings

### Workflow 3: Comprehensive Enumeration

1. **Amass** with active + brute force
2. **Subfinder** with all sources
3. **Dirsearch** on interesting subdomains
4. **Nuclei** full scan on confirmed assets

## 🔗 References

- [Subfinder GitHub](https://github.com/projectdiscovery/subfinder)
- [Dirsearch GitHub](https://github.com/maurosoria/dirsearch)
- [Nuclei GitHub](https://github.com/projectdiscovery/nuclei)
- [Amass GitHub](https://github.com/owasp-amass/amass)

## 📫 Support

For issues or feature requests, please create an issue in the GitHub repository.
