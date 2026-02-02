# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include dev for build tools)
RUN npm install

# Copy source code
COPY . .

# Build the application with API URL
ARG NUXT_PUBLIC_API_BASE_URL=http://89.167.19.50:3004
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Expose port
EXPOSE 3005

# Start the application
CMD ["node", ".output/server/index.mjs"]