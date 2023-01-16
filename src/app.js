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
