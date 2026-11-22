# Root Dockerfile for Hugging Face Spaces (Docker SDK) and other Docker hosts.
# Builds the MCP server from mcp/ and serves Streamable HTTP on $PORT.
# Hugging Face Spaces sets PORT=7860; Render / Koyeb inject their own $PORT.
FROM node:20-slim
WORKDIR /app
COPY mcp/package.json mcp/package-lock.json ./
RUN npm ci --omit=dev
COPY mcp/tsconfig.json ./
COPY mcp/src ./src
RUN npm install --no-audit --no-fund typescript && npx tsc && npm prune --omit=dev
COPY mcp/data ./data
ENV MCP_TRANSPORT=http
ENV PORT=7860
EXPOSE 7860
CMD ["node", "dist/server.js", "--http"]
