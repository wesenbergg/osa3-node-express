require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))

app.use(cors())

morgan.token('type', (req, res) => {
    if(req.method === 'POST')
        return JSON.stringify(req.body)
})

app.use(bodyParser.json())
app.use(morgan(':method :url :response-time :type'))



let persons = [
    {
      name: "Arto Hellas",
      number: "040-123456",
      id: 1
    },
    {
      name: "Ada Lovelace",
      number: "39-44-5323523",
      id: 2
    },
    {
      name: "Dan Abramov",
      number: "12-43-234345",
      id: 3
    },
    {
      name: "Mary Poppendieck",
      number: "39-23-6423122",
      id: 4
    }
  ]

  //etusivu 'hello world'
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

//näyttää ihmisten määrän ja pyynnön ajan
app.get('/info', (req, res) => {
    res.send(`<p>Phone book has ${persons.length} people</p><p>${new Date()}</p>`)
  })

  //hakee kaikki
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
      res.json(persons.map(p => p.toJSON()))
  })
})

//hakee ihmisen id perusteella
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    //console.log(id)

    const person = persons.find(p => p.id === id)
    person ? res.json(person): res.status(404).end()
  })

//poistaa ihmisen id perusteella
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)

    res.status(204).end()
})

//lisää uuden henkilön
app.post('/api/persons', (req, res) => {
    const body = req.body
    
    if(!body.name || body.name === "") return res.status(400).json({
        error: 'no name'
    })

    console.log(req.body.number)
    if(!body.number || body.number === "") return res.status(400).json({
        error: 'no number'
    })

    //console.log(persons.filter(p => p.name === req.body.name).length)
    if(persons.filter(p => p.name === req.body.name).length !== 0)
        return res.status(400).json({
            error: 'name must be unique'
        })

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})