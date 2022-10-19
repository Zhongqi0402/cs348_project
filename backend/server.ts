import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

import sequelize from './database'
import User from './routes/userRoute/UserModel'
import Product from './routes/ticketRoute/ProductModel'
import Ticket from './routes/ticketRoute/TicketModel'

dotenv.config()

const app: Express = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const port = 50000

// routes
// Dummy request
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})
app.use('/api/users', require('./routes/userRoute/userRoute'))
app.use('/api/tickets', require('./routes/ticketRoute/ticketRoute'))

// ----------------------------------------------
// preprocess csv files

const runDB = async () => {
  try {
    await sequelize.sync()
    const isInit = (await User.findByPk(1)) ? true : false
    if (!isInit) {
      // users.csv
      const csvFilePath = path.resolve(__dirname, '..', 'users.csv')
      const headers = ['id', 'name', 'email', 'password', 'isAdmin']
      const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' })
      let userData = parse(fileContent, {
        delimiter: ',',
        columns: headers,
      })
      const salt: string = await bcrypt.genSalt(10)

      // userData = userData.map(async (row: any) => {
      //   const hashedPassword = await bcrypt.hash(row.password, salt)
      //   return {
      //     ...row,
      //     id: parseInt(row.id),
      //     isAdmin: Boolean(row.isAdmin),
      //     password: hashedPassword,
      //   }
      // })
      userData = await Promise.all(
        userData.map(async (row: any) => {
          const hashedPassword = await bcrypt.hash(row.password, salt)
          return {
            ...row,
            id: parseInt(row.id),
            isAdmin: Boolean(row.isAdmin),
            password: hashedPassword,
          }
        })
      )
      // console.log(userData)
      await User.bulkCreate(userData)

      // products.csv
      const productFilePath = path.resolve(__dirname, '..', 'products.csv')
      // console.log('filePath: ', productFilePath)
      // id,manufacturer,type,colour
      const productHeaders = ['id', 'manufacturer', 'type', 'colour']
      const productContent = fs.readFileSync(productFilePath, {
        encoding: 'utf-8',
      })
      let productData = parse(productContent, {
        delimiter: ',',
        columns: productHeaders,
      })
      productData = productData.map((row: any) => {
        return { ...row, id: parseInt(row.id) }
      })
      // console.log(productData)
      await Product.bulkCreate(productData)

      // tickets.csv
      const ticketsFilePath = path.resolve(__dirname, '..', 'tickets.csv')
      // console.log('filePath: ', ticketsFilePath)
      // id,manufacturer,type,colour
      const ticketsHeaders = [
        'id',
        'userID',
        'productID',
        'description',
        'status',
      ]
      const ticketsContent = fs.readFileSync(ticketsFilePath, {
        encoding: 'utf-8',
      })
      let ticketsData = parse(ticketsContent, {
        delimiter: ',',
        columns: ticketsHeaders,
      })
      ticketsData = ticketsData.map((row: any) => {
        return {
          ...row,
          id: parseInt(row.id),
          userID: parseInt(row.userID),
          productID: parseInt(row.productID),
        }
      })
      // console.log(ticketsData)
      await Ticket.bulkCreate(ticketsData)
    }
    Product.hasMany(Ticket)
    Ticket.belongsTo(Product)
    app.listen(port)
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
  } catch (error) {
    console.log(error)
  }
}
runDB()
