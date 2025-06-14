# Sử dụng image cơ sở Node.js 20.19.2 dựa trên Debian Bullseye
FROM node:20.19.2-bullseye

# Cài đặt các công cụ và thư viện cần thiết
# Đảm bảo cài đặt tất cả các phụ thuộc cần thiết cho canvas và các thư viện khác
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    gcc \
    pkg-config \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    libpng-dev \
    libfreetype6-dev \
    fontconfig \
    libreoffice \
    openjdk-11-jre \
    build-essential \
    # Thêm các thư viện cần thiết khác nếu có
    && rm -rf /var/lib/apt/lists/*

# Cài đặt node-gyp toàn cục
RUN npm install -g node-gyp

# Không cần SVG cho canvas, nhưng bạn có thể bật lại nếu cần
ENV CANVAS_RSVG=0

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json để cài đặt phụ thuộc
# Chỉ cài đặt những gì cần thiết cho môi trường dev
COPY package*.json ./
RUN npm install -g nodemon && npm install

# Cài đặt canvas và các phụ thuộc khác
# Sử dụng --build-from-source để đảm bảo tương thích
RUN npm cache clean --force && \
    npm install canvas@2.11.2 --build-from-source --verbose && \
    npm install

# Mở cổng cho ứng dụng Node.js
EXPOSE 3000

# Lệnh mặc định để khởi động ứng dụng.
# Trong môi trường dev, chúng ta sẽ sử dụng nodemon thông qua docker-compose.
# CMD ["node", "index.js"] # Lệnh này sẽ bị ghi đè bởi docker-compose