let originalProcessEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalProcessEnv = { ...process.env };
});

afterEach(() => {
  process.env = { ...originalProcessEnv };
});
