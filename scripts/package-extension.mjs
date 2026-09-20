// Zip the extension folder for upload to the Chrome Web Store: dist/signal-noise-<version>.zip
//
// Node has no zip writer, and a dependency for forty lines is not worth it. This
// writes a plain deflated archive with the manifest at its root, which is what
// the store expects. Timestamps are fixed so the same source gives the same file.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { crc32, deflateRawSync } from "node:zlib";

const ROOT = "extension";
const { version } = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));

const files = (dir) =>
  readdirSync(dir)
    .sort()
    .flatMap((name) => (statSync(join(dir, name)).isDirectory() ? files(join(dir, name)) : [join(dir, name)]));

const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1; // 2026-01-01, 00:00
const chunks = [];
const central = [];
let offset = 0;

for (const file of files(ROOT)) {
  const name = Buffer.from(relative(ROOT, file).split(sep).join("/"));
  const raw = readFileSync(file);
  const packed = deflateRawSync(raw, { level: 9 });

  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4); // version needed
  header.writeUInt16LE(0x0800, 6); // names are UTF-8
  header.writeUInt16LE(8, 8); // deflate
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(crc32(raw), 14);
  header.writeUInt32LE(packed.length, 18);
  header.writeUInt32LE(raw.length, 22);
  header.writeUInt16LE(name.length, 26);

  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt16LE(20, 4);
  header.copy(entry, 6, 4, 30); // the fields the two records share
  entry.writeUInt32LE(offset, 42);

  chunks.push(header, name, packed);
  central.push(entry, name);
  offset += header.length + name.length + packed.length;
}

const directory = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(central.length / 2, 8);
end.writeUInt16LE(central.length / 2, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);

mkdirSync("dist", { recursive: true });
const out = join("dist", `signal-noise-${version}.zip`);
writeFileSync(out, Buffer.concat([...chunks, directory, end]));
console.log(`${out} — ${central.length / 2} files, ${Math.round((offset + directory.length + 22) / 1024)} KB`);
