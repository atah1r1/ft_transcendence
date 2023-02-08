FROM node:16.15.0

WORKDIR /app/
COPY ./frontend .
RUN npm install
RUN echo "NEXT_PUBLIC_BACKEND_URL=http://10.11.4.9:9000/api" > .env
RUN echo "NEXT_PUBLIC_BACKEND_URL_SOCK=http://10.11.4.9:9000" >> .env
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
