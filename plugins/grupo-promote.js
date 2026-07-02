let handler = {
  run: async (sock, m, args, { isAdmin, isBotAdmin }) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: '`🌊 Este comando es solo para grupos`' }, { quoted: m })
    }

    if (!await isAdmin(sock, from, sender)) {
      await sock.sendMessage(from, { react: { text: '⛔', key: m.key } })
      return sock.sendMessage(from, { text: '`🦈 Solo administradores pueden usar este comando`' }, { quoted: m })
    }

    if (!await isBotAdmin(sock, from)) {
      await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
      return sock.sendMessage(from, { text: '`❌ Necesito ser administrador para hacer esto`' }, { quoted: m })
    }

    let usuario
    if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      usuario = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      usuario = m.message.extendedTextMessage.contextInfo.participant
    }

    if (!usuario) {
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
      return sock.sendMessage(from, { text: '`❌ Menciona o responde a un usuario`' }, { quoted: m })
    }

    try {
      await sock.groupParticipantsUpdate(from, [usuario], 'promote')
      await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
      await sock.sendMessage(from, {
        text: `\`✅ USUARIO ASCENDIDO\`\n@${usuario.split('@')[0]} ahora es administrador`,
        mentions: [usuario]
      }, { quoted: m })
    } catch (err) {
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
      sock.sendMessage(from, { text: `\`❌ No se pudo ascender:\` ${err.message}` }, { quoted: m })
    }
  },

  command: ['promote', 'daradmin'],
  help: ['promote @usuario']
  tags: ['grupo']
}

export default handler
