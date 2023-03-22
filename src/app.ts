// import hbs from "hbs"
import express from "express"
import session from "express-session"
import helmet from "helmet"
import path from "path"
import router from "./routes/router"

const app = express()

app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "views"))
// hbs.registerPartials(path.join(__dirname, 'views', 'partials'))

const sessionConfig = {
  secret: "secret", // TODO: Change this to a random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // TODO: Change this to true when using HTTPS
}

app.use(session(sessionConfig))
app.use(helmet())
app.use(express.urlencoded({ extended: false }))
app.use(router)

app.listen(3000, async () => {
  console.log("Server is running on http://localhost:3000")
})
