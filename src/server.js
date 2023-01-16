import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import dayjs from 'dayjs'
import joi from 'joi'

dotenv.config()

const server = express()
server.use(cors())
server.use(express.json())

const mongoClient = new MongoClient(process.env.DATABASE_URL)

try {

    await mongoClient.connect()
    console.log('OK, Servidor funcionando.')

} catch (err) {
    console.log("Houve algum erro e não foi possível se conectar.")
}

const db = mongoClient.db()



server.post("/participants", async (req, res) => {
  const userParticipants = req.body
  
  const userSchema = joi.object({
      name: joi.string().required()
  })

  const validation = userSchema.validate(userParticipants, { abortEarly: false })

  if (validation.error) {
      const errors = validation.error.details.map(detail => detail.message)
      return res.status(422).send(errors)
  }

  const alreadyExists = await db.collection('participants').findOne({ name: userParticipants.name })
  if (alreadyExists) return res.status(409).send('Usuário já existe')

  try {

      await db.collection('participants').insertOne({ name: userParticipants.name, lastStatus: Date.now() })

      await db.collection('messages').insertOne(
          {
              from: userParticipants.name,
              to: 'Todos',
              text: 'entra na sala...',
              type: 'status',
              time: dayjs().format('HH:mm:ss')
          })

      res.sendStatus(201)

  } catch (error) {
      res.status(500).send('Houve um erro ao se cadastrar')
  }

})


server.get("/participants", async (req, res) => {

  try {
      const users = await db.collection('participants').find().toArray()
      res.send(users)

  } catch (error) {
      console.log(error.message)
  }
})

server.post('/messages', async (req, res) => {
    const { user } = req.headers
    const mensage = req.body

    if (!user || user === '') return res.sendStatus(422)

    try {
        const userExist = await db.collection('participants').findOne({ name: user })
        if (!userExist) return db.status(422).send('Você não está logado!')

    } catch (error) {
        return res.sendStatus(422)
    }

    const mensageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().valid('message', 'private_message').required()
    })

    const validation = mensageSchema.validate(mensage, { abortEarly: false })

    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(422).send(errors)
    }

    try {
        await db.collection('messages').insertOne(
            {
                from: user,
                to: mensage.to,
                text: mensage.text,
                type: mensage.type,
                time: dayjs().format('HH:mm:ss')
            }
        )

        return res.sendStatus(201)

    } catch (error) {
        return res.status(500).send('Não foi possível enviar mensagem')
    }

})