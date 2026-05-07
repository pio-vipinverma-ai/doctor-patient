# Patient Management System - Frontend

Frontend application for the Patient Management System built with React 18, TypeScript, and Vite.

## Project Overview

A modern, responsive web application for managing patient records, appointments, and consultations in a healthcare clinic.

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm 8+

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── public/                          # Static assets
├── src/
│   ├── main.tsx                     # React mount point
│   ├── App.tsx                      # Root component with routing
│   ├── vite-env.d.ts                # Vite types
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx           # Top navigation bar
│   │       ├── Header.module.scss
│   │       ├── Sidebar.tsx          # Left navigation sidebar
│   │       ├── Sidebar.module.scss
│   │       ├── Layout.tsx           # Main layout wrapper
│   │       └── Layout.module.scss
│   │
│   ├── context/
│   │   └── AuthContext.tsx          # Global authentication state
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx            # Login screen
│   │   ├── LoginPage.module.scss
│   │   ├── DashboardPage.tsx        # Home/dashboard
│   │   └── DashboardPage.module.scss
│   │
│   └── styles/
│       ├── index.scss               # Global styles
│       └── variables.scss           # SCSS variables (colors, spacing, etc)
│
├── index.html                       # HTML entry point
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Features Implemented

✅ React 18 with TypeScript
✅ Vite for fast development and builds
✅ React Router for navigation
✅ SCSS with variables and modular styling
✅ Responsive design (mobile, tablet, desktop)
✅ Authentication context (AuthContext)
✅ Protected routes
✅ Layout with Header and Sidebar
✅ Login page with form validation
✅ Dashboard page with stats cards
✅ Mobile-responsive layout

## Environment Configuration

The application connects to the backend API at `http://localhost:5000` by default. This can be configured in your components using axios or fetch.

## Styling

The project uses SCSS with a comprehensive variable system:
- **Colors**: Primary (#0066CC), Success, Warning, Error, Neutral palette
- **Spacing**: 8px-based spacing scale (4px to 48px+)
- **Typography**: Consistent font system with multiple sizes
- **Responsive**: Mobile-first approach with breakpoints at 480px, 768px, 1024px

### SCSS Variables Available
- Color palette (primary, success, error, warning, neutral)
- Spacing scale
- Typography (fonts, sizes, weights)
- Layout dimensions (header height, sidebar width)
- Shadows and borders
- Animations/transitions

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## Routing

Current routes:
- `/` → Redirects to dashboard
- `/login` → Login page
- `/dashboard` → Protected dashboard page
- `*` → Redirects to dashboard

## Authentication Flow

1. User navigates to `/login`
2. Enters credentials and submits
3. AuthContext.login() is called
4. Token and user data stored in localStorage
5. Redirected to `/dashboard`
6. User info available via `useAuth()` hook

## Pages & Components

### LoginPage
- Username and password inputs
- Form validation
- Error display
- Loading state
- Responsive design

### DashboardPage
- Welcome message
- Statistics cards (appointments, patients, consultations, prescriptions)
- Quick action buttons
- Fully responsive grid layout

### Layout Components
- **Header**: Sticky top navigation with user menu and logout
- **Sidebar**: Left navigation menu (hidden on mobile, collapsible)
- **Layout**: Main wrapper component

## Development Tips

### Adding New Routes

Edit `src/App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

### Using useAuth Hook

```tsx
import { useAuth } from './context/AuthContext';

const MyComponent = () => {
  const { user, logout, isAuthenticated } = useAuth();
  // ...
};
```

### Creating New SCSS Modules

Import variables:
```scss
@import '../styles/variables.scss';

.myClass {
  color: $primary-color;
  padding: $spacing-16;
}
```

## Troubleshooting

### Port Already in Use
Change the port in `vite.config.ts`:
```ts
server: {
  port: 5174,
}
```

### SCSS Compilation Errors
Ensure sass is installed:
```bash
npm install sass --save-dev
```

### Module Not Found
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

The frontend infrastructure is complete. Next phase:
1. **Phase 1.3**: Database Setup
2. **Phase 2**: Authentication API integration
3. **Phase 3**: Patient Management UI
4. And so on...

See `../Document/EXECUTION_PROMPTS.md` for step-by-step implementation guides.

## License

ISC

## Author

Patient Management System Team
