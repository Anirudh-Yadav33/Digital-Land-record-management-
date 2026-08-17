# Lightweight Docker Container for Digital Land Registry Platform
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy source code and application assets
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads

# Expose HTTP port 3000
EXPOSE 3000

# Set environment defaults
ENV PORT=3000
ENV NODE_ENV=production

# Start application server
CMD ["npm", "start"]
