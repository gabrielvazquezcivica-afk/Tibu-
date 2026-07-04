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

        const cmd = isVideo
            ? `ffmpeg -i "${input}" -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba" -loop 0 -an -y "${output}"`
            : `ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba" -y "${output}"`

        exec(cmd, (err, stdout, stderr) => {
            try {
                if (err) {
                    console.log('FFMPEG ERROR:', stderr)

                    if (fs.existsSync(input)) {
                        fs.unlinkSync(input)
                    }

                    return reject(err)
                }

                if (!fs.existsSync(output)) {
                    if (fs.existsSync(input)) {
                        fs.unlinkSync(input)
                    }

                    return reject(
                        new Error('No se generó el sticker webp')
                    )
                }

                const sticker = fs.readFileSync(output)

                if (fs.existsSync(input)) {
                    fs.unlinkSync(input)
                }

                if (fs.existsSync(output)) {
                    fs.unlinkSync(output)
                }

                resolve(sticker)
            } catch (e) {
                reject(e)
            }
        })
    })
}