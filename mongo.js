const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://borissj:${password}@fsmooc-cluster-i01ci.mongodb.net/person-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
})

const Person = mongoose.model('Person', personSchema)

const save = () => {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(response => {
        console.log(`Person ${process.argv[3]} added to phonebook.`);
        mongoose.connection.close();
    })
}

const printAll = () => {
    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(p => {
          console.log(p)
        })
        mongoose.connection.close()
    })
}

(process.argv.length === 5) ? save(): printAll()