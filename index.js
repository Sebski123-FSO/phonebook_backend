require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

morgan.token("body", function getId(req) {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("build"));
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/info", (req, res) => {
  Person.count({}).then((count) => {
    res.write(`<p>Phonebook has info for ${count} people</p>`);
    res.end(`<p>${new Date().toUTCString()}</p>`);
  });
});

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((response) => {
      res.json(response);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;

  Person.findOne({ name: name }).then((person) => {
    if (person) {
      res.status(409).json({ error: `User with name ${name} already exists` });
    } else {
      const newPerson = Person({ name, number });

      newPerson
        .save()
        .then(() => {
          res.status(200).json(newPerson);
        })
        .catch((error) => next(error));
    }
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: "query" })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.use(errorHandler); //Has to be last

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Starting server on port: ${PORT}`);
});
