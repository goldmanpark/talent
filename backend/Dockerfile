FROM node:14-slim

WORKDIR /usr/src/app

# Install Python3 and yfinance module
RUN apt-get update && apt-get install python-dev python-pip -y
RUN pip install yfinance

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --only=production

COPY . ./

EXPOSE 8080
CMD [ "node", "server.js" ]