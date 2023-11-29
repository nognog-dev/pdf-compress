const { exec } = require("child_process");
const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const { spawn } = require('child_process');

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use(helmet());

app.use(cors());

app.post("/compress/:quality", upload.single("file"), (req, res) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  const inputPath = req.file.path;
  const quality = req.params.quality;

  let pdfSetting;
  switch (quality) {
    case "1":
      pdfSetting = "/prepress"; // high quality, color preserving, 300 dpi imgs
      break;
    case "2":
      pdfSetting = "/printer"; // high quality, 300 dpi images
      break;
    case "3":
      pdfSetting = "/ebook"; // low quality, 150 dpi images
      break;
    default:
      pdfSetting = "/default"; // default compress
  }
  // gswin64 FOR WINDOWS
  const gs = spawn('gs', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', `-dPDFSETTINGS=${pdfSetting}`, '-dNOPAUSE', '-dQUIET', '-dBATCH', '-sOutputFile=%stdout', inputPath]);

  gs.stdout.pipe(res);
  gs.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  gs.on('close', (code) => {
    if (code !== 0) {
      console.log(`gs process exited with code ${code}`);
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
