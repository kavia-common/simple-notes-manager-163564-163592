# Notes Frontend

This Remix app provides:
- User authentication (signup, login, logout)
- CRUD for notes
- Search and filter by tags
- Responsive layout with a sidebar and main content
- Tailwind-based modern minimal design

Environment:
- NOTES_API_BASE_URL: Base URL for notes_db backend (e.g., http://localhost:8000)
- SITE_URL (optional)

Auth:
- Stores backend-issued JWT token in an httpOnly session cookie (__notes_session).
- Sends Authorization: Bearer <token> to the backend for protected requests.

Routes:
- /login (POST /auth/login)
- /signup (POST /auth/signup)
- /logout (POST to clear session)
- /notes (list + sidebar search and tag filter)
- /notes/new (create)
- /notes/:noteId (view)
- /notes/:noteId/edit (update)
