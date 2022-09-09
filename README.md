# Local dev

cd Documents/Remix/remix-lists/remix-lists/

npm run dev

PORT=10000 npm run dev

npx prisma studio

npx prisma db push

# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Fly Setup

1. [Install `flyctl`](https://fly.io/docs/getting-started/installing-flyctl/)

2. Sign up and log in to Fly

```sh
flyctl auth signup
```

3. Setup Fly. It might ask if you want to deploy, say no since you haven't built the app yet.

```sh
flyctl launch
```

### Fly Setup notes

1. Use Remix flyio set up at initial set up

2. Add secrects before deploy (supabase, session etc) eg fly secrets set SESSION_SECRET="mysecrectblah"

3. fly volumes create data --size 1 --app indie-stack-template

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

If you've followed the setup instructions already, all you need to do is run this:

```sh
npm run deploy
```

You can run `flyctl info` to get the url and ip address of your server.

Check out the [fly docs](https://fly.io/docs/getting-started/node/) for more information.
