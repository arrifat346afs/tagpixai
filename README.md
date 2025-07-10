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

The project follows a modern React application structure:

```
src/
├── app/                    # App-specific components and logic
│   ├── (routes)/           # Route groups using Next.js-inspired structure
│   │   ├── api-settings/   # API settings page
│   │   ├── metadata-settings/ # Metadata settings page
│   │   └── (home)/         # Home page (default route)
│   ├── layout.tsx          # Root layout component
│   └── providers.tsx       # All context providers
├── components/             # Reusable components
│   ├── ui/                 # UI components (buttons, inputs, etc.)
│   └── settings/           # Settings-related components
├── context/                # React context providers
├── electron/               # Electron main process code
│   ├── main.ts             # Main process entry
│   ├── preload.ts          # Preload script
│   └── util.ts             # Electron utilities
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and libraries
├── services/               # Service layer for API calls, etc.
│   └── api/                # API services
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
└── main.tsx                # React entry point
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
- Mistral AI Integration
- Electron Store for persistence
- ImageScript for image processing

## Features

- AI-powered metadata generation for images
- Batch processing of multiple images
- Customizable metadata settings
- Support for multiple AI providers
- Export metadata to various formats
- User-friendly interface with dark mode
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
