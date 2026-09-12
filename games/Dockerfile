FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
EXPOSE 2567
ENV PORT=2567
CMD ["npx", "tsx", "src/index.ts"]
