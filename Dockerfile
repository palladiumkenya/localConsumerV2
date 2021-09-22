FROM node:latest

# Working directory in your container
WORKDIR /opt/localConsumerV2

COPY package.json .

RUN npm install

RUN npm run build

ENV TIMEZONE Africa/Narobi

# Copy everything inside the current working directory to the container ideal path
COPY ./ /opt/localConsumerV2

EXPOSE 1440

CMD [ “npm”, “start” ] 
