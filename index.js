require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))

app.use(cors())

morgan.token('type', (req) => {
  if(req.method === 'POST')
    return JSON.stringify(req.body)
})

app.use(bodyParser.json())
app.use(morgan(':method :url :response-time :type'))

//näyttää ihmisten määrän ja pyynnön ajan
app.get('/info', (req, res) => {
  Person.find({}).then(p => {
    res.send(`<p>Phonebook has ${p.length} people</p><p>${new Date()}</p>`)
  })
})

//hakee kaikki
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(p => p.toJSON()))
  })
})

//hakee ihmisen id perusteella
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id).then(p => {
    p ? console.log('true'): console.log('false')
    p ? res.json(p.toJSON()): res.status(204).end()
  }).catch(error => next(error))
})

//poistaa ihmisen id perusteella
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(() => res.status(204).end())
    .catch(error => next(error))
})

//lisää uuden henkilön
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if(!body.name || body.name === '') return res.status(400).json({
    error: 'no name'
  })

  console.log(req.body.number)
  if(!body.number || body.number === '') return res.status(400).json({
    error: 'no number'
  })

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  }).catch(e => next(e))
})

//päivittää ihmisen
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// virheellisten pyyntöjen käsittely
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})