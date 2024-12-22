FROM node:22-alpine AS builder
WORKDIR /build
COPY . ./
RUN npm i
RUN npm run build

FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /build/dist ./dist
COPY --from=builder [ "/build/package.json", "/build/package-lock.json", "/build/LICENSE.txt", "./"]
RUN npm ci --only=production
CMD ["npm", "start"]
