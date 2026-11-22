FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY tsconfig.json ./
COPY src ./src
RUN npm install --no-audit --no-fund typescript && npx tsc && npm prune --omit=dev
COPY data ./data
ENV PORT=3000 MCP_TRANSPORT=http
EXPOSE 3000
CMD ["node", "dist/server.js", "--http"]
