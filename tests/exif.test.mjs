import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExif } from '../scripts/lib/exif.mjs';

test('parseExif 兼容空输入与非标准头部', () => {
    assert.equal(parseExif(null), null);
    assert.equal(parseExif(Buffer.from([])), null);
    assert.equal(parseExif(Buffer.from('NotAnExifBuffer')), null);
});

test('parseExif 正常解析 Big-Endian (Motorola) EXIF 标签', () => {
    // 构造有效 TIFF 结构: Exif\0\0 + MM\0* + ifd0Offset=8 + 2 tags (Make, Model)
    const buf = Buffer.alloc(120);
    buf.write('Exif\0\0', 0, 6, 'ascii');
    const off = 6;
    buf.write('MM', off, 2, 'ascii');
    buf.writeUInt16BE(0x002a, off + 2);
    buf.writeUInt32BE(0x00000008, off + 4);

    // IFD0: 2 tags
    buf.writeUInt16BE(2, off + 8);
    // Tag 1: Make (0x010f), ASCII (2), count 6, offset 40
    let cur = off + 10;
    buf.writeUInt16BE(0x010f, cur);
    buf.writeUInt16BE(2, cur + 2);
    buf.writeUInt32BE(6, cur + 4);
    buf.writeUInt32BE(40, cur + 8);

    // Tag 2: Model (0x0110), ASCII (2), count 16, offset 50
    cur += 12;
    buf.writeUInt16BE(0x0110, cur);
    buf.writeUInt16BE(2, cur + 2);
    buf.writeUInt32BE(16, cur + 4);
    buf.writeUInt32BE(50, cur + 8);

    // Write strings
    buf.write('Apple\0', off + 40, 6, 'utf8');
    buf.write('iPhone 15 Pro\0', off + 50, 16, 'utf8');

    const result = parseExif(buf);
    assert.ok(result);
    assert.equal(result.camera, 'Apple iPhone 15 Pro');
});

test('parseExif 正常解析曝光参数（光圈、快门、ISO、焦距）', () => {
    const buf = Buffer.alloc(180);
    buf.write('Exif\0\0', 0, 6, 'ascii');
    const off = 6;
    buf.write('II', off, 2, 'ascii');
    buf.writeUInt16LE(0x002a, off + 2);
    buf.writeUInt32LE(0x00000008, off + 4);

    // IFD0: 1 tag (ExifIFDPointer -> offset 30)
    buf.writeUInt16LE(1, off + 8);
    buf.writeUInt16LE(0x8769, off + 10);
    buf.writeUInt16LE(4, off + 12);
    buf.writeUInt32LE(1, off + 14);
    buf.writeUInt32LE(30, off + 18);

    // Exif IFD at offset 30: 4 tags (ExposureTime, FNumber, ISO, FocalLength)
    const exifPos = off + 30;
    buf.writeUInt16LE(4, exifPos);

    // 1. ExposureTime: 0x829a, RATIONAL (5), count 1, offset 90 -> 1/125s
    let cur = exifPos + 2;
    buf.writeUInt16LE(0x829a, cur);
    buf.writeUInt16LE(5, cur + 2);
    buf.writeUInt32LE(1, cur + 4);
    buf.writeUInt32LE(90, cur + 8);
    buf.writeUInt32LE(1, off + 90);
    buf.writeUInt32LE(125, off + 94);

    // 2. FNumber: 0x829d, RATIONAL (5), count 1, offset 100 -> 18/10 (f/1.8)
    cur += 12;
    buf.writeUInt16LE(0x829d, cur);
    buf.writeUInt16LE(5, cur + 2);
    buf.writeUInt32LE(1, cur + 4);
    buf.writeUInt32LE(100, cur + 8);
    buf.writeUInt32LE(18, off + 100);
    buf.writeUInt32LE(10, off + 104);

    // 3. ISO: 0x8827, SHORT (3), count 1, value 100
    cur += 12;
    buf.writeUInt16LE(0x8827, cur);
    buf.writeUInt16LE(3, cur + 2);
    buf.writeUInt32LE(1, cur + 4);
    buf.writeUInt16LE(100, cur + 8);

    // 4. FocalLength: 0x920a, RATIONAL (5), count 1, offset 110 -> 24/1 (24mm)
    cur += 12;
    buf.writeUInt16LE(0x920a, cur);
    buf.writeUInt16LE(5, cur + 2);
    buf.writeUInt32LE(1, cur + 4);
    buf.writeUInt32LE(110, cur + 8);
    buf.writeUInt32LE(24, off + 110);
    buf.writeUInt32LE(1, off + 114);

    const result = parseExif(buf);
    assert.ok(result);
    assert.equal(result.shutter, '1/125s');
    assert.equal(result.aperture, 'f/1.8');
    assert.equal(result.iso, 'ISO 100');
    assert.equal(result.focalLength, '24mm');
});
