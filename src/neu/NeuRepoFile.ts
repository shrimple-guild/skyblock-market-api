import type { Glob } from "bun"

export class RepoFile {
    readonly path: string
    private buffer: Buffer
  
    constructor(path: string, buffer: Buffer) {
        this.path = path
        this.buffer = buffer
    }

    matches(glob: Glob) {
        return glob.match(this.path)
    }
  
    toJson<T>() {
      return JSON.parse(this.buffer.toString("utf-8")) as T;
    }
}
