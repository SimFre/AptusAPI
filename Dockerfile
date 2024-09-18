FROM node:current-alpine
WORKDIR /app
RUN apk add --no-cache ca-certificates git \
    && git clone https://github.com/SimFre/AptusAPI.git . \
    && npm ci --only-production \
    && chmod +x /app/init.sh
COPY . .
EXPOSE 3001/tcp
CMD /app/init.sh
