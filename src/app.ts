import express from 'express';
import hbs from 'hbs';
import path from 'path';

const app = express();
app.set('view engine', 'hbs');

const viewsPath = path.join(__dirname, 'views');
// const partialsPath = path.join(__dirname, 'views', 'partials');

app.set('views', viewsPath);
// hbs.registerPartials(partialsPath);

app.get('/', (_, res) => {
  const data = { title: 'Meh' }
  res.render('home', { data });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});