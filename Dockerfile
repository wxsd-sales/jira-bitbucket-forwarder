
FROM node:23.8
#docker build -t jira-bitbucket-forwarder .
#docker run -p 10031:10031 -i -t jira-bitbucket-forwarder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
#RUN npm run build

CMD [ "node", "index.js" ]