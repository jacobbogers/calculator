FROM node:22-alpine AS builder
WORKDIR /build
COPY . ./
RUN npm i
RUN npm run build

FROM nginx:1.23.3 AS final-stage
COPY --from=builder /build/dist/ /usr/share/nginx/html
COPY ./nginx.conf.template /etc/nginx/templates/default.conf.template
