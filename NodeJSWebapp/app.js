const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const xml2js = require('xml2js'); 
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const pug = require('pug');
const { exec } = require('child_process');


const app = express();
const port = 80;

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'app_user',
  password: 'app_password',
  database: 'web_app'
});

db.connect((err) => {
  if (err) {
      console.error('Error de conexión a la base de datos: ', err.stack);
      return;
  }
  console.log('Conectado a la base de datos');
});

// Configuración de CORS
const corsOptions = {
  origin: '*', // Especifica qué dominios pueden acceder
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type'], // Cabeceras permitidas
};

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Configurar multer para almacenar los archivos en la carpeta "public/images/avatars"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, 'public', 'images', 'avatars');
      if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Configurar multer para almacenar los archivos adjuntos de comentarios
const commentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/uploads/'); // Carpeta donde se guardan los archivos
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname); 
  }
});

const uploadCommentFiles = multer({ storage: commentStorage });
const upload = multer({ storage });

// Middleware para autenticar usuarios usando la cookie "session"
const authenticateUser = (req, res, next) => {
  const sessionCookie = req.cookies.session;

  if (!sessionCookie) {
    req.user = null;  // Usuario no autenticado
    return next();  // Continuar con la petición
    //return res.status(401).json({ message: 'No autenticado. Inicie sesión.' });
  }

  try {
    const userData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
    req.user = userData;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Sesión inválida.' });
  }
};


// Middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rutas específicas para cada archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/blog/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog-details.html'));
});

// Logout (eliminar cookie)
app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/'); // Redirige a la página de inicio
});

// Rutas de API

// Registro de usuario
app.post('/api/v1/register', upload.single('avatar'), async (req, res) => {
  const { username,firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  if (!req.file) {
      return res.status(400).json({ message: 'Debe subir un avatar.' });
  }

  try {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Guardar la información del avatar
      const avatarPath = `/images/avatars/${req.file.filename}`;

      // Insertar en la base de datos
      const query = `
          INSERT INTO users (username, firstname, lastname, email, password, avatar)
          VALUES (?, ?, ?, ?, ?, ?)
      `;

      //CAMBIAR
      //const username = `${firstname.toLowerCase()}_${Date.now()}`; // Generar un username único 
      //Cambiado para que el usuario pueda elegir su nombre de usuario
      db.query(query, [username, firstname, lastname, email, hashedPassword, avatarPath], (err, result) => {
          if (err) {
              console.error('Error al insertar el usuario en la base de datos:', err);
              return res.status(500).json({ message: 'Error al registrar el usuario.' });
          }

          console.log('Usuario registrado con éxito:', { id: result.insertId, username, firstname, lastname, email });
          res.status(201).json({
              message: 'Usuario registrado exitosamente.',
              user: { id: result.insertId, username, firstname, lastname, email, avatar: avatarPath },
          });
      });
  } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Login con autenticación por cookie
app.post('/api/v1/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Ingrese usuario y contraseña' });
  }

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error interno del servidor' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const userData = { id: user.id, username: user.username, is_admin: user.is_admin };
    const base64UserData = Buffer.from(JSON.stringify(userData)).toString('base64');

    res.cookie('session', base64UserData, {
      httpOnly: false,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000 // 1 hora
    });

    res.json({ message: 'Login exitoso', user });
  });
});


// Obtener datos del usuario autenticado
app.get('/api/v1/user/me', authenticateUser, (req, res) => {

  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  const userId = req.user.id;

  db.query('SELECT id, username, firstname, lastname, email, avatar FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener los datos' });

    if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(results[0]);
  });
});

// Ruta para actualizar el perfil y avatar
app.post('/api/v1/update-profile', authenticateUser, upload.single('avatar'), async (req, res) => {
  const { firstName, lastName, email, newPassword } = req.body;
  const avatarPath = req.file ? `/images/avatars/${req.file.filename}` : null;
  // Verificar si el usuario está autenticado
  if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
  }

  const userId = req.user.id;

  // Validar los datos de entrada
  if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Nombre, Apellidos y Correo son obligatorios.' });
  }

  let updateFields = [firstName, lastName, email];
  let query = `
      UPDATE users
      SET firstname = ?, lastname = ?, email = ?
  `;

  // Solo agregar la nueva contraseña si fue proporcionada
  if (newPassword) {
      try {
          // Encriptar la nueva contraseña
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          query += `, password = ?`;
          updateFields.push(hashedPassword);
      } catch (error) {
          console.error('Error al encriptar la contraseña:', error);
          return res.status(500).json({ message: 'Error al encriptar la contraseña.' });
      }
  }

  // Si se sube una imagen, actualizar el avatar
  if (avatarPath) {
      query += `, avatar = ?`;
      updateFields.push(avatarPath);
  }

  query += ` WHERE id = ?`;
  updateFields.push(userId);

  // Ejecutar la consulta
  db.query(query, updateFields, (err, result) => {
      if (err) {
          console.error('Error al actualizar el perfil:', err);
          return res.status(500).json({ message: 'Error al actualizar el perfil' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ message: 'Perfil actualizado con éxito' });
  });
});

// Listar usuarios (solo admin)
app.get('/api/v1/users', authenticateUser, (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'No autorizado' });

  db.query('SELECT id, username, email, is_admin FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuarios' });
    res.json(results);
  });
});

// Cambiar estado de admin a un usuario
app.get('/api/v1/users/:id/toggle-admin', authenticateUser, (req, res) => {
  //if (!req.user.username) return res.status(403).json({ message: 'No autorizado' });
 // Actualizar el rol directamente: si es 1 (admin), lo pone en 0, si es 0 (no admin), lo pone en 1
 db.query(
  `UPDATE users SET is_admin = NOT is_admin WHERE id = ?`,
  [req.params.id],
  (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar el rol de admin' });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Rol de admin actualizado correctamente' });
  }
);
});

// Eliminar usuario
app.delete('/api/v1/users/:id', authenticateUser, (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'No autorizado' });

  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar usuario' });
    res.json({ message: 'Usuario eliminado' });
  });
});

// Importar usuarios desde URL (SSRF vulnerable)
app.post('/api/v1/users/import', authenticateUser, async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.get(url);
    const users = response.data;
    users.forEach(user => {
      db.query('INSERT INTO users (username, email, firstname, lastname, password, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
        [user.username, user.email, user.firstname, user.lastname, bcrypt.hashSync(user.password, 10), user.is_admin || 0]);
    });
    res.json({ message: 'Usuarios importados' });
  } catch (err) {
    //Include also the error message in the response
    console.error('Error al importar usuarios:', err.message);
    res.status(500).json({ message: 'Error al importar', error: res.data });
  }
});

// Cargar usuarios desde XML (XXE vulnerable)
app.post('/api/v1/users/import-xml', authenticateUser, (req, res) => {
  //if (!req.user.is_admin) return res.status(403).json({ message: 'No autorizado' });
  const xml = req.body.xml;
  const parser = new xml2js.Parser({ explicitArray: false});
  parser.parseString(xml, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al procesar XML' });
    const users = result.users.user;
    try {
      console.log('Usuarios a insertar:', users);
      users.forEach(user => {
        console.log('Insertando usuario:', user.username);
        const isAdmin = user.is_admin === 'true' || user.is_admin === 1 ? 1 : 0
        db.query('INSERT INTO users (username, email, firstname, lastname, password, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
          [user.username, user.email, user.firstname, user.lastname, bcrypt.hashSync(user.password, 10), isAdmin],(err, result) => {
            if (err) {
              console.error('❌ Error en la inserción:', err.message);
            } else {
              console.log('✅ Usuario insertado con éxito:', result.insertId);
            }
          });
        });
        res.json({ message: 'Usuarios importados desde XML' });
      } catch (error) {
        console.error('Error al insertar usuarios:', error);
        res.status(500).json({ message: 'Error al insertar usuarios' });
      }
    });
});

// Ping inseguro
app.post('/api/v1/ping', authenticateUser, (req, res) => {
  const  host  = req.body.host;
  console.log('Haciendo ping a:', host);
  exec('ping ' + host, (error, stdout, stderr) => {
    //if (error) return res.status(500).json({ message: 'Error ejecutando ping', error: stderr });
    res.json({ output: stdout });
  });
});



  // Listar todos los blogs
  app.get('/api/v1/blogs', authenticateUser, (req, res) => {
    try {
      let query;
      const params = [];

      if (req.user) {
        // Usuario autenticado: obtener todos los blogs
        query = 'SELECT * FROM blogs';
      } else {
        // Usuario no autenticado: obtener solo blogs públicos
        query = 'SELECT * FROM blogs WHERE is_private = false';
      }

      db.query(query, params, (err, results) => {
        if (err) {
          console.error('Error al obtener los blogs:', err);
          return res.status(500).json({ message: 'Error al obtener los blogs.', details: err.message });
        }

        res.json(results);
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      res.status(500).json({ message: 'Error inesperado al obtener los blogs.', details: error.message });
    }
  });


// Obtener un blog por ID, pendiente de definir
app.get('/api/v1/blog/:blog_id', async (req, res) => {
  const { blog_id } = req.params;

    const query = 'SELECT * FROM blogs WHERE id = ?';
    
    db.query(query, [blog_id], (err, results) => {
        if (err) {
            console.error('Error al obtener el blog:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Blog no encontrado' });
        }

        res.json(results[0]);
    });
});

// Poner comentarios en un blog
app.post('/api/v1/blog/:blog_id/comments', authenticateUser, uploadCommentFiles.array('files'), (req, res) => {
    // 1. Extraer datos de la solicitud
    const { blog_id } = req.params;
    const { content } = req.body;
    const username = 'Anónimo';
    if (req.user) username = req.user.username;

    // 2. Validación: Asegurarse de que el comentario no esté vacío
    if (!content) {
        return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

  // 3. Guardar el comentario en la base de datos
  db.query(
      "INSERT INTO comments (blog_id, writer, comment) VALUES (?, ?, ?)", 
      [blog_id, username, content],
      (error, result) => {
          if (error) {
              console.error('Error al insertar el comentario:', error);
              return res.status(500).json({ message: 'Hubo un error al agregar el comentario.' });
          }

          const commentId = result.insertId;

          // 4. Si hay archivos, guardarlos en la base de datos
          const files = req.files.map(file => ({
              comment_id: commentId,
              file_path: `/uploads/${file.filename}`,
          }));

          if (files.length > 0) {
              const fileInsertQuery = "INSERT INTO comment_files (comment_id, file_path) VALUES ?";

              // Insertar los archivos en la base de datos
              db.query(fileInsertQuery, [files.map(f => [f.comment_id, f.file_path])], (err, fileResult) => {
                  if (err) {
                      console.error('Error al insertar los archivos:', err);
                      return res.status(500).json({ message: 'Hubo un error al agregar los archivos.' });
                  }
              });
          }

          // 5. Responder con el comentario creado
          res.status(201).json({
              message: 'Comentario agregado con éxito',
              comment: {
                  id: commentId,
                  content,
                  author: username,
                  files
              }
          });
      }
  );
});

// Ver los comentarios del blogs
app.get('/api/v1/blog/:blog_id/comments', authenticateUser, uploadCommentFiles.array('files'), (req, res) => {

  const { blog_id } = req.params;

   // 1. Obtener los comentarios del blog desde la base de datos
   db.query(
    "SELECT * FROM comments WHERE blog_id = ?",
    [blog_id],
    (err, comments) => {
        if (err) {
            console.error('Error al obtener los comentarios: ', err);
            return res.status(500).json({ message: 'Error al obtener los comentarios' });
        }

        // 2. Para cada comentario, obtenemos los archivos asociados
        const getFilesForComment = (commentId) => {
            return new Promise((resolve, reject) => {
                db.query(
                    "SELECT * FROM comment_files WHERE comment_id = ?",
                    [commentId],
                    (err, files) => {
                        if (err) {
                            return reject('Error al obtener los archivos de los comentarios');
                        }
                        resolve(files);
                    }
                );
            });
        };

        // 3. Mapear los comentarios para incluir los archivos
        const commentsWithFilesPromises = comments.map(async (comment) => {
            const files = await getFilesForComment(comment.id);
            return {
                ...comment,
                files: files.map(file => ({
                    file_path: file.file_path,
                })),
            };
        });

        // 4. Esperar a que se resuelvan todos los comentarios con sus archivos
        Promise.all(commentsWithFilesPromises)
            .then(commentsWithFiles => {
                // 5. Responder con los comentarios y archivos
                res.status(200).json({
                    comments: commentsWithFiles,
                });
            })
            .catch((error) => {
                console.error('Error al obtener los comentarios con archivos: ', error);
                res.status(500).json({ message: 'Error al procesar los comentarios' });
            });
    }
);
});

//Crear un nuevo blog
app.post('/api/v1/blog', authenticateUser, (req, res) => {
  const { title, content, author, url, is_private } = req.body;
  if (!title || !content) {
      return res.status(400).json({ message: 'El título y el contenido son obligatorios.' });
  }

  let authorName = author || 'Anónimo'; // Nombre predeterminado si no se proporciona

  if (req.user) { // Si el usuario está autenticado, sobrescribir el autor con su nombre completo.
      const userId = req.user.id;
      const queryUser = 'SELECT firstname, lastname FROM users WHERE id = ?';


      db.query(queryUser, [userId], (err, results) => {
          if (!err && results.length > 0) {
              authorName = `${results[0].firstname} ${results[0].lastname}`;
          }

          // Insertar el blog en la base de datos
          const queryBlog = 'INSERT INTO blogs (title, content, author, url, is_private) VALUES (?, ?, ?, ?, ?)';
          db.query(queryBlog, [title, content, authorName, url, is_private], (err, result) => {
              if (err) {
                  console.error('Error al insertar el blog:', err);
                  return res.status(500).json({ message: 'Error al crear el blog.' });
              }

              res.status(201).json({ message: 'Blog creado con éxito', blogId: result.insertId });
          });
      });
  } else {
      // Si no hay usuario autenticado, insertar directamente con el autor proporcionado o "Anónimo"
      const queryBlog = 'INSERT INTO blogs (title, content, author, url) VALUES (?, ?, ?, ?)';
      db.query(queryBlog, [title, content, authorName, url], (err, result) => {
          if (err) {
              console.error('Error al insertar el blog:', err);
              return res.status(500).json({ message: 'Error al crear el blog.' });
          }

          res.status(201).json({ message: 'Blog creado con éxito', blogId: result.insertId });
      });
  }
});

app.get("/api/v1/update-welcome", async (req, res) => {
  // Get the username from the query string
  const username = req.query.username || 'Guest';

  // Vulnerable Implementation
  const templateString = `| Bienvenido ${username}!`;

  // Safe Implementation
  // const templateString = `| Welcome #{'${username}'}!`;

  // Render the template without compiling
  const output = pug.render(templateString);

  // Send the rendered HTML as the response
  res.send(output);
});


// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
