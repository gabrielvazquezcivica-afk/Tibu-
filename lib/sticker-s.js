import fs from 'fs'
import os from 'os'
import path from 'path'
import { Sticker } from 'wa-sticker-formatter'

export async function toSticker(
    buffer,
    isVideo = false,
    packname = 'Tibu Bot',
    author = 'Tibu'
) {
    const ext = isVideo ? 'mp4' : 'jpg'

    const input = path.join(
        os.tmpdir(),
        `sticker-${Date.now()}.${ext}`
    )

    fs.writeFileSync(input, buffer)

    const sticker = new Sticker(input, {
        pack: packname,
        author,
        type: 'full',
        quality: 70
    })

    const result = await sticker.toBuffer()

    fs.unlinkSync(input)

    return result
}