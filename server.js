const express = require('express');
const compression = require('compression');
const next = require('next');
const path = require('path');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.disable('x-powered-by');
  // Compresión gzip: el custom server de Express no la trae por defecto
  // (next start sí). Recorta ~70% el HTML/JS transferido.
  server.use(compression({ threshold: 1024 }));

  // (Opcional) Servir archivos estáticos personalizados
  // server.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

  // Cambia esto:
  // server.all('*', (req, res) => {
  //   return handle(req, res);
  // });

  // Por esto:
  server.use((req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});