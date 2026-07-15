export async function sendList(
    sock,
    jid,
    title,
    text,
    footer,
    buttonText,
    sections,
    quoted = null
) {

    try {

        const listSections = sections.map(section => ({
            title: section.title || '',
            rows: (section.rows || []).map(row => ({
                title: row.title || '',
                rowId: row.rowId || row.id || '',
                description: row.description || ''
            }))
        }))

        await sock.sendMessage(
            jid,
            {
                text,
                footer,
                title,
                buttonText,
                sections: listSections
            },
            {
                quoted
            }
        )

    } catch (e) {

        console.log(
            'SENDLIST ERROR:',
            e
        )

        throw e
    }
}