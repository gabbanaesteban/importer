// import hbs from "hbs"
import express from "express"
import session from "express-session"
import helmet from "helmet"
import path from "path"
import { ExpressHandlebars } from "express-handlebars"
import router from "./routes/router"

const app = express()

const hbs = new ExpressHandlebars({
  extname: "hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
})

app.engine("hbs", hbs.engine)
app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "views"))

// development ;)
const sessionConfig = {
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}

app.use(session(sessionConfig))
app.use(express.static(path.join(__dirname, "../public")));
app.use(helmet())
app.use(express.urlencoded({ extended: false }))
app.use(router)

app.listen(3000, async () => {
  console.log("Server is running on http://localhost:3000")
})
