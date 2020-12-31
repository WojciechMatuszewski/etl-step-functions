import { setupServer } from "msw/node";
import { rest } from "msw";
import { handler } from "./handler";

test("it works", async () => {
  const key = await handler();

  console.log(key);
}, 10000);
