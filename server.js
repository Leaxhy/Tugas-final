const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const app = express();
const port = 3306;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "src/images")));

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Connected to MySQL database...");
  connection.release();
});

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});

// memeriksa apakah user terautentikasi saat melakukan login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM user WHERE username = ?";
  pool.query(sql, [username], async (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      const isPasswordMatched = await bcrypt.compare(password, result[0].password);
      if (isPasswordMatched) {
        res.json({ message: "Berhasil login." });
      } else {
        res.status(401).json({ message: "Password salah." });
      }
    } else {
      res.status(404).json({ message: "Username tidak ditemukan." });
    }
  });
});

// mengambil data pada tbl_user
app.get("/api/dataUser", (req, res) => {
  const sql = "SELECT * FROM user";
  pool.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// mengambil data pada tbl_buku
app.get("/api/dataProduk", (req, res) => {
  const sql = "SELECT * FROM produk";
  pool.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// menambahkan data pada tbl_user
app.post("/api/dataUser", upload.single("gmbr_user"), (req, res) => {
  const { username, password, email, jk, umur } = req.body;
  const gmbr_user = req.file.filename;
  const sql = `INSERT INTO user (id_user , username, password, email, jk, umur, gmbr_user) VALUES ('', '${username}', '${password}', '${email}', '${jk}', '${umur}', '${gmbr_user}')`;
  pool.query(sql, (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil ditambahkan." });
  });
});

// menambahkan data pada tbl_buku
app.post("/api/dataProduk", upload.single("gmbr_buku"), (req, res) => {
  const { judul, genre, deskripsi, type, author } = req.body;
  const gmbr_buku = req.file.filename;
  const sql = `INSERT INTO produk (id_buku , judul, genre, deskripsi, type, author, gmbr_buku) VALUES ('', '${judul}', '${genre}', '${deskripsi}', '${type}', '${author}', '${gmbr_buku}')`;
  pool.query(sql, (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil ditambahkan." });
  });
});


// mengambil data user berdasarkan ID
app.get("/api/dataUser/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM user WHERE id_user = ?";
  pool.query(sql, id, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// mengambil data buku berdasarkan ID
app.get("/api/dataBuku/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM produk WHERE id_buku = ?";
  pool.query(sql, id, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

//menghapus data user berdasarkan ID
app.delete("/api/dataUser/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM user WHERE id_user = ?";
  pool.query(sql, id, (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil dihapus." });
  });
});

//menghapus data buku berdasarkan ID
app.delete("/api/dataProduk/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM produk WHERE id_buku = ?";
  pool.query(sql, id, (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil dihapus." });
  });
});


// memperbarui data User berdasarkan ID
// Anggap Anda sudah memiliki variabel fs yang mengacu pada modul fs
app.put("/api/dataUser/:id", upload.single("gmbr_user"), (req, res) => {
  const id = req.params.id;
  const { username, email, jk, umur } = req.body;
  let gmbr_user = null;

  // Cek apakah ada gambar yang diunggah
  if (req.file) {
    // Jika ada, atur nama gambar baru
    gmbr_user = req.file.filename;

    // Lakukan penghapusan gambar lama
    const getPicQuery = "SELECT gmbr_user FROM user WHERE id_user = ?";
    pool.query(getPicQuery, id, (err, result) => {
      if (err) throw err;
      const oldPic = result[0].gmbr_user;
      const oldPicPath = path.join(__dirname, "src/images", oldPic);

      // Hapus gambar lama
      fs.unlink(oldPicPath, (err) => {
        if (err) console.log(err);
      });
    });
  }

  const sql =
    "UPDATE user SET username = ?, email = ?, jk = ?, umur = ?, gmbr_user = IFNULL(?, gmbr_user) WHERE id_user = ?";
  const values = [username,  email, jk, umur, gmbr_user, id];

  pool.query(sql, values, (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil diperbarui." });
  });
});


// memperbarui data buku berdasarkan ID
// Anggap Anda sudah memiliki variabel fs yang mengacu pada modul fs
app.put("/api/databuku/:id", upload.single("Gmbr_buku"), (req, res) => {
  const id = req.params.id;
  const { judul, genre, deskripsi, type, author } = req.body;
  let gmbr_buku = null;

  // Cek apakah ada gambar yang diunggah
  if (req.file) {
    // Jika ada, atur nama gambar baru
    gmbr_buku = req.file.filename;

    // Lakukan penghapusan gambar lama
    const getPicQuery = "SELECT gmbr_buku FROM produk WHERE id_buku = ?";
    pool.query(getPicQuery, id, (err, result) => {
      if (err) throw err;
      const oldPic = result[0].gmbr_buku;
      const oldPicPath = path.join(__dirname, "src/images", oldPic);

      // Hapus gambar lama
      fs.unlink(oldPicPath, (err) => {
        if (err) console.log(err);
      });
    });
  }

  const sql =
    "UPDATE produk SET judul = ?, genre = ?, deskripsi = ?, type = ?, author = ?, Gmbr_buku = IFNULL(?, Gmbr_buku) WHERE id_buku = ?";
  const values = [judul, genre, deskripsi, type, author, gmbr_buku, id];

  pool.query(sql, values, (err, result) => {
    if (err) throw err;
    res.json({ message: "Data berhasil diperbarui." });
  });
});



// menghapus file gambar
app.delete("/api/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const path = `./src/images/${filename}`;
  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal menghapus file." });
    } else {
      res.json({ message: "File berhasil dihapus." });
}
});
});