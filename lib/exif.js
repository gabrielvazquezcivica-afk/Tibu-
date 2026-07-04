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
            ? `ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0,fps=15" -loop 0 -an -y "${output}"`
            : `ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0" -y "${output}"`

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(stderr)
                return reject(err)
            }

            if (!fs.existsSync(output)) {
                return reject(new Error('No se generó el webp'))
            }

            const result = fs.readFileSync(output)

            console.log('WEBP PATH:', output)

            fs.existsSync(input) && fs.unlinkSync(input)
            fs.existsSync(output) && fs.unlinkSync(output)

            resolve(result)
        })
    })
}