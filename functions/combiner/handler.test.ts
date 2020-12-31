import { handler } from "./handler";

test("it works", async () => {
  const keys = [
    "hopkins-2020-12-31T14:28:16.498Z.json",
    "nyt-2020-12-31T14:28:16.492Z.json"
  ];

  await handler(keys);
}, 100000);
