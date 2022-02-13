const mongoose = require("mongoose");

if (process.argv.length !== 5 && process.argv.length !== 3) {
  console.log("usage:");
  console.log("\t1: node mongo.js <password>");
  console.log("\t2: node mongo.js <password> <name> <number>");
  process.exit(1);
}

const password = process.argv[2];

if (process.argv.length > 3) {
  var personName = process.argv[3];
  var personNumber = process.argv[4];
}

const url = `mongodb+srv://fullstack:${password}@cluster0.gjnyr.mongodb.net/phoneBook?retryWrites=true&w=majority`;

mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", noteSchema);

switch (process.argv.length) {
  case 3:
    Person.find({}).then((result) => {
      console.log("phonebook:");
      result.forEach((person) => {
        console.log(person.name, person.number);
      });
      mongoose.connection.close();
    });
    break;
  case 5:
    const person = new Person({
      name: personName,
      number: personNumber,
    });

    person.save().then((result) => {
      console.log(`added ${personName} number ${personNumber} to phonebook`);
      mongoose.connection.close();
    });
    break;
  default:
    console.log("Weird arguments");
    mongoose.connection.close();
    break;
}
