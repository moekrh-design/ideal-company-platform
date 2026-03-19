FROM node:22-alpine

WORKDIR /app

# Cache bust: 2026-03-19-v5-full-rebuild
ARG CACHE_BUST=2026-03-19-v5

# Copy full source for build
COPY package.json package-lock.json* ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.js* ./
COPY tailwind.config.js* ./
COPY postcss.config.js* ./
COPY server/ ./server/

# Install ALL dependencies (including devDeps for build)
RUN npm install

# Build the frontend
RUN npm run build

# Install only production server deps
RUN npm install pg nodemailer --no-save

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "server/index.js"]
