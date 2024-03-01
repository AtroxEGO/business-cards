FROM node:current-alpine3.18

WORKDIR /app

COPY package.json ./

RUN npm install
RUN npx nest build

COPY . .

CMD ["npm", "run", "start:prod"]
