FROM node:lts as runner
WORKDIR /pdf-compress
ENV NODE_ENV production
ARG COMMIT_ID
ENV COMMIT_ID=${COMMIT_ID}
COPY . .
RUN npm ci --only=production[^1^][1]

# Install Ghostscript
RUN apt-get update && apt-get install -y ghostscript

EXPOSE 3000
CMD ["node", "server.js"]
