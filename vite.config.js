import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';  

// Load environment variables from .env file

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});