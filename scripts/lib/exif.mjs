// scripts/lib/exif.mjs
// 轻量无外部依赖的 EXIF 读取与格式化工具

function readString(buf, offset, length) {
    return buf.slice(offset, offset + length).toString('utf8').replace(/\0+$/, '').trim();
}

function formatShutter(t) {
    if (!t || typeof t !== 'number' || isNaN(t)) return null;
    if (t < 0.8) {
        const denom = Math.round(1 / t);
        return `1/${denom}s`;
    }
    return `${Math.round(t * 10) / 10}s`;
}

/**
 * 解析 EXIF 二进制 Buffer，提取相机、镜头与曝光参数
 */
export function parseExif(buf) {
    if (!buf || !Buffer.isBuffer(buf) || buf.length < 14) return null;
    let offset = 0;
    if (buf.slice(0, 4).toString('ascii') === 'Exif') {
        offset = 6;
    }
    const isLe = buf[offset] === 0x49 && buf[offset + 1] === 0x49; // II (Intel)
    const isBe = buf[offset] === 0x4d && buf[offset + 1] === 0x4d; // MM (Motorola)
    if (!isLe && !isBe) return null;

    const readU16 = (o) => isLe ? buf.readUInt16LE(offset + o) : buf.readUInt16BE(offset + o);
    const readU32 = (o) => isLe ? buf.readUInt32LE(offset + o) : buf.readUInt32BE(offset + o);

    if (readU16(2) !== 0x002a) return null;
    const ifd0Offset = readU32(4);

    const rawTags = {};
    function readIFD(ifdPos) {
        if (ifdPos + 2 > buf.length - offset) return;
        const count = readU16(ifdPos);
        let cur = ifdPos + 2;
        for (let i = 0; i < count; i++) {
            if (cur + 12 > buf.length - offset) break;
            const tag = readU16(cur);
            const type = readU16(cur + 2);
            const num = readU32(cur + 4);
            const valOffset = cur + 8;
            let val = null;

            if (type === 2) { // ASCII
                const strOffset = num <= 4 ? valOffset : readU32(valOffset);
                if (strOffset + num <= buf.length - offset) {
                    val = readString(buf, offset + strOffset, num);
                }
            } else if (type === 3) { // SHORT
                val = readU16(valOffset);
            } else if (type === 4) { // LONG
                val = readU32(valOffset);
            } else if (type === 5) { // RATIONAL
                const ratOffset = readU32(valOffset);
                if (ratOffset + 8 <= buf.length - offset) {
                    const numVal = isLe ? buf.readUInt32LE(offset + ratOffset) : buf.readUInt32BE(offset + ratOffset);
                    const denVal = isLe ? buf.readUInt32LE(offset + ratOffset + 4) : buf.readUInt32BE(offset + ratOffset + 4);
                    val = denVal ? numVal / denVal : 0;
                }
            }
            if (val !== null && val !== undefined && val !== '') rawTags[tag] = val;
            cur += 12;
        }
    }

    readIFD(ifd0Offset);
    if (rawTags[0x8769]) { // ExifIFDPointer
        readIFD(rawTags[0x8769]);
    }

    const make = rawTags[0x010f] || null;
    const model = rawTags[0x0110] || null;
    let camera = null;
    if (make && model) {
        camera = model.toLowerCase().includes(make.toLowerCase()) ? model : `${make} ${model}`;
    } else if (model || make) {
        camera = model || make;
    }

    const lens = rawTags[0xa434] || rawTags[0xa433] || null;
    const fNumber = rawTags[0x829d] ? `f/${Math.round(rawTags[0x829d] * 10) / 10}` : null;
    const exposureTime = rawTags[0x829a] ? formatShutter(rawTags[0x829a]) : null;
    const iso = rawTags[0x8827] ? `ISO ${rawTags[0x8827]}` : null;
    const focalLength = rawTags[0x920a] ? `${Math.round(rawTags[0x920a])}mm` : (rawTags[0xa405] ? `${Math.round(rawTags[0xa405])}mm` : null);
    const dateTaken = rawTags[0x9003] ? String(rawTags[0x9003]).replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3') : null;

    if (!camera && !lens && !fNumber && !exposureTime && !iso && !focalLength) {
        return null;
    }

    return {
        camera: camera || undefined,
        lens: lens || undefined,
        aperture: fNumber || undefined,
        shutter: exposureTime || undefined,
        iso: iso || undefined,
        focalLength: focalLength || undefined,
        dateTaken: dateTaken || undefined
    };
}
