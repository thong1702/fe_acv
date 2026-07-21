# Stage 1: Build Angular App
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve với Nginx (hỗ trợ HTML5 routing)
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy kết quả build từ Stage 1 sang Nginx
# Lưu ý: Angular 18 mặc định xuất ra dist/fe_acv/browser (hoặc dist/fe_acv)
COPY --from=build /app/dist/fe_acv/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
