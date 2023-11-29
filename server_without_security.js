const { exec } = require("child_process");
const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.post("/compress/:quality", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `compressed/${req.file.filename}`;
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
      pdfSetting = "/default";
  }

  exec(
    `gswin64 -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${pdfSetting} -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`,
    error => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      res.download(outputPath);
    }
  );
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
