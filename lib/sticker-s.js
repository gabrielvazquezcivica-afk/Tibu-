import fs from 'fs'
import os from 'os'
import path from 'path'
import { exec } from 'child_process'

export function toSticker(buffer, isVideo = false) {
    return new Promise((resolve, reject) => {
        const tmp = os.tmpdir()

        const input = path.join(
            tmp,
            `input-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`
        )

        const output = path.join(
            tmp,
            `output-${Date.now()}.webp`
        )

        fs.writeFileSync(input, buffer)

        const command = isVideo
            ? `ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0" -loop 0 -ss 0 -t 15 -preset default -an -vsync 0 "${output}" -y`
            : `ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0" "${output}" -y`

        exec(command, err => {
            try {
                if (err) {
                    if (fs.existsSync(input)) fs.unlinkSync(input)
                    return reject(err)
                }

                const sticker = fs.readFileSync(output)

                if (fs.existsSync(input)) fs.unlinkSync(input)
                if (fs.existsSync(output)) fs.unlinkSync(output)

                resolve(sticker)
            } catch (e) {
                reject(e)
            }
        })
    })
}