FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Remove lockfile to force fresh install of linux binaries (fixes rollup error)
RUN rm -f package-lock.json && npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
