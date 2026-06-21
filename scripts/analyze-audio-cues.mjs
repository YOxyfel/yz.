import fs from 'node:fs'
import path from 'node:path'

const arsenalDir = path.join(process.cwd(), 'public', 'arsenal')

function readWav(filePath) {
  const buf = fs.readFileSync(filePath)
  const sampleRate = buf.readUInt32LE(24)
  const channels = buf.readUInt16LE(22)
  const bitsPerSample = buf.readUInt16LE(34)

  let offset = 12
  let dataOffset = 0
  let dataSize = 0
  while (offset < buf.length - 8) {
    const id = buf.toString('ascii', offset, offset + 4)
    const size = buf.readUInt32LE(offset + 4)
    if (id === 'data') {
      dataOffset = offset + 8
      dataSize = size
      break
    }
    offset += 8 + size
  }

  const bytesPerSample = (bitsPerSample / 8) * channels
  const frameCount = Math.floor(dataSize / bytesPerSample)
  const duration = frameCount / sampleRate

  const samples = new Float32Array(frameCount)
  if (bitsPerSample === 16) {
    for (let i = 0; i < frameCount; i++) {
      const base = dataOffset + i * bytesPerSample
      let sum = 0
      for (let c = 0; c < channels; c++) {
        sum += buf.readInt16LE(base + c * 2) / 32768
      }
      samples[i] = sum / channels
    }
  } else if (bitsPerSample === 24) {
    for (let i = 0; i < frameCount; i++) {
      const base = dataOffset + i * bytesPerSample
      let sum = 0
      for (let c = 0; c < channels; c++) {
        const o = base + c * 3
        let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16)
        if (v & 0x800000) v |= ~0xffffff
        sum += v / 8388608
      }
      samples[i] = sum / channels
    }
  } else {
    throw new Error(`Unsupported bit depth ${bitsPerSample} in ${filePath}`)
  }

  return { sampleRate, duration, samples }
}

function windowRms(samples, sampleRate, windowMs = 50, hopMs = 25) {
  const windowSize = Math.max(1, Math.floor((sampleRate * windowMs) / 1000))
  const hop = Math.max(1, Math.floor((sampleRate * hopMs) / 1000))
  const envelopes = []

  for (let i = 0; i + windowSize < samples.length; i += hop) {
    let sum = 0
    for (let j = 0; j < windowSize; j++) {
      const v = samples[i + j]
      sum += v * v
    }
    envelopes.push({ time: i / sampleRate, rms: Math.sqrt(sum / windowSize) })
  }

  return envelopes
}

function findPeaks(envelopes, { minGap = 0.35, topN = 8 } = {}) {
  const sorted = [...envelopes].sort((a, b) => b.rms - a.rms)
  const peaks = []

  for (const candidate of sorted) {
    if (peaks.some((p) => Math.abs(p.time - candidate.time) < minGap)) continue
    peaks.push(candidate)
    if (peaks.length >= topN) break
  }

  return peaks.sort((a, b) => a.time - b.time)
}

function thresholdCrossings(envelopes, ratio) {
  const max = Math.max(...envelopes.map((e) => e.rms))
  const threshold = max * ratio
  let first = null
  let last = null
  for (const e of envelopes) {
    if (e.rms >= threshold) {
      if (first === null) first = e.time
      last = e.time
    }
  }
  return { first, last, threshold, max }
}

function detectEndCollapse(envelopes, duration) {
  const tailStart = duration * 0.75
  const tail = envelopes.filter((e) => e.time >= tailStart)
  if (tail.length < 4) return { collapseStart: duration * 0.85, collapseEnd: duration }

  let maxRms = 0
  let maxTime = tailStart
  for (const e of tail) {
    if (e.rms > maxRms) {
      maxRms = e.rms
      maxTime = e.time
    }
  }

  const afterPeak = tail.filter((e) => e.time >= maxTime)
  const dropThreshold = maxRms * 0.45
  let collapseStart = maxTime
  for (const e of afterPeak) {
    if (e.rms <= dropThreshold) {
      collapseStart = e.time
      break
    }
  }

  return {
    collapseStart: Number(collapseStart.toFixed(3)),
    collapseEnd: Number(duration.toFixed(3)),
    preCollapsePeak: Number(maxTime.toFixed(3)),
  }
}

function analyze(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext !== '.wav') {
    return { file, skipped: true, reason: 'non-wav (decode manually)' }
  }

  const { duration, samples, sampleRate } = readWav(file)
  const envelopes = windowRms(samples, sampleRate)
  const peaks = findPeaks(envelopes)
  const loud = thresholdCrossings(envelopes, 0.35)
  const sustain = thresholdCrossings(envelopes, 0.15)
  const collapse = detectEndCollapse(envelopes, duration)
  const topPeak = peaks.reduce((a, b) => (b.rms > a.rms ? b : a), peaks[0])

  return {
    file: path.basename(file),
    duration: Number(duration.toFixed(3)),
    sampleRate,
    peaks: peaks.map((p) => ({ time: Number(p.time.toFixed(3)), rms: Number(p.rms.toFixed(4)) })),
    energy: {
      riseStart: sustain.first !== null ? Number(sustain.first.toFixed(3)) : 0,
      loudStart: loud.first !== null ? Number(loud.first.toFixed(3)) : 0,
      loudEnd: loud.last !== null ? Number(loud.last.toFixed(3)) : duration,
      peakTime: topPeak ? Number(topPeak.time.toFixed(3)) : 0,
      mainPeakTime: topPeak ? Number(topPeak.time.toFixed(3)) : 0,
    },
    collapse,
  }
}

const files = fs
  .readdirSync(arsenalDir)
  .filter((f) => /\.(wav|mp3)$/i.test(f))
  .map((f) => path.join(arsenalDir, f))

const results = files.map(analyze)
console.log(JSON.stringify(results, null, 2))
