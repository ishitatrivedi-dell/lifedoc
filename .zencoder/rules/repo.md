---
description: Repository Information Overview
alwaysApply: true
---

# lifeDoc Repository Information

## Repository Summary
lifeDoc is a lifestyle systemization project consisting of a Next.js frontend and an Express backend. It aim to provide tools for users to organize their lifestyle, featuring voice recognition and a structured backend for data management.

## Repository Structure
- **client/**: Next.js frontend application providing the user interface and lifestyle management tools.
- **server/**: Express.js backend server handling API requests, database interactions, and business logic.

### Main Repository Components
- **Frontend (client)**: Built with Next.js, React, and Tailwind CSS.
- **Backend (server)**: Built with Node.js, Express, and Mongoose for MongoDB integration.

## Projects

### client (Next.js Application)
**Configuration File**: `client/package.json`

#### Language & Runtime
**Language**: TypeScript / JavaScript  
**Version**: Node.js runtime  
**Build System**: Next.js Build System  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `next`: 16.1.1
- `react`: 19.2.3
- `axios`: ^1.13.2
- `react-icons`: ^5.5.0
- `react-speech-recognition`: ^4.0.1

**Development Dependencies**:
- `typescript`: ^5
- `tailwindcss`: ^4
- `eslint`: ^9

#### Build & Installation
```bash
# Install dependencies
cd client
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

#### Testing
**Framework**: ESLint (Linting)
**Test Location**: N/A (Standard Next.js structure)
**Run Command**:
```bash
npm run lint
```

### server (Express Backend)
**Configuration File**: `server/package.json`

#### Language & Runtime
**Language**: JavaScript  
**Version**: Node.js runtime  
**Build System**: Node.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `express`: ^5.2.1
- `mongoose`: ^9.0.2
- `dotenv`: ^17.2.3
- `cors`: ^2.8.5
- `axios`: ^1.13.2

**Development Dependencies**:
- `nodemon`: ^3.1.11

#### Build & Installation
```bash
# Install dependencies
cd server
npm install

# Run development server
npm run dev
```

#### Main Files & Resources
- **Entry Point**: `server/server.js`
- **Configuration**: `server/.env` (Environment variables)
