<<<<<<< HEAD
# E-Commerce App - AI Agent Instructions

This is a full-stack **MERN (MongoDB, Express, React, Node.js)** e-commerce application. The codebase is organized into two main directories: `Backend/` (Express API) and `Frontend/` (React + Vite).

## Project Structure

### Backend (Express.js API)
```
Backend/
├── server.js                 # Express server entry point (port 5000)
├── package.json              # Dependencies: express, mongoose, jsonwebtoken, bcryptjs, cors
├── .env                      # Environment variables: MONGO_URI, JWT_SECRET, PORT
├── config/
│   └── db.js                 # MongoDB Atlas connection via Mongoose
├── controllers/
│   └── authController.js     # registerUser(), loginUser() - JWT-based auth with bcrypt password hashing
├── middleware/
│   ├── authMiddleware.js     # Bearer token validation, attaches user to req.user
│   └── roleMiddleware.js     # Role-based access control (template, needs completion)
├── models/
│   └── User.js               # MongoDB schema: name, email, password (hashed), timestamps
└── routes/
    ├── authroutes.js         # POST /auth/signup, /auth/login; GET /auth/profile
    └── adminRoutes.js        # GET /admin/dashboard (admin-only, partial implementation)
```

**Key Details**:
- JWT expiry: 7 days
- Password hashing: bcryptjs with 10 salt rounds
- Response format: `{ success: boolean, message: string, token?, user? }`
- Auth header: `Authorization: Bearer <token>`

### Frontend (React + Vite)
```
Frontend/
├── vite.config.js            # Vite bundler config with React plugin (Oxc parser)
├── tailwind.config.js        # Tailwind CSS v3 configuration
├── eslint.config.js          # ESLint Flat Config format
├── package.json              # React 19, Vite, Tailwind, react-router-dom, axios
├── index.html                # Entry point: renders to #root
├── src/
│   ├── main.jsx              # React.StrictMode entry point
│   ├── App.jsx               # Root component (minimal stub)
│   ├── index.css             # Tailwind directives (@tailwind base, components, utilities)
│   ├── App.css               # Empty, will be replaced by Tailwind utilities
│   └── assets/               # Static assets directory
└── public/                   # Public files
```

**Key Details**:
- Styling: Tailwind CSS v3 (no component library)
- Routing: react-router-dom installed but not configured
- HTTP client: axios installed but not integrated
- Build tool: Vite with HMR for development

## Development Workflow

### Backend
```bash
cd Backend
npm install
npm run dev      # Start with nodemon (auto-reload on file changes)
npm start        # Production mode
```

### Frontend
```bash
cd Frontend
npm install
npm run dev      # Vite dev server (port 5173 by default) with HMR
npm run build    # Production build → /dist
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## API Endpoints (Current)

| Method | Endpoint | Handler | Auth | Role |
|--------|----------|---------|------|------|
| POST | /api/auth/signup | registerUser | - | - |
| POST | /api/auth/login | loginUser | - | - |
| GET | /api/auth/profile | (protected) | Bearer token | - |
| GET | /api/admin/dashboard | (partial) | Bearer token | admin |

## Code Conventions

### Backend
1. **Async/await** for all async operations (no callbacks)
2. **Controllers**: Business logic in `controllers/`, one function per action
3. **Routes**: RESTful naming (`/api/resource`, `/api/resource/:id`)
4. **Error handling**: Try-catch in controllers, consistent response format
5. **Middleware**: Auth/role checks before route handlers
6. **Database**: Use Mongoose models for all DB operations

### Frontend
1. **React**: Functional components with hooks (React 19)
2. **CSS**: Tailwind utility classes (no BEM or CSS modules)
3. **Routing**: React Router for SPA navigation (not yet configured)
4. **HTTP**: Use axios with interceptors for Bearer token attachment
5. **State**: Plan for Redux/Context API when complexity grows
6. **Files**: Keep component files in `src/components/`, pages in `src/pages/`

## Important Notes

### Missing Features (TODO)
- **User model**: Missing `role` field (needed for admin functionality)
- **Frontend routing**: React Router not configured yet
- **API service layer**: axios not integrated; need interceptors for auth
- **Product management**: No models, controllers, or routes
- **Input validation**: No joi/yup schema validation on backend
- **Rate limiting**: No rate limiter middleware

### Security Considerations
- JWT secret is basic; consider stronger secrets in production
- No rate limiting on auth endpoints
- Frontend needs CORS setup for API calls
- Consider adding request validation before database operations

### Environment Setup
- **MongoDB Atlas**: Connection string in `Backend/.env`
- **Frontend API base**: Will need `VITE_API_URL` for axios configuration
- **Port**: Backend defaults to 5000; frontend dev server on 5173

## Working with AI Features (ChatGPT/LLM)

Currently, no AI/LLM integrations exist in the codebase. If adding ChatGPT functionality in the future:
- Install: `npm install openai` or `langchain`
- Create service: `Backend/services/aiService.js` for API calls
- Add env vars: `OPENAI_API_KEY`, `OPENAI_ORG_ID`
- Use cases: product recommendations, customer support chatbot, content generation
- Common pattern: OpenAI API → Backend service → Frontend display

## File Naming & Organization

- **Controllers**: camelCase + "Controller" suffix (e.g., `productController.js`)
- **Routes**: camelCase + "routes" suffix (e.g., `productRoutes.js`)
- **Models**: PascalCase (e.g., `Product.js`)
- **Middleware**: descriptive + "Middleware" suffix (e.g., `errorHandler.js`)
- **Components**: PascalCase (e.g., `ProductCard.jsx`)
- **Utils**: camelCase (e.g., `formatPrice.js`)

## Quick Reference

| Task | Command |
|------|---------|
| Install backend deps | `cd Backend && npm install` |
| Install frontend deps | `cd Frontend && npm install` |
| Start backend dev | `cd Backend && npm run dev` |
| Start frontend dev | `cd Frontend && npm run dev` |
| Build frontend | `cd Frontend && npm run build` |
| Lint frontend | `cd Frontend && npm run lint` |
| Connect to MongoDB | Check `Backend/.env` MONGO_URI |

## Related Documentation

- Frontend template docs: [React + Vite Guide](https://vitejs.dev/)
- Backend auth pattern: JWT + bcrypt (standard Node.js auth)
- Styling: [Tailwind CSS Docs](https://tailwindcss.com/)

=======
# Praveen-Stores
🛍️ Praveen Stores – A premium MERN Stack e-commerce application built with React, Node.js, Express, MongoDB Atlas, and Redux Toolkit. Features include user authentication, admin dashboard, product management, cart &amp; wishlist functionality, responsive design, and secure JWT-based authorization.
>>>>>>> 4a9025393769f0deb0c37e7d7dc7bab5e08dee94
