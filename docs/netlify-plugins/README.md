# Purpose
This directory exists to deploy documentation PR previews.

Building the static content for a documentation preview requires Docker.

Netlify doesn't support Docker out of the box.

This directory includes a [`plugin`](https://docs.netlify.com/integrations/build-plugins/#configure-settings) to download Docker for Netlify so it can use it to generate the static content needed to build the site for a preview.
