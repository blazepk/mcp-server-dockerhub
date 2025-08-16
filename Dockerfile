# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init && rm -rf /var/cache/apk/*
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env.example ./.env.example

RUN addgroup -g 1001 -S nodejs && adduser -S mcp -u 1001 \
  && chown -R mcp:nodejs /app
USER mcp

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "process.exit(0)"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
