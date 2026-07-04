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
 ? `ffmpeg -i "${input}" -vcodec libwebp_anim -vf "fps=10,scale=320:320:force_original_aspect_ratio=increase,crop=320:320" -loop 0 -an -vsync 0 -q:v 75 -y "${output}"`
 : `ffmpeg -i "${input}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -preset picture -q:v 50 -y "${output}"`

        exec(cmd, (err, stdout, stderr) => {
            try {
                if (err) {
                    console.log('FFMPEG ERROR:', stderr)

                    if (fs.existsSync(input)) fs.unlinkSync(input)
                    if (fs.existsSync(output)) fs.unlinkSync(output)

                    return reject(err)
                }

                if (!fs.existsSync(output)) {
                    if (fs.existsSync(input)) fs.unlinkSync(input)

                    return reject(
                        new Error('No se generó el sticker')
                    )
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