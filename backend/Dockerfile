FROM node:14-slim

# Install Python3 and yfinance module
RUN apt-get update || : && apt-get install python-dev python-pip -y
RUN pip install yfinance

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --only=production

COPY . ./

EXPOSE 8080
CMD [ "node", "server.js" ]