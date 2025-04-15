FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY .env.example ./

# Set environment variables
ENV NODE_ENV=production

# Run the service
CMD ["node", "dist/index.js"] 