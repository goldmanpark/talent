FROM node:14-slim

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --only=production

COPY . ./

EXPOSE 8081
CMD ["npm", "run", "start-linux"]