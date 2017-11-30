import { createServer } from "http";

const server = createServer(function(req, res) {
  res.end("hello, world");
});
server.listen(3000, () => {
  console.log("listen on http://localhost:3000");
});
