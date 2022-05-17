FROM node:current-alpine
WORKDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN apk add --no-cache ca-certificates git chromium nss freetype harfbuzz ttf-freefont xvfb xkbcomp \
    && git clone https://github.com/SimFre/AptusAPI.git . \
    && npm ci --only-production \
    && addgroup -S pptruser \
    && adduser -S -G pptruser -h /app pptruser \
    && mkdir -p /app/Downloads /app \
    && chown -R pptruser:pptruser /app \
    && chmod +x /app/init.sh
COPY . .
USER pptruser
EXPOSE 3001/tcp
ENV DISPLAY :99
CMD /app/init.sh
