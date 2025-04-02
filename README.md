# TagPix AI

TagPix AI is an Electron-based desktop application built with React, TypeScript, and Vite that helps generate and manage metadata for images using AI.

## Prerequisites
- electron (v35.0.0 or higher)
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/arrifat346afs/react-electron-tagpix-ai.git
cd react-electron-tagpix-ai
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm run dev
```

This will start both:
- Vite dev server for React (port 5000)
- Electron app in development mode

## Building

### For Windows:
```bash
npm run dist:win
```

### For macOS:
```bash
npm run dist:mac
```

### For Linux:
```bash
npm run dist:linux
```

The built applications will be available in the `dist` directory.

## Project Structure

```
├── src/
│   ├── electron/     # Electron main process code
│   ├── ui/           # React application code
│   └── types/        # TypeScript type definitions
├── dist-electron/    # Compiled Electron code
├── dist-react/       # Compiled React code
└── public/           # Static assets
```

## Tech Stack

- React 19
- TypeScript
- Electron 35
- Vite 6
- Tailwind CSS
- Radix UI Components
- Mistral AI Integration
- Electron Store for persistence
- Sharp for image processing

## Features

- Image metadata generation using AI
- Local file system integration
- Custom thumbnail generation
- Metadata persistence
- Cross-platform support (Windows, macOS, Linux)

## Development Notes

- The app uses Electron's IPC for communication between main and renderer processes
- All file system operations are handled in the main process
- The UI is built using React with Tailwind CSS for styling
- Settings and metadata are persisted using electron-store

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]

