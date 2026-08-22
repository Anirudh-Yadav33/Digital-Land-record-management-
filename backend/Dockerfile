# Lightweight Docker Container for Digital Land Registry Backend API
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy backend source code
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads

# Expose HTTP port 5000
EXPOSE 5000

# Set environment defaults
ENV PORT=5000
ENV NODE_ENV=production

# Start application server
CMD ["npm", "start"]
