FROM node:18-alpine

WORKDIR /app

# package.json 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 앱 코드 복사
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
