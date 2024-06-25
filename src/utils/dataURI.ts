import DataURIParser from "datauri/parser.js";
import path from "path";

interface FileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const getDataUri = (file: FileType) => {
  const parser = new DataURIParser();
  const extensionName = path.extname(file.originalname).toString();
  return parser.format(extensionName, file.buffer); // it requires 2 things, file name and content
};

export default getDataUri;
