import { path } from "app-root-path";
import { join } from "path";

function getFunctionPath(pathFromFunctionsDir: string) {
  return join(path, `dist/functions/${pathFromFunctionsDir}`);
}

function getFromRootPath(pathFromRoot: string) {
  return join(path, pathFromRoot);
}

export { getFunctionPath, getFromRootPath };
