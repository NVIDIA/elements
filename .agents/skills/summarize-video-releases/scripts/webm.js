// Minimal WebM muxer for a single VP9 video track.
//
// Writes a seekable file from encoded chunks produced by the browser's WebCodecs
// VideoEncoder: EBML header, then a Segment with Info, Tracks, Cues, and one Cluster
// per keyframe. Cues sit before the clusters, so players can seek without scanning.
// No dependencies; the format follows the Matroska and WebM specifications.

const ID = {
  EBML: [0x1a, 0x45, 0xdf, 0xa3],
  EBMLVersion: [0x42, 0x86],
  EBMLReadVersion: [0x42, 0xf7],
  EBMLMaxIDLength: [0x42, 0xf2],
  EBMLMaxSizeLength: [0x42, 0xf3],
  DocType: [0x42, 0x82],
  DocTypeVersion: [0x42, 0x87],
  DocTypeReadVersion: [0x42, 0x85],
  Segment: [0x18, 0x53, 0x80, 0x67],
  Info: [0x15, 0x49, 0xa9, 0x66],
  TimecodeScale: [0x2a, 0xd7, 0xb1],
  Duration: [0x44, 0x89],
  MuxingApp: [0x4d, 0x80],
  WritingApp: [0x57, 0x41],
  Tracks: [0x16, 0x54, 0xae, 0x6b],
  TrackEntry: [0xae],
  TrackNumber: [0xd7],
  TrackUID: [0x73, 0xc5],
  TrackType: [0x83],
  FlagLacing: [0x9c],
  DefaultDuration: [0x23, 0xe3, 0x83],
  CodecID: [0x86],
  Video: [0xe0],
  PixelWidth: [0xb0],
  PixelHeight: [0xba],
  Cues: [0x1c, 0x53, 0xbb, 0x6b],
  CuePoint: [0xbb],
  CueTime: [0xb3],
  CueTrackPositions: [0xb7],
  CueTrack: [0xf7],
  CueClusterPosition: [0xf1],
  Cluster: [0x1f, 0x43, 0xb6, 0x75],
  Timecode: [0xe7],
  SimpleBlock: [0xa3]
};

function size(n) {
  // smallest EBML variable-length size that fits n (all-ones values are reserved)
  for (let len = 1; len <= 8; len++) {
    if (n < 2 ** (7 * len) - 1) {
      const bytes = new Uint8Array(len);
      let v = n;
      for (let i = len - 1; i >= 0; i--) {
        bytes[i] = v & 0xff;
        v = Math.floor(v / 256);
      }
      bytes[0] |= 1 << (8 - len);
      return bytes;
    }
  }
  throw new Error(`EBML size too large: ${n}`);
}

function uint(n, width) {
  const len = width ?? Math.max(1, Math.ceil(Math.log2(n + 1) / 8));
  const bytes = new Uint8Array(len);
  let v = n;
  for (let i = len - 1; i >= 0; i--) {
    bytes[i] = v & 0xff;
    v = Math.floor(v / 256);
  }
  return bytes;
}

function float64(n) {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setFloat64(0, n);
  return bytes;
}

const text = s => new TextEncoder().encode(s);

function concat(parts) {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

const el = (id, ...children) => {
  const body = concat(children.map(c => (c instanceof Uint8Array ? c : Uint8Array.from(c))));
  return concat([Uint8Array.from(id), size(body.length), body]);
};

/**
 * @param {{ width: number, height: number, fps: number, codecId?: string,
 *   chunks: { key: boolean, timestamp: number, data: Uint8Array }[] }} options
 *   Chunk timestamps are in microseconds, as WebCodecs reports them.
 * @returns {Uint8Array} the complete .webm file
 */
export function muxWebM({ width, height, fps, chunks, codecId = 'V_VP9' }) {
  if (!chunks.length || !chunks[0].key) throw new Error('The first encoded chunk must be a keyframe.');
  const ms = t => Math.round(t / 1000);
  const frameMs = 1000 / fps;
  const durationMs = ms(chunks.at(-1).timestamp) + frameMs;

  // one cluster per keyframe; block timecodes are int16 offsets from the cluster timecode
  const clusters = [];
  for (const chunk of chunks) {
    if (chunk.key || !clusters.length) clusters.push({ time: ms(chunk.timestamp), blocks: [] });
    const cluster = clusters.at(-1);
    const rel = ms(chunk.timestamp) - cluster.time;
    if (rel > 32767) throw new Error('Keyframes must be less than 32 seconds apart.');
    const header = new Uint8Array([0x81, (rel >> 8) & 0xff, rel & 0xff, chunk.key ? 0x80 : 0x00]);
    cluster.blocks.push(el(ID.SimpleBlock, header, chunk.data));
  }
  const clusterBytes = clusters.map(c => el(ID.Cluster, el(ID.Timecode, uint(c.time)), ...c.blocks));

  const header = el(
    ID.EBML,
    el(ID.EBMLVersion, uint(1)),
    el(ID.EBMLReadVersion, uint(1)),
    el(ID.EBMLMaxIDLength, uint(4)),
    el(ID.EBMLMaxSizeLength, uint(8)),
    el(ID.DocType, text('webm')),
    el(ID.DocTypeVersion, uint(4)),
    el(ID.DocTypeReadVersion, uint(2))
  );
  const info = el(
    ID.Info,
    el(ID.TimecodeScale, uint(1_000_000)),
    el(ID.Duration, float64(durationMs)),
    el(ID.MuxingApp, text('summarize-video-releases')),
    el(ID.WritingApp, text('summarize-video-releases'))
  );
  const tracks = el(
    ID.Tracks,
    el(
      ID.TrackEntry,
      el(ID.TrackNumber, uint(1)),
      el(ID.TrackUID, uint(1)),
      el(ID.TrackType, uint(1)),
      el(ID.FlagLacing, uint(0)),
      el(ID.DefaultDuration, uint(Math.round(1e9 / fps))),
      el(ID.CodecID, text(codecId)),
      el(ID.Video, el(ID.PixelWidth, uint(width)), el(ID.PixelHeight, uint(height)))
    )
  );

  // Cue positions are fixed-width, so the Cues size is known before the positions are.
  const cues = positions =>
    el(
      ID.Cues,
      ...clusters.map((c, i) =>
        el(
          ID.CuePoint,
          el(ID.CueTime, uint(c.time)),
          el(ID.CueTrackPositions, el(ID.CueTrack, uint(1)), el(ID.CueClusterPosition, uint(positions[i], 8)))
        )
      )
    );
  const cuesSize = cues(clusters.map(() => 0)).length;
  let offset = info.length + tracks.length + cuesSize; // relative to the Segment body
  const positions = clusterBytes.map(bytes => {
    const at = offset;
    offset += bytes.length;
    return at;
  });

  return concat([header, el(ID.Segment, info, tracks, cues(positions), ...clusterBytes)]);
}
