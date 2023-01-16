import express from "express";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

const mongoClient = new MongoClient(process.env.MONGO_URL)
let db

mongoClient.connect().then(() => {
  db = mongoClient.db("test")
})
