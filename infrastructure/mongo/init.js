db.users.insertOne({
  isActive: true,
  name: "admin",
  pass: "$2b$10$5WOgLifTD5haIxdSatb95OK8aQj.BxN6DOV5dYcTsZNJFyQjYw12i",
  isAdmin: true,
})

db.users.createIndex( { "name": 1 }, { unique: true } )
