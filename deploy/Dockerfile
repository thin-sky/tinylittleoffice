# Run the locally verified build; the host needs only Docker.
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production DB=/data/tinier.sqlite PORT=8000 TINIER_PORT=8001
COPY package.json ./
COPY dist ./dist
COPY selfhost ./selfhost
COPY site/site.ts ./site/
COPY tinier/tinier.ts tinier/cards.ts tinier/brake.ts tinier/d1.ts tinier/page.html ./tinier/
COPY tinier/migrations ./tinier/migrations
COPY scripts/headers.ts ./scripts/
COPY src/kit/core/network.ts ./src/kit/core/
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 8000 8001
CMD ["node", "selfhost/server.ts"]
