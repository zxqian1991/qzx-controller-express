import { statSync } from 'fs';

export function tempValue<T, K>(v: T, handler: (m: T) => K) {
  return handler(v);
}

export function isFile(filepath: string) {
  try {
    const res = statSync(filepath);
    return res.isFile();
  } catch (e) {
    return false;
  }
}
export function isDirectory(filepath: string) {
  try {
    const res = statSync(filepath);
    return res.isDirectory();
  } catch (e) {
    return false;
  }
}
export function exists(filepath: string) {
  try {
    statSync(filepath);
    return true;
  } catch (e) {
    return false;
  }
}

export function requireWithoutCache(filepath: string) {
  const fullpath = exists(filepath)
    ? filepath
    : exists(`${filepath}.ts`)
    ? `${filepath}.ts`
    : `${filepath}.js`;
  if (require.cache[fullpath]) {
    const mod = require.cache[fullpath];
    delete require.cache[fullpath];
    if (mod && mod.parent && mod.parent.children) {
      const index = mod.parent.children.indexOf(mod);
      if (index >= 0) {
        mod.parent.children.splice(index, 1);
      }
    }
  }
  return require(fullpath);
}

export function get<K, T>(
  v: T,
  keys: (string | symbol)[],
  defaultV: K | undefined | null = undefined as any,
): K | undefined | null {
  // return
  if (!v) return defaultV;
  let temp: any = v;
  for (let i in keys) {
    const key = keys[i];
    if (key) {
      temp = temp[key];
      if (!temp) return defaultV;
    }
  }
  return temp;
}
