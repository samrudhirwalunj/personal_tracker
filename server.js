// Custom server entry point for Hostinger's Passenger-managed Node.js hosting,
// which expects a single startup file rather than running `next start` directly.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`personal-tracker listening on port ${port}`);
  });
});
