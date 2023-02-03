FROM node:16.15.0

# Create app directory
WORKDIR /app/BACK

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY ./BACK/package*.json ./
# COPY ./BACK/prisma ./prisma/

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
#CMD [ "npm", "run", "start:migrate:prod" ]
# FROM node:16.15.0 AS builder

# # Create app directory
# WORKDIR /app/

# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY ./backend/package*.json ./
# COPY ./backend/prisma ./prisma/
# COPY ./deployments/backend/config.env .env


# # Install app dependencies
# RUN npm install
# # Generate prisma client, leave out if generating in `postinstall` script
# RUN npx prisma generate

# COPY ./backend .

# RUN npm run build

# FROM node:16.15.0

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/dist ./dist

# EXPOSE 9000
# CMD ["npm", "run", "start:migrate:prod"]