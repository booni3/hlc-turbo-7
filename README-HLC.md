# The Hairpin Leg Co.
- HLC Turbo 7

# Gulp Build
Gulp is used to compile our custom CSS & JS into minified files. We used [this repo](https://github.com/jasewarner/gulp-shopify) as a starting point.

SCSS is used, but as we are working mainly with CSS we omit the linting.

Scripts and styles are stored within the dev folder. To run the build process

```bash
cd dev #navigate to folder
npm run build #to build assets
npm run watch #to watch folders & build on change
```

# Shopify CLI
We use the [Shopify CLI](https://shopify.dev/themes/tools/cli/getting-started) tool to interact with the Shopify hosted store.

Login
```bash
shopify login --store the-hairpin-leg-co.myshopify.com
```
Pull a theme. Run this and select the theme you wish to pull
```bash
shopify theme pull
```
To view the theme run serve. This will upload a development theme and return options to interact
```bash
shopify theme serve
```

# References
[Liquid Docs](https://shopify.dev/api/liquid)
[Liquid Cheat Sheet](https://www.shopify.com/partners/shopify-cheat-sheet)
