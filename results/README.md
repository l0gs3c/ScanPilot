# Scan Results

This folder contains the scan results organized by tool type.

## Folder Structure

- **subfinder/**: Subdomain enumeration results
- **dirsearch/**: Directory bruteforce results  
- **nuclei/**: Vulnerability scan results

## File Naming Convention

Files are named using the pattern: `{domain}_{tool}.txt`

Examples:
- `example.com_subdomains.txt`
- `api.example.com_dirsearch.txt`
- `target.com_nuclei.txt`

## Output Formats

- Subfinder: Text (.txt) or JSON (-oJ flag)
- Dirsearch: Text (.txt) with detailed directory listings
- Nuclei: Text (.txt) with vulnerability findings