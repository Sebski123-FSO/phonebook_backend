const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

morgan.token("body", function getId(req) {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/info", (req, res) => {
  res.write(`<p>Phonebook has info for ${persons.length} people</p>`);
  res.end(`<p>${new Date().toUTCString()}</p>`);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.post("/api/persons", (req, res) => {
  const data = req.body;
  if (!data.name || !data.number) {
    return res.status(422).json({ error: "missing name or number" });
  }
  if (persons.some((person) => person.name === data.name)) {
    return res.status(409).json({ error: `entry with 'name: ${data.name}' already exists` });
  }
  const newPerson = {
    id: Math.floor(Math.random() * 10000),
    name: data.name,
    number: data.number,
  };
  persons = persons.concat(newPerson);
  res.status(200).json(newPerson);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Starting server on port: ${PORT}`);
});
