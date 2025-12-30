# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (Fly.io will use PORT env variable)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
