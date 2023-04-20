//═══════════════════════════════════════════════════════//
//
//                              𝙶𝙾𝙹𝙾-𝚂𝙰𝚃𝙾𝚁𝚄 𝓫𝔂 𝓷𝓮𝔁𝓾𝓼𝓝𝔀
//𝙰𝙳𝙾𝙿𝚃𝙴𝙳 𝙵𝚁𝙾𝙼  𝚂𝙲𝚁𝙸𝙿𝚃 𝙾𝙵 𝙲𝙷𝙴𝙴𝙼𝚂𝙱𝙾𝚃 𝚅2 𝙱𝚈 𝙳𝙶𝚇𝚎𝚘𝚗 
//
//════════════════════════════//

require('./settings')
//const { default: NexusNwIncConnect,useMultiFileAuthState, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("baileys")
const { default: NexusNwIncConnect, Browsers, useMultiFileAuthState, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, makeCacheableSignalKeyStore, MessageRetryMap, isJidBroadcast, delay } = require("@adiwajshing/baileys")
//const { state, saveState } = useSingleFileAuthState(`./${sessionName}.json`)
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const yargs = require('yargs/yargs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunc')
const logger = pino({ level: 'silent' })
const logger2 = pino({ level: 'trace' })
const express = require("express");
const app = express();
const cron = require('node-cron')

var low
try {
    low = require('lowdb')
} catch (e) {
    //console.log(`low db error:${e}`)
    low = require('./lib/lowdb')
}

const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

//const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const store = makeInMemoryStore({ logger2 })
// can be read from a file
try {
    store.readFromFile('./database/baileys_store.json')
} catch (error) {
    console.log(`Problem with Store🥲\ndeleting Store...`)
    try {
        // clearInterval(kusave)
        fs.unlinkSync('./database/baileys_store.json');
        console.log("File removed 🚮🚮");
    } catch (err) {
        console.error(err)
        console.log(`Store Corrupted`)
    }
}
console.log(`Store Created😁😁`)

// saves the state to a file every 10s
const kusave = setInterval(() => {
    store.writeToFile('./database/baileys_store.json')
}, 10 * 1000)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

/*
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
  new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
  new mongoDB(opts['db']) :
      new JSONFile(`database/database.json`))
*/
global.db = new Low(new JSONFile(`./database/database.json`))

db.read()

global.db.data ||= {
    users: {},
    chats: {},
    database: {},
    game: {},
    settings: {},
    others: {},
    sticker: {},
    ...(global.db.data || {})
}



// save database every 30seconds
if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
}, 30 * 1000)

const msgRetryCounterMap = MessageRetryMap || {}

async function dennoh() {

    let { state, saveCreds, saveState } = await useMultiFileAuthState('./sessions')
    //saveState = (typeof saveState === 'undefined') ? saveCreds : saveState
    async function startGojoMdNx() {

        const { version, isLatest } = await fetchLatestBaileysVersion()
        console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
        const Ningoje = NexusNwIncConnect({
            version: version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            browser: ['れ工れム口Ｊモ', 'Chrome', '1.0.0'],
            //browser: Browsers.macOS('Desktop'),
            // browser: Browsers.appropriate('Desktop'),
            auth: {
                creds: state.creds,
                /** caching makes the store faster to send/recv messages */
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            // syncFullHistory: true,
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(
                    message.buttonsMessage ||
                    message.templateMessage ||
                    message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }

                return message;
            },
            msgRetryCounterMap,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            shouldIgnoreJid: jid => isJidBroadcast(jid),
            getMessage: async key => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id)
                    return msg?.message || undefined
                }

                // only if store is present
                return {
                    conversation: 'Retext!'
                }
            }
        })

        store.bind(Ningoje.ev)

        // anticall auto block
        Ningoje.ws.on('CB:call', async (json) => {
            const callerId = json.content[0].attrs['call-creator']
            if (json.content[0].tag == 'offer') {
                let pa7rick = await Ningoje.sendContact(callerId, global.owner)
                Ningoje.sendMessage(callerId, { text: `Automatic Block!\nDon't Call Bot!\n Ask Or Contact The Owner To Unblock You!` }, { quoted: pa7rick })
                await sleep(8000)
                if (callerId == (global.owner + '@s.whatsapp.net')) return
                await Ningoje.updateBlockStatus(callerId, "block")
            }
        })

        Ningoje.ev.on('messages.upsert', async chatUpdate => {

            try {
                //chatUpdate.type!=='notify'?console.log(`RECEIVED ${chatUpdate.messages.length} while offline`):""
                for (let meso of chatUpdate.messages) {
                    mek = meso
                    if (mek.message) {
                        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
                        if (mek.key && mek.key.remoteJid === 'status@broadcast') continue
                        if (!Ningoje.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
                        // if (!Ningoje.public && !mek.key.fromMe) continue
                        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) continue
                        //console.log(chatUpdate)
                        m = smsg(Ningoje, mek, store)
                        require("./Ningoje.js")(Ningoje, m, chatUpdate, store)

                        await delay(2000)
                    }
                }
            } catch (err) {
                console.log(err)
            }
        })

        // Group Update
        Ningoje.ev.on('groups.update', async pea => {
            //console.log(pea)
            // Get Profile Picture Group
            if (!db.data.chats[pea[0].id]) return
            if (db.data.chats[pea[0].id].welcom) {
                try {
                    ppgc = await Ningoje.profilePictureUrl(pea[0].id, 'image')
                } catch {
                    ppgc = 'https://shortlink.GojoMdNxarridho.my.id/rg1oT'
                }
                let wm_fatih = { url: ppgc }
                if (pea[0].announce == true) {
                    Ningoje.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nThe Group Has Been Closed By Admin, Now Only Admin Can Send Messages !`, `Group Settings Change Message`, wm_fatih, [])
                } else if (pea[0].announce == false) {
                    Ningoje.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nThe Group Has Been Opened By Admin, Now Participants Can Send Messages !`, `Group Settings Change Message`, wm_fatih, [])
                } else if (pea[0].restrict == true) {
                    Ningoje.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nGroup Info Has Been Restricted, Now Only Admin Can Edit Group Info !`, `Group Settings Change Message`, wm_fatih, [])
                } else if (pea[0].restrict == false) {
                    Ningoje.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nGroup Info Has Been Opened, Now Participants Can Edit Group Info !`, `Group Settings Change Message`, wm_fatih, [])
                } else {
                    Ningoje.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nGroup Subject Has Been Changed To *${pea[0].subject}*`, `Group Settings Change Message`, wm_fatih, [])
                }
            }
        })

        Ningoje.ev.on('group-participants.update', async (anu) => {
            if (!db.data.chats[anu.id]) return
            if (db.data.chats[anu.id].welcom) {
                console.log(anu)
                try {
                    let metadata = await Ningoje.groupMetadata(anu.id)
                    let participants = anu.participants
                    for (let num of participants) {
                        // Get Profile Picture User
                        try {
                            ppuser = await Ningoje.profilePictureUrl(num, 'image')
                        } catch {
                            ppuser = 'https://telegra.ph/file/1fc707c4daaf2b919c4c7.png'
                        }
                        //Get Profile Picture Group\\
                        try {
                            ppgroup = await Ningoje.profilePictureUrl(anu.id, 'image')
                        } catch {
                            ppgroup = 'https://telegra.ph/file/1fc707c4daaf2b919c4c7.png'
                        }

                        //welcome\\
                        let nama = await Ningoje.getName(num)
                        memb = metadata.participants.length

                        // Kon = await getBuffer(encodeURI(`https://api.akuari.my.id/canvas/welcome?name=${nama}&gcname=${metadata.subject}&ppgc=${ppgroup}&member=${memb}&pp=${ppuser}&bg=https://i.ibb.co/tYgwwT2/images-2.jpg`))
                        /* let Kon = null
                         try {
                             Kon = [`https://api.dhamzxploit.my.id/api/canvas/welcome2?name=${nama}&mem=${memb}&gcname=${metadata.subject}&picurl=${ppgroup}&bgurl=https://img.freepik.com/free-photo/old-black-background-grunge-texture-dark-wallpaper-blackboard-chalkboard-room-wall_1258-28313.jpg?size=626&ext=jpg`,
                             `https://malesin.xyz/welcome2?username=${nama}&groupname=${metadata.subject}&membercount=${memb}&profile=${ppuser}&background=${ppgroup}`]
                             Kon = await getBuffer(encodeURI(Kon[Math.floor(Math.random() * Kon.length)]))
                         } catch (err) {
                             Kon = null
                         }*/
                        //Tol = await getBuffer(`https://hardianto.xyz/api/goodbye3?profile=${encodeURIComponent(ppuser)}&name=${encodeURIComponent(nama)}&bg=https://telegra.ph/file/8bbe8a7de5c351dfcb077.jpg&namegb=${encodeURIComponent(metadata.subject)}&member=${encodeURIComponent(memb)}`)

                        let actions = anu.action
                        console.log(`Group update event:${actions}\n©NingojePaleHivi`)
                        if (anu.action === 'add') {
                            await Ningoje.sendMessage(anu.id, {
                                image: { url: 'https://telegra.ph/file/248c6a82eeb92c21d594d.png' }, contextInfo: { mentionedJid: [num] }, caption: `
┃╔	   
┃╠ Hi👋 *@${num.split("@")[0]}*,		
┃╠ Welcome To *${metadata.subject.trim()}*
┃╠ Welcome mate! The members of the group are also like family,
┃╠ So you have become a part of our family which we very happy and,
┃╠ we welcome you to our group.
┃╠
 *Group Description:* 
 ${metadata.desc}
┃╠══════════╣
┃╠ *Total participants:${memb}* 
┃╚══════════╝

`})


                        } else if (anu.action === 'remove') {
                            await Ningoje.sendMessage(anu.id, {
                                image: { url: 'https://telegra.ph/file/93425f128c093cc65ef02.png' }, contextInfo: { mentionedJid: [num] }, caption: `
⚠️Ii kienyeji 👉👉 *@${num.split("@")[0]}* ImeLeft *${metadata.subject.trim()}*


Anyway akuna  ubaya arimbitif😂😂👊.
┃╔══════════╗
┃╠ *Total participants:${memb}*
┃╚══════════╝
` })
                        } else if (anu.action === 'demote') {
                            await Ningoje.sendMessage(anu.id, {
                                image: { url: 'https://telegra.ph/file/93425f128c093cc65ef02.png' }, contextInfo: { mentionedJid: [num] }, caption: `
*ALERT! ALERT*

Someone has been demoted from being an admin of this group! 😂😂😂

*@${num.split("@")[0]}* Sijasema ni wewe umekuwa demoted😂😂😂😂


` })
                        } else if (anu.action === 'promote') {
                            await Ningoje.sendMessage(anu.id, {
                                image: { url: 'https://telegra.ph/file/2623765469802bf7fa019.jpg' }, contextInfo: { mentionedJid: [num] }, caption: `
Congratulations 🎊 *@${num.split("@")[0]}*

You are now an admin!

` })

                        }
                        await delay(2000)
                    }
                } catch (err) {
                    console.log(err)
                }
            }
        })

        //Setting\\
        /*
                Ningoje.ev.on('messaging-history.set', async ({ chatsi }) => {
        
                    const { chats, contacts, messages, isLatest } = chatsi
                    console.log(`recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`)
        
                })
                */
        Ningoje.decodeJid = (jid) => {
            if (!jid) return jid
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {}
                return decode.user && decode.server && decode.user + '@' + decode.server || jid
            } else return jid
        }

        Ningoje.ev.on('contacts.update', update => {
            for (let contact of update) {
                let id = Ningoje.decodeJid(contact.id)
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
            }
        })

        Ningoje.getName = (jid, withoutContact = false) => {
            id = Ningoje.decodeJid(jid)
            withoutContact = Ningoje.withoutContact || withoutContact
            let v
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
                v = store.contacts[id] || {}
                if (!(v.name || v.subject)) v = Ningoje.groupMetadata(id) || {}
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
            })
            else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === Ningoje.decodeJid(Ningoje.user.id) ?
                Ningoje.user :
                (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        }

        Ningoje.sendContact = async (jid, kon, quoted = '', opts = {}) => {
            let list = []
            for (let i of kon) {
                list.push({
                    displayName: await Ningoje.getName(i + '@s.whatsapp.net'),
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${ownername}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click To Chat\nitem2.EMAIL;type=INTERNET:${sc}\nitem2.X-ABLabel:Script\nitem3.URL:${waGroup}\nitem3.X-ABLabel:Script\nitem4.ADR:;;${region};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
                })
            }
            Ningoje.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
        }

        Ningoje.setStatus = (status) => {
            Ningoje.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'status',
                },
                content: [{
                    tag: 'status',
                    attrs: {},
                    content: Buffer.from(status, 'utf-8')
                }]
            })
            return status
        }

        Ningoje.public = true

        Ningoje.serializeM = (m) => smsg(Ningoje, m, store)
        //setstutus

        Ningoje.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update
            switch (connection) {
                case 'close':
                    console.log(`Disconnected...🍎🍎`, update)
                    {
                        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                        //if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); Ningoje.logout(); }
                        if (reason === DisconnectReason.connectionClosed) { console.log("🐦Connection closed, reconnecting...."); startGojoMdNx(); }
                        else if (reason === DisconnectReason.connectionLost) { console.log("🐦Connection Lost from Server, reconnecting..."); startGojoMdNx(); }
                        else if (reason === DisconnectReason.connectionReplaced) { console.log("🐦Connection Replaced, Another New Session Opened, Please Close Current Session First"); Ningoje.logout(); }
                        else if (reason === DisconnectReason.loggedOut) { console.log(`🐦Device Logged Out, Please Scan Again And Run.`); Ningoje.logout(); }
                        else if (reason === DisconnectReason.restartRequired) { console.log("🐦Restart Required, Restarting..."); startGojoMdNx(); }
                        else if (reason === DisconnectReason.timedOut) { console.log("🐦Connection TimedOut, Reconnecting..."); startGojoMdNx(); }
                        else if (reason === DisconnectReason.PreconditionRequired) { console.log("🐦Precondition Required, Reconnecting..."); startGojoMdNx(); }
                        else if ((reason !== DisconnectReason.loggedOut)) { console.log(`Disconected due to ${reason} \nRestarting`); startGojoMdNx(); }
                        //else Ningoje.end(`🐦Unknown DisconnectReason: ${reason}|${connection}`)

                    }
                    break;
                case 'connecting': {
                    console.log(`Connecting...🟡🟡`, update)
                }
                case 'open': {
                    console.log(`Connected 🟢🟢`, update)
                    //await Ningoje.sendPresenceUpdate("available")
                }
            }

            //console.log('Connected...', update)
        })

        Ningoje.ev.on('creds.update', saveCreds)

        //reset limit every 12 hours\\
        if (global.db.data) {
            let botNumber = await Ningoje.decodeJid(await Ningoje.user.id)
            let limitUser = null
            let isPremium = false
            let isCreator = false

            // let cron = require('node-cron')
            cron.schedule('00 12,00 * * *', () => {
                let user = Object.keys(global.db.data.users)
                //let limitUser = isPremium ? global.limitawal.premium : global.limitawal.free
                for (let jid of user) {
                    isCreator = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(jid)
                    isPremium = isCreator || global.premium.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(jid) || false
                    limitUser = isPremium ? global.limitawal.premium : global.limitawal.free
                    // if (jid === (botNumber) || jid === (global.owner + '@s.whatsapp.net')) continue
                    global.db.data.users[jid].limit = limitUser
                }
                console.log('Limit Reseted')
                let annou = `
╭✦ *BOT ANNOUNCEMENTS📢 📢*
┇・⎯⎯・⎯⎯・⎯⎯・⎯⎯・   
┇  
┇  _Users(${user.length}) limit reseted_
┇    
┇   ✧✧✧✧✧✧✧✧
┇
┇ \`\`\`${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}\`\`\`
╰ ✦   
                `
                Ningoje.sendMessage(global.waJid, { text: annou })
            }, {
                scheduled: true,
                timezone: "Africa/Nairobi"
            })
        }
        //Greetings good mornings

        cron.schedule('0 6 * * *', () => {
            let wakati = new Date()
            let time = wakati.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })
            let day = wakati.toLocaleString('en-US', { timeZone: 'Africa/Nairobi', weekday: 'long' })
            let quotes = {
                Monday: "Rise and shine, it's Monday! Time to caffeinate and conquer the day!"
                ,
                Tuesday: "Tiries Tuesday 😁. \n Let's conquer the day anyway!"
                ,
                Wednesday: "Happy Hump Day! Let's hope the rest of the week goes by as fast as a dog chasing its tail!"
                ,
                Thursday: "the day where you're so close to Friday, yet so far away. But hey, at least we have each other!\n#TBT"
                ,
                Friday: " Let's do this Friday thing like a boss and celebrate with some mzinga later!"
                ,
                Saturday: "the only morning we don't feel guilty about staying in bed all day. Let's do this!"
                ,
                Sunday: "the day of rest, relaxation, and preparation for Monday. Let's make the most of it!\nna watu waende kanisa tafadhali😂😂"

            }

            let annou = `

_Good Morning friends ❤️❤️♡ˎˊ˗_
Kuwakumbusha tu leo ni *${day}* 😂😂, ${quotes[day]}
  \nI love you guys 😘😘
    `
            Ningoje.sendMessage(global.waJid, { text: annou })
        }, {
            scheduled: true,
            timezone: "Africa/Nairobi"
        });
        //nigth messages

        cron.schedule('0 22 * * *', () => {
            let wakati = new Date()
            let time = wakati.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })
            let day = wakati.toLocaleString('en-US', { timeZone: 'Africa/Nairobi', weekday: 'long' })
            let nightquotes = {
                Monday: "The night may be dark, but let's brighten it up with some laughter and love",
                Tuesday: "May this night be as peaceful as a sleeping baby and as romantic as a full moon.",
                Wednesday: "As the night falls, let's forget our worries and embrace the magic of the stars.",
                Thursday: "Let's make this night unforgettable with sweet dreams and sweet love.",
                Friday: "It's time to relax, unwind and enjoy the magic of the night. Let's make it a memorable one.",
                Saturday: "Tonight, let's make memories that we'll cherish forever. Let's fill the night with love and laughter.",
                Sunday: "As the week comes to an end, let's spend the night surrounded by love, happiness and good company."
            }
            let annou = `
 _Good night pals❤️❤️♡ˎˊ˗_
${nightquotes[day]}
\nI love you guys 😘😘

\`\`\`${time}\`\`\`
`
            Ningoje.sendMessage(global.waJid, { text: annou })
        }, {
            scheduled: true,
            timezone: "Africa/Nairobi"
        });
        // Add Other
        /** Send Button 5 Image
         *
         * @param {*} jid
         * @param {*} text
         * @param {*} footer
         * @param {*} image
         * @param [*] button
         * @param {*} options
         * @returns
         */
        Ningoje.send5ButImg = async (jid, text = '', footer = '', img, but = [], options = {}) => {
            let message = await prepareWAMessageMedia({ image: img }, { upload: Ningoje.waUploadToServer })
            var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
                templateMessage: {
                    hydratedTemplate: {
                        imageMessage: message.imageMessage,
                        "hydratedContentText": text,
                        "hydratedFooterText": footer,
                        "hydratedButtons": but
                    }
                }
            }), options)
            Ningoje.relayMessage(jid, template.message, { messageId: template.key.id })
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} buttons 
         * @param {*} caption 
         * @param {*} footer 
         * @param {*} quoted 
         * @param {*} options 
         */
        Ningoje.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
            let buttonMessage = {
                text,
                footer,
                buttons,
                headerType: 2,
                ...options
            }
            Ningoje.sendMessage(jid, buttonMessage, { quoted, ...options })
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} text 
         * @param {*} quoted 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendText = (jid, text, quoted = '', options) => Ningoje.sendMessage(jid, { text: text, ...options }, { quoted })

        /**
         * 
         * @param {*} jid 
         * @param {*} path 
         * @param {*} caption 
         * @param {*} quoted 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendImage = async (jid, path, caption = '', quoted = '', options) => {
            let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
            return await Ningoje.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} path 
         * @param {*} caption 
         * @param {*} quoted 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
            let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
            return await Ningoje.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} path 
         * @param {*} quoted 
         * @param {*} mime 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
            let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
            return await Ningoje.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} text 
         * @param {*} quoted 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendTextWithMentions = async (jid, text, quoted, options = {}) => Ningoje.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

        /**
         * 
         * @param {*} jid 
         * @param {*} path 
         * @param {*} quoted 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
            let buffer
            if (options && (options.packname || options.author)) {
                buffer = await writeExifImg(buff, options)
            } else {
                buffer = await imageToWebp(buff)
            }

            await Ningoje.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
            return buffer
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} path 
         * @param {*} quoted 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
            let buffer
            if (options && (options.packname || options.author)) {
                buffer = await writeExifVid(buff, options)
            } else {
                buffer = await videoToWebp(buff)
            }

            await Ningoje.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
            return buffer
        }

        /**
         * 
         * @param {*} message 
         * @param {*} filename 
         * @param {*} attachExtension 
         * @returns 
         */
        Ningoje.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
            let quoted = message.msg ? message.msg : message
            let mime = (message.msg || message).mimetype || ''
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
            const stream = await downloadContentFromMessage(quoted, messageType)
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            let type = await FileType.fromBuffer(buffer)
            trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
            // save to file
            await fs.writeFileSync(trueFileName, buffer)
            return trueFileName
        }

        Ningoje.downloadMediaMessage = async (message) => {
            let mime = (message.msg || message).mimetype || ''
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
            const stream = await downloadContentFromMessage(message, messageType)
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            return buffer
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} path 
         * @param {*} filename
         * @param {*} caption
         * @param {*} quoted 
         * @param {*} options 
         * @returns 
         */
        Ningoje.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
            let types = await Ningoje.getFile(path, true)
            let { mime, ext, res, data, filename } = types
            if (res && res.status !== 200 || file.length <= 65536) {
                try { throw { json: JSON.parse(file.toString()) } }
                catch (e) { if (e.json) throw e.json }
            }
            let type = '', mimetype = mime, pathFile = filename
            if (options.asDocument) type = 'document'
            if (options.asSticker || /webp/.test(mime)) {
                let { writeExif } = require('./lib/exif')
                let media = { mimetype: mime, data }
                pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
                await fs.promises.unlink(filename)
                type = 'sticker'
                mimetype = 'image/webp'
            }
            else if (/image/.test(mime)) type = 'image'
            else if (/video/.test(mime)) type = 'video'
            else if (/audio/.test(mime)) type = 'audio'
            else type = 'document'
            await Ningoje.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
            return fs.promises.unlink(pathFile)
        }

        /**
         * 
         * @param {*} jid 
         * @param {*} message 
         * @param {*} forceForward 
         * @param {*} options 
         * @returns 
         */
        Ningoje.copyNForward = async (jid, message, forceForward = false, options = {}) => {
            let vtype
            if (options.readViewOnce) {
                message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
                vtype = Object.keys(message.message.viewOnceMessage.message)[0]
                delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
                delete message.message.viewOnceMessage.message[vtype].viewOnce
                message.message = {
                    ...message.message.viewOnceMessage.message
                }
            }

            let mtype = Object.keys(message.message)[0]
            let content = await generateForwardMessageContent(message, forceForward)
            let ctype = Object.keys(content)[0]
            let context = {}
            if (mtype != "conversation") context = message.message[mtype].contextInfo
            content[ctype].contextInfo = {
                ...context,
                ...content[ctype].contextInfo
            }
            const waMessage = await generateWAMessageFromContent(jid, content, options ? {
                ...content[ctype],
                ...options,
                ...(options.contextInfo ? {
                    contextInfo: {
                        ...content[ctype].contextInfo,
                        ...options.contextInfo
                    }
                } : {})
            } : {})
            await Ningoje.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
            return waMessage
        }

        Ningoje.cMod = (jid, copy, text = '', sender = Ningoje.user.id, options = {}) => {
            //let copy = message.toJSON()
            let mtype = Object.keys(copy.message)[0]
            let isEphemeral = mtype === 'ephemeralMessage'
            if (isEphemeral) {
                mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
            }
            let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
            let content = msg[mtype]
            if (typeof content === 'string') msg[mtype] = text || content
            else if (content.caption) content.caption = text || content.caption
            else if (content.text) content.text = text || content.text
            if (typeof content !== 'string') msg[mtype] = {
                ...content,
                ...options
            }
            if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
            else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
            if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
            else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
            copy.key.remoteJid = jid
            copy.key.fromMe = sender === Ningoje.user.id

            return proto.WebMessageInfo.fromObject(copy)
        }


        /**
         * 
         * @param {*} path 
         * @returns 
         */
        Ningoje.getFile = async (PATH, save) => {
            let res
            let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
            //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
            let type = await FileType.fromBuffer(data) || {
                mime: 'application/octet-stream',
                ext: '.bin'
            }
            filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
            if (data && save) fs.promises.writeFile(filename, data)
            return {
                res,
                filename,
                size: await getSizeMedia(data),
                ...type,
                data
            }

        }

        return Ningoje
    }

    startGojoMdNx()
}
dennoh()
const html = `
 <!DOCTYPE html>
 <html>
   <head>
     <title>NINGOJE</title>
     <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
     <script>
       setTimeout(() => {
         confetti({
           particleCount: 100,
           spread: 70,
           origin: { y: 0.6 },
           disableForReducedMotion: true
         });
       }, 500);
     </script>
     <style>
       @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
       @font-face {
         font-family: "neo-sans";
         src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
         font-style: normal;
         font-weight: 700;
       }
       html {
         font-family: neo-sans;
         font-weight: 700;
         font-size: calc(62rem / 16);
       }
       body {
         background: white;
       }
       section {
         border-radius: 1em;
         padding: 1em;
         position: absolute;
         top: 50%;
         left: 50%;
         margin-right: -50%;
         transform: translate(-50%, -50%);
       }
     </style>
   </head>
   <body>
     <section>
       BOT ALIVE🟢🟢😁
    
       <br>
       Made by Ningoje <br>
       Deployed by : ${global.ownername}
     </section>
   </body>
 </html>
 `

app.get("/", (req, res) => res.type('html').send(html));
app.listen(8000, () => console.log(`Server listening on port http://localhost:8000}!`));
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})