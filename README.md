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
git clone https://github.com/arrifat346afs/tagpixai.git
cd tagpixai
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

The project follows a modern Electron and React application structure:

```
src/
├── app/                    # App-specific components and logic
│   ├── _components/        # Shared components like FilePreview,NavBar, etc.
│   ├── main.tsx            # React entry point
│   └── App.tsx             # Root React component
├── components/             # Reusable components
│   ├── ui/                 # UI components (buttons, inputs, etc.)
│   └── motion-primitives/  # Animations like text shimmer
├── electron/               # Electron main process code
│   ├── main.ts             # Main process entry
│   ├── preload.cts         # Preload script
│   ├── ipc/                # IPC handlers
│   ├── metadata/           # Metadata-related utilities
│   ├── resizeImage/        # Image resizing utilities
│   ├── Thumbnail/          # Thumbnail generation utilities
│   └── workers/            # Worker threads for heavy tasks
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and libraries
├── services/               # Service layer for API calls, etc.
├── types/                  # TypeScript type definitions
└── index.html              # HTML entry point
```

### Build Output

```
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
- Multiple AI Integrations (e.g., Mistral AI)
- Electron Store for persistence
- ImageScript for image processing
- Sharp for image manipulation
- Sonner for notifications
- Lucide React for icons

## Features

- AI-powered metadata generation for images
- Batch processing of multiple images
- Customizable metadata settings
- Support for multiple AI providers (e.g., Mistral AI, others)
- Export metadata to various formats (JSON, CSV, etc.)
- User-friendly interface with dark mode
- Local file system integration
- Custom thumbnail generation with performance optimization
- Metadata persistence using Electron Store
- Cross-platform support (Windows, macOS, Linux)

## Development Notes

- The app uses Electron's IPC for communication between main and renderer processes
- All file system operations are handled in the main process
- The UI is built using React with Tailwind CSS for styling
- Settings and metadata are persisted using electron-store

## License

[Your License Here]

## Contributing
TypeScript
[Your Contributing Guidelines Here]
