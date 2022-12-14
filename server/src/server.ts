import express, { request, response } from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertMinutestoHourString } from './utils/convert-minutes-to-hour-string'

const app = express()
app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
    log:['query']
})

// www.apiincrivel.com/ads
// pormenores de JS e TypeScript ainda confusos


app.get('/games', async (request,response) => {
    const games = await prisma.game.findMany({
        include:{
            _count:{
                select:{
                    ads:true,
                }
            }
        }
    })


    return response.json(games)
});

app.post('/games/:id/ads', async (request,response) => {
    const gameId = request.params.id;
    const body = request.body;

    const ad = await prisma.ad.create({
        data:{
            gameId,
            name:body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekdays: body.weekdays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
            createdAt: body.createdAt
            
        }
    })


    return response.status(201).json(ad)
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    
    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weekdays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where:{
            gameId: gameId
        },
        orderBy:{
            createdAt:'desc',
        }
    })

    return response.json(ads.map(ad => {
        return{
            ...ad,
            weekDays: ad.weekdays.split(','),
            hourStart: convertMinutestoHourString(ad.hourStart),
            hourEnd: convertMinutestoHourString(ad.hourEnd),
        }
    }))
})

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord: true,
        },
        where:{
            id:adId,
        }
    })

    return response.json({
        discord: ad.discord,
    })
})

app.listen(3333)