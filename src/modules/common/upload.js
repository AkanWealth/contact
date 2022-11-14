import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, './assets/')
    // console.log("hhwe")
  },
  filename: (req, file, callBack) => {
    callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
  // filename: function (req, file, cb) {
  //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  //   cb(null, file.fieldname + '-' + uniqueSuffix)
  // }
})

export const upload = multer({
  storage
});