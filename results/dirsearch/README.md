# Dirsearch Results

This folder contains directory brute-force results from the Dirsearch tool.

## File Format
Plain text files with HTTP status codes, response sizes, and discovered paths.

## Example Output Structure
```
[200] [    1234] /admin/
[200] [     567] /api/v1/
[403] [       0] /backup/
[301] [       0] /login -> /login/
```

## Status Code Legend
- 200: OK - Resource found
- 301/302: Redirect 
- 403: Forbidden - Access denied
- 404: Not Found
- 500: Internal Server Error