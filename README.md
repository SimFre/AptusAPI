
# API Server for Aptus

## To Do:
1. ~~Set up calls to Aptus via puppeteer.~~
2. ~~Set up express to listen to calls.~~
3. ~~Link express calls to api library.~~
4. ~~Move credentials and port to env variables.~~
5. ~~Bundle package as a Docker image~~
6. ~~Setup links in Home Assistant.~~
7. Setup NFC tags in HA.
8. ~~Setup Siri shortcuts on iOS.~~

## Docker Compose
I've used this with a [macvlan](https://docs.docker.com/network/macvlan/)-setup, thus the configured (example) IP's below.
```
version: "3.4"
services:
  aptusapi:
    build:
      context: "."
      network: br
    container_name: aptusapi
    domainname: example.tld
    environment:
      - PORT=3001
      - APTUS_USERNAME=insert_username_here
      - APTUS_PASSWORD=insert_password_here
      - APTUS_BASEURL=https://aptusurl.example.tld
    expose:
      - 3001/tcp
    hostname: aptusapi
    image: simfre/aptusapi
    networks:
      lan:
        ipv4_address: 10.0.0.5
        ipv6_address: 2001:db8::5
        aliases:
          - aptusapi
    restart: unless-stopped
networks:
  lan:
    external: true
```
Execute this with `docker-compose up --build` after putting the `Dockerfile` into the same folder as `docker-compose.yml`.