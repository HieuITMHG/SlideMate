# Sử dụng image cơ sở Node.js 20.19.2 dựa trên Debian Bullseye
FROM node:20.19.2-bullseye

# Cài đặt các công cụ và thư viện cần thiết
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
    && rm -rf /var/lib/apt/lists/*

# Cài đặt node-gyp toàn cục
RUN npm install -g node-gyp

# Không cần SVG
ENV CANVAS_RSVG=0

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Làm sạch cache npm và cài canvas
RUN npm cache clean --force && \
    npm install canvas@2.11.2 --build-from-source --verbose

# Cài các phụ thuộc còn lại
RUN npm install

# Sao chép mã nguồn
COPY . .

# Mở cổng 5000
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "index.js"]