# 10x-cards

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.14.0-brightgreen)](https://nodejs.org/)

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10x-cards is an educational flashcard application that leverages AI to help users create and manage study materials efficiently. The application uses LLM models to generate flashcard suggestions from provided text, significantly reducing the time needed to create high-quality study materials.

Key features:
- AI-powered flashcard generation from text input
- Manual flashcard creation and management
- User authentication and account management
- Integration with spaced repetition algorithm
- Secure data storage and privacy compliance
- Flashcard generation statistics tracking

## Tech Stack

### Frontend
- [Astro 5](https://astro.build/) - Fast, modern web framework
- [React 19](https://react.dev/) - Interactive UI components
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- [Tailwind 4](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component library

### Backend
- [Supabase](https://supabase.com/) - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - SDK support

### AI Integration
- [Openrouter.ai](https://openrouter.ai/) - LLM API gateway
  - Access to multiple AI models
  - Cost-effective API management

### CI/CD & Hosting
- GitHub Actions - CI/CD pipelines
- DigitalOcean - Docker-based hosting

## Getting Started Locally

### Prerequisites
- Node.js >= 22.14.0
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MrCresh619/10x-cards.git
cd 10x-cards
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add necessary environment variables:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:4321`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Project Scope

### MVP Features
- AI-powered flashcard generation
- Manual flashcard creation and management
- User authentication
- Basic spaced repetition integration
- Secure data storage
- Flashcard generation statistics

### Out of Scope (Future Considerations)
- Advanced spaced repetition algorithm
- Gamification features
- Mobile applications
- Multiple document format imports
- Public API
- Flashcard sharing
- Advanced notification system
- Advanced search functionality

## Project Status

The project is currently in active development. Key metrics for success include:
- 75% acceptance rate of AI-generated flashcards
- 75% of new flashcards created using AI
- Monitoring of generation and acceptance statistics

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 