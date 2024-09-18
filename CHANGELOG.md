
# Aptus API Server

## 2.0.0, 2024-09-18
Rewrote the whole thing using requests. It's no good just following the
redirects. Must stop and inject cookies that are generated. No more full
page render. Fantastic performance boost!

## 1.0.0, 2022-05-16
Initial release. Could not get it to work with requests or curl, so went
in the direction of Puppeteer and a point-and-click solution instead. It
worked, sometimes. Slow and clunky.
