# Syrup: Simple APIs at the Edge

Store and work with content at the edge in a Cloudflare Worker.

## Features

### Server rendering without the headaches

Server render React, Preact, or your favorite JavaScript framework. There’s no Node.js instances to manage, Cloudflare Workers automatically scales V8 instances for you.

### Process on the fly

Render Markdown & HTML templates, call APIs, process data, validate signatures. Cloudflare Workers have a full JavaScript environment.

### Immutable content

Text and images are stored in content-addressable storage. This means existing content is efficiently de-duped and reused.

### Caching at the edge

When a user loads a piece of content, it is cached at the edge closest to them. And when processing content, its result is cached too.
