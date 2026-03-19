FROM node:20-alpine

WORKDIR /app

# Copy only what's needed for the server
COPY server/ ./server/
COPY dist/ ./dist/
COPY package.json ./

# Install only nodemailer (the only external server dependency)
RUN npm install nodemailer --no-save

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "server/index.js"]
