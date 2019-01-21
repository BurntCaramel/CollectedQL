# Syrup: Content management and processing at the Edge

Store, present, and process content at the edge closest to your users with Cloudflare Workers.

## Features

### Server rendering without the headaches

Server render React, Preact, or your favorite JavaScript framework. There’s no Node.js instances to manage, as Cloudflare Workers automatically scales V8 instances for you.

### Process on the fly

Render Markdown & HTML templates, call APIs, process data, validate signatures, and more. Cloudflare Workers have a full JavaScript environment.

### Immutable content

Text and images are stored by their address. The same content has the same address. This means content is efficiently de-duped and reused.

### Caching at the edge

Like a CDN, when a user loads a piece of content, it is cached at the edge closest to them. But also when processing content, the result is cached, meaning future requests to process the same content are instant.
