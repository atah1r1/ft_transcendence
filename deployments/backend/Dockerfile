FROM node:16.15.0

# Create app directory
WORKDIR /app/BACK

COPY ./backend .
COPY ./deployments/backend/config.env .env

# Install app dependencies
RUN npm install

RUN npm run build

RUN npm uninstall bcrypt
RUN npm i bcrypt
RUN npm uninstall prisma
RUN npm i prisma
RUN npx prisma generate

EXPOSE 9000
CMD ["npm", "run", "start:migrate:prod"]
