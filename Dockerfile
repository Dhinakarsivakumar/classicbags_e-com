# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production runtime with Node.js Unified Server & Webhook API
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public
COPY --from=build /app/server /app/server
COPY --from=build /app/package*.json /app/
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server/webhook-server.js"]
