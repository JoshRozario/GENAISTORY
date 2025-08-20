# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack interview boilerplate with separate frontend and backend applications:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript  
- **Shared**: Common TypeScript types
- **Architecture**: Clean separation with API-based communication

## Development Commands

### Root Level
```bash
# Run both frontend and backend in development
npm run dev:frontend    # Start React dev server (Vite)
npm run dev:backend     # Start Express server with hot reload

# Run all tests
npm test                # Runs both backend and frontend tests
npm run test:frontend   # Frontend tests only
npm run test:backend    # Backend tests only
```

### Backend Commands (from /backend)
```bash
npm run dev            # Development server with hot reload (ts-node-dev)
npm run build          # Compile TypeScript to JavaScript
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
```

### Frontend Commands (from /frontend)
```bash
npm run dev            # Start Vite development server
npm run build          # Build for production
npm run preview        # Preview production build
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
```

## Key Architecture Patterns

### Backend Structure
- **Express App Factory**: `createApp()` function in `src/app.ts` for testable app creation
- **Route Organization**: Feature-based routing in `/routes` (health, events)
- **Service Layer**: Business logic separated into `/services`
- **Shared Types**: Common types imported from `../shared/types`

### Frontend Structure
- **Custom Hooks**: `useFetch` hook for API calls with loading/error states
- **Component Testing**: Components have co-located `.test.tsx` files
- **API Integration**: Centralized API service in `/services/api.ts`
- **Tailwind Styling**: Utility-first CSS with responsive design

### Testing Setup
- **Backend**: Jest + Supertest for API testing
- **Frontend**: Jest + React Testing Library + jsdom
- **Shared Configuration**: Both use similar Jest configs with TypeScript support

## API Endpoints

- `GET /api` - Basic health check
- `GET /api/health` - Detailed health status
- `/api/events` - Event-related endpoints

The frontend assumes the backend runs on a different port and uses the `useFetch` hook for API communication.

## Type Safety

Shared TypeScript types are defined in `/shared/types/index.ts` and imported by both frontend and backend to ensure consistent data structures across the stack.