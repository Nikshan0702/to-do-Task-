FROM node:24

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other files
COPY . .

# Build the React + Vite app
RUN npm run build

# Install serve globally to serve static files
RUN npm install -g serve

# Expose port 5173
EXPOSE 5173

# Optional healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5173 || exit 1

# Serve the built app from 'dist' directory (Vite default)
CMD ["serve", "-s", "dist", "-l", "5173"]
