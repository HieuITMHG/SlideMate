# Sử dụng Node.js 20-alpine làm image cơ sở cho giai đoạn build
FROM node:20-alpine AS build

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt tất cả các phụ thuộc của dự án
RUN npm install

# Sao chép toàn bộ mã nguồn của ứng dụng vào thư mục làm việc
COPY . .

# Chạy lệnh build của ứng dụng frontend (ví dụ: React, Vue, Angular)
# Lệnh này sẽ tạo ra các file tĩnh đã được tối ưu hóa cho môi trường production
RUN npm run build

# Sử dụng Nginx làm web server cho các file tĩnh
FROM nginx:alpine

# Xóa các file cấu hình Nginx mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Sao chép cấu hình Nginx tùy chỉnh của bạn (nếu có)
# Nếu bạn không có file cấu hình tùy chỉnh, Nginx sẽ phục vụ các file từ /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép các file đã build từ giai đoạn "build" vào thư mục phục vụ của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80 để truy cập ứng dụng frontend
EXPOSE 80

# Khởi động Nginx và chạy nó ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]