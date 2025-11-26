FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g pnpm
RUN pnpm i

COPY . .

RUN pnpm run build --configuration production --base-href /

FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4000 

WORKDIR /usr/src/app

COPY --from=frontend-builder /app/package.json .
RUN npm install -g pnpm
RUN pnpm install --production

COPY --from=frontend-builder /app/dist/piscord-frontend/browser ./dist/piscord-frontend/browser
COPY --from=frontend-builder /app/dist/piscord-frontend/server ./dist/piscord-frontend/server

EXPOSE 4200

CMD ["node", "dist/piscord-frontend/server/server.mjs"]