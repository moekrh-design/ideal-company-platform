FROM node:22-alpine

WORKDIR /app

# Cache bust to force rebuild: 2026-03-19-v2
ARG CACHE_BUST=2026-03-19-v2

# Copy only what's needed for the server
COPY server/ ./server/
COPY dist/ ./dist/
COPY package.json ./

# Install server dependencies (pg for PostgreSQL, nodemailer for email)
RUN npm install pg nodemailer --no-save

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "server/index.js"]
