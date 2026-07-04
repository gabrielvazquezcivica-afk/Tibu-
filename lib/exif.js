import fs from 'fs'
import os from 'os'
import path from 'path'
import webp from 'node-webpmux'

export async function writeExif(buffer, packname, author) {
    const img = new webp.Image()

    const input = path.join(os.tmpdir(), `exif-in-${Date.now()}.webp`)
    const output = path.join(os.tmpdir(), `exif-out-${Date.now()}.webp`)

    fs.writeFileSync(input, buffer)

    await img.load(input)

    const json = {
        'sticker-pack-id': 'com.tibu.bot',
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        emojis: ['🦈']
    }

    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00,
        0x41, 0x57,
        0x07, 0x00
    ])

    const len = Buffer.alloc(4)
    len.writeUInt32LE(jsonBuff.length, 0)

    img.exif = Buffer.concat([
        exifAttr,
        len,
        jsonBuff
    ])

    await img.save(output)

    const result = fs.readFileSync(output)

    fs.unlinkSync(input)
    fs.unlinkSync(output)

    return result
}