# 🎭 GenAI Story - Interactive Fantasy Adventure Platform

An immersive, AI-powered interactive storytelling platform where your choices shape epic fantasy adventures. Built with React, Node.js, and TypeScript, featuring persistent story states, dynamic character interactions, and a comprehensive admin panel for story management.

## ✨ Features

### 🎲 **Dynamic Storytelling**
- **AI-Powered Narratives**: Stories generated and adapted based on player actions
- **Persistent Adventures**: Stories automatically save and survive server restarts
- **Character Recognition**: NPCs become known to players when mentioned in the story
- **Smart Item Management**: Automatic inventory tracking with contextual property detection
- **Goal Progression**: Dynamic quest tracking with progress indicators

### 🎮 **Immersive Player Experience**
- **Real-Time Chat Interface**: Conversation-style story progression
- **Quick Action Suggestions**: AI-generated action buttons for faster gameplay
- **Rich Inventory System**: Detailed item properties with expandable info panels
- **Character Profiles**: Track known NPCs and their relationships
- **Goal Dashboard**: Monitor active quests and completion progress
- **Magical Loading Experience**: Enchanted flavor text during story generation

### 🛡️ **Admin Panel & Management**
- **Complete Story Control**: Edit characters, items, goals, story beats, and world state
- **Real-Time Editing**: Modal-based forms for all story components
- **Persistent Storage**: JSON-file based system with automatic backups
- **Import/Export**: Share and backup stories in multiple formats
- **Story Analytics**: Track player progress and story statistics

### 🏗️ **Technical Specs**
- **Full-Stack TypeScript**: End-to-end type safety
- **Persistent JSON Storage**: File-based story persistence with backup system
- **RESTful API Design**: Granular endpoints for story component management
- **Responsive UI**: Tailwind CSS with mobile-friendly design
- **Error Handling**: Comprehensive validation and error recovery

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GENAISTORY
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   ```bash
   # In backend directory, create .env file
   echo "DEEPSEEK_API_KEY=your_api_key_here" > backend/.env
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend (from root)
   npm run dev:backend
   
   # Terminal 2: Start frontend (from root)
   npm run dev:frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📋 Development Commands

### Root Level Commands
```bash
npm run dev:frontend    # Start React dev server
npm run dev:backend     # Start Express server with hot reload
npm test               # Run all tests
npm run test:frontend  # Frontend tests only
npm run test:backend   # Backend tests only
```

### Backend Commands (from /backend)
```bash
npm run dev            # Development server with hot reload
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

## 🎯 Usage Guide

### 🎮 Playing Stories
1. **Start Adventure**: Select "The Mysterious Tavern" or create a new story
2. **Interactive Storytelling**: Type actions or use suggested quick actions
3. **Character Discovery**: NPCs become known when mentioned in the story
4. **Inventory Management**: Items automatically tracked with detailed properties
5. **Quest Tracking**: Monitor goals and progress in the side panel

### 🛠️ Admin Management
1. **Access Admin Panel**: Navigate to the admin section
2. **Select Story**: Choose any story to manage
3. **Edit Components**:
   - **Characters**: Add/edit NPCs, manage visibility and secrets
   - **Inventory**: Create items with detailed properties and types
   - **Goals**: Set up quests with progress tracking
   - **Story Beats**: Structure narrative progression
   - **World State**: Manage location, stats, and flags

### 💾 Story Persistence
- Stories automatically save to `backend/data/stories/`
- Backups maintained in `backend/data/backups/`
- No data loss between server restarts
- Export/import functionality for story sharing

## 🏛️ Architecture

### 📂 Project Structure
```
GENAISTORY/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── app.ts          # Express application
│   └── data/               # Persistent storage
│       ├── stories/        # Story JSON files
│       └── backups/        # Automatic backups
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API integration
└── shared/                 # Shared TypeScript types
    └── types/              # Common type definitions
```

### 🔄 Story Generation Pipeline
```
Player Input → Context Building → AI Generation → Validation → State Updates → Response
```

1. **Context Agent**: Builds story context from current state
2. **Story Generator**: Creates narrative content with DeepSeek AI
3. **Consistency Validator**: Checks for contradictions and coherence
4. **State Updater**: Updates characters, inventory, goals, and world state
5. **Response Delivery**: Returns formatted story content to player

## 🔧 API Reference

### Story Management
- `GET /api/stories` - List all stories
- `POST /api/stories` - Create new story
- `GET /api/stories/:id` - Get story (player view)
- `POST /api/stories/:id/continue` - Continue story with player input

### Admin Endpoints
- `GET /api/stories/:id/admin` - Get full story data (admin view)
- `PUT /api/stories/:id/admin` - Update entire story

### Component Management
- `POST/PUT/DELETE /api/stories/:id/admin/characters/:characterId`
- `POST/PUT/DELETE /api/stories/:id/admin/inventory/:itemId`
- `POST/PUT/DELETE /api/stories/:id/admin/goals/:goalId`
- `POST/PUT/DELETE /api/stories/:id/admin/beats/:beatId`
- `PUT /api/stories/:id/admin/state` - Update world state

## 🎨 Key Components

### Frontend Components
- **StoryPlayer**: Main gameplay interface with chat-style interaction
- **AdminPanel**: Comprehensive story management with modal editing
- **StoryDashboard**: Story selection and overview

### Backend Services
- **StoryService**: Core story management and persistence
- **StorageService**: JSON file-based persistence with backup system
- **StateUpdater**: Automatic character and inventory detection
- **StoryOrchestrator**: Multi-agent story generation pipeline

## 🔮 Features in Detail

### Smart Character Detection
- Automatically reveals hidden NPCs when mentioned
- Supports full names, first names, and last names
- Word boundary matching prevents false positives
- Extensive introduction pattern recognition

### Rich Item Properties
- **Visual Context**: Properties displayed with icons and units
- **Type-Specific Fields**: Different properties based on item type
- **Player-Friendly Display**: Expandable info panels with meaningful labels
- **Admin Editing**: Form fields for common properties (value, damage, capacity, etc.)

### Immersive Generation Experience
- **Magical Flavor Text**: "🔮 The crystal ball swirls with mystical energy..."
- **Progress Phases**: Story generation → Validation → State updates
- **Visual Feedback**: Animated progress indicators with fantasy theming
- **Error Handling**: Thematic error messages maintain immersion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🏷️ Technologies Used

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS 4
- Jest + Testing Library

**Backend:**
- Node.js + Express
- TypeScript
- File-based JSON storage
- Jest testing

**AI Integration:**
- DeepSeek API
- Multi-agent architecture
- Context building + validation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

- [ ] Multi-player story collaboration
- [ ] Advanced AI personality system for NPCs
- [ ] Story branching and multiple endings
- [ ] Achievement system and player progression
- [ ] Story marketplace and community sharing
- [ ] Voice narration and audio effects
- [ ] Mobile app companion

---

**Created with ✨ magic and ⚡ TypeScript**

*Embark on adventures limited only by your imagination...*