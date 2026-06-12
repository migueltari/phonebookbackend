const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())
//app.use(morgan('tiny'))
//app.use(morgan(':method'))

const cors = require('cors')
app.use(cors())

//En la raíz tenemos la carpeta dist con todo lo
//necesario para que la aplicación funcione en
//producción: el frontend se servirá desde el
//backend en modo estático
app.use(express.static('dist'))

//Creamos el token person
//Como morgan se ejecuta en cada petición,
//hay peticiones, como GET o DELETE, en las
//que el cliente no envía ningún cuerpo, por
//lo que request.body será undefined:
//al intentar leer name se rompería el código
//Si la petición es un POST con datos, leerá
//correctamente name y number
//Si la petición es un GET, donde no hay body,
//devolverá 'No body'
morgan.token('person', (request, response) => {
    if (request.body){
      const data = {
          name: request.body.name,
          number: request.body.number
      }
      return JSON.stringify(data)
    } else{
      return 'No body'
    }
    })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))


/*
const PORT = 3001
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`)
})
*/

//Para desplegar la aplicación en internet 
const PORT = process.env.PORT || '0.0.0.0'
        app.listen(PORT, () => {
        	console.log(`Server running on port ${PORT}`)
    	  })


let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
        response.send('El servidor funciona!')
        })

app.get('/api/persons', (request, response) => {
        response.json(persons)
        })

app.get('/info', (request, response) => {
        response.send('Phonebook has info for '+persons.length+' people</br>'
                      + new Date().toString())
                      
        })

app.get('/api/persons/:id', (request, response) => {
        const id = request.params.id
        const person = persons.find(p => p.id === id)

        if (person) {
            response.json(person)
        } else {
            response.statusMessage = "La persona solicitada no existe",
            response.status(404).end()
        }
        })


app.delete('/api/persons/:id', (request, response) => {
        const id = request.params.id
        const borrado = persons.filter(p=>p.id===id)
        persons = persons.filter(p => p.id !== id)
        console.log("Se ha borrado: "+borrado[0].name)
        response.status(204).end()
    })


app.post('/api/persons', (request, response) => {
        const body = request.body

        if (!body.name || !body.number) {
            return response.status(400).json({ 
            error: 'name o number missing' 
            })
        }

        if(persons.find(p=>p.name === body.name) !== undefined){
          return response.status(400).json({ 
            error: 'name must be unique' 
            })
        }

        const person = {
            name: body.name,
            number: body.number,
            id: Math.floor(Math.random() * 10000000)+1
        }

        persons = persons.concat(person)

        response.json(person)
    })
