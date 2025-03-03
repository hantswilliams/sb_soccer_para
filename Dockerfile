# Use Alpine-based Node.js image for smaller footprint
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve to run the built application
RUN npm install -g serve

# Expose port
EXPOSE 3017

# Start the application
CMD ["serve", "-s", "build", "-l", "3017"]