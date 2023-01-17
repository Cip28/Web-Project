const express = require('express')
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'task.db'
})

const Task = sequelize.define('task', {
  name: Sequelize.STRING,
  sets: {
    type: Sequelize.NUMBER
  },
  repeats: {
    type: Sequelize.NUMBER
  }
})

sequelize.sync({ alter: true })
  .then(() => {
    console.log('tables created')
  })

const app = express()

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url)
  next()
})

app.use(express.static('public'))

app.use(express.json())

app.get('/Tasks', async (req, res, next) => {
  try {
    const tasks = await Task.findAll()
    res.status(200).json(tasks)
  } catch (error) {
    next(error)
  }
})

app.post('/tasks', async (req, res, next) => {
  try {
    const task = await Task.create(req.body)
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

app.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (task) {
      res.status(200).json(task)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.put('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (task) {
      task.name = req.body.name
      task.sets = req.body.sets
      task.repeats = req.body.repeats
      await task.save()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }      
  } catch (error) {
    next(error)
  }
})

app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const tasks = await Task.findByPk(req.params.id)
    if (tasks) {
      await tasks.destroy()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
      
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  console.warn(err)
  res.status(500).json({ message: 'server error' })
})

app.listen(8080)