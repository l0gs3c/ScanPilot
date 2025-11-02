# Nuclei Results

This folder contains vulnerability scan results from the Nuclei tool.

## File Format
Plain text files with detailed vulnerability findings including severity, template info, and affected URLs.

## Example Output Structure
```
[critical] [CVE-2021-44228] [http://example.com] Log4j Remote Code Execution
[high] [CVE-2020-1938] [http://example.com:8080] Apache Tomcat AJP File Read
[medium] [tech-detect] [http://example.com] Apache/2.4.41 (Ubuntu)
[info] [http-missing-security-headers] [http://example.com] Missing Security Headers
```

## Severity Levels
- **critical**: Immediate action required
- **high**: High priority fixes needed
- **medium**: Should be addressed
- **low**: Minor issues
- **info**: Informational findings