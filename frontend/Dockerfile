FROM node:20-bookworm-slim

WORKDIR /app

COPY frontend/package*.json ./
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
	&& rm -rf /var/lib/apt/lists/* \
	&& npm install

COPY frontend/. .

EXPOSE 3000

CMD ["npm", "run", "dev"]