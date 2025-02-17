FROM oven/bun:1
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build
ARG PORT
EXPOSE ${PORT:-5000}

CMD ["bun", "start"]