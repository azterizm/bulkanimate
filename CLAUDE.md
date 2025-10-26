# AnimateBulk - Project Guide

## Project Overview
AnimateBulk is a React + TypeScript web application designed to animate static images and export them as MP4 videos. The application allows users to upload multiple images, apply various animation effects (zoom, pan, rotate), preview animations in real-time, and export each image as a separate video file.

## Codebase Navigation

### Key Directories
- `src/` - Main application source code
- `public/` - Static assets
- `src/assets/` - React component assets

### Core Files
- `src/App.tsx` - Main application component with recording logic
- `src/App.css` - Animation keyframes and styles
- `src/main.tsx` - React application entry point
- `package.json` - Dependencies and project configuration
- `vite.config.ts` - Vite build configuration

## Project Goals
1. **Bulk Upload**: Support uploading multiple static images simultaneously
2. **Animation Effects**: Implement zoom in/out, pan, and rotate animations with configurable start/end points
3. **Duration Control**: Allow users to set video duration which affects animation speed
4. **Live Preview**: Provide real-time preview of animations during the editing process
5. **MP4 Export**: Export each animated image as a separate MP4 video file

## Technology Stack
- **Frontend**: React 19.1.1 with TypeScript
- **Build Tool**: Vite
- **Animation Recording**: html-to-image library for DOM-to-video conversion