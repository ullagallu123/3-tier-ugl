# FROM node:20-alpine as builder

# # Set New Relic environment variables
# ENV NODE_ENV=production
# ENV NEW_RELIC_NO_CONFIG_FILE=true
# ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
# ENV NEW_RELIC_LOG=stdout

# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM nginx:alpine
# # Copy New Relic config
# COPY --from=builder /app/node_modules/newrelic/newrelic.js /usr/share/nginx/newrelic.js
# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Add prometheus metrics endpoint to nginx config
# COPY metrics.conf /etc/nginx/conf.d/metrics.conf

# EXPOSE 80 9113
# CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine as builder

# Install build tools for compiling native deps
RUN apk add --no-cache build-base python3

WORKDIR /app

# Copy package files and install all deps (including devDependencies like vite)
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Run vite build
RUN npm run build

# ---------------- Production Stage ----------------
FROM nginx:alpine

# Set production environment variables
ENV NODE_ENV=production
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy New Relic file if needed
COPY --from=builder /app/node_modules/newrelic/newrelic.js /usr/share/nginx/newrelic.js

# NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY metrics.conf /etc/nginx/conf.d/metrics.conf

EXPOSE 80 9113
CMD ["nginx", "-g", "daemon off;"]
