FROM node:4
MAINTAINER victor


ADD . /app

CMD ["cd", "app"]
CMD ["npm", "install"]
CMD ["npm", "start"]