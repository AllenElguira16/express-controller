import Express from "express";
import path from "path";
import fs from 'fs';
import {ResponseError} from "./response-error";

const router = Express.Router();

/**
 * Registers Controller to Express Router
 * 
 * Note: Don't edit this file unless you know what you're doing
 * 
 * @author Michael Allen Elguira <michael01@simplexi.com.ph>
 */
export const registerController = (controllerDirectory: string) => {
  const controllerFilenames = getFilenames(controllerDirectory);

  controllerFilenames.forEach((controllerFilename: string) => {
    const [filename] = controllerFilename.split('.');
    const handler = require(path.join(controllerDirectory, controllerFilename));

    const uri = '/' + filename
      .replace(/\[([\w\-. ])+\]/gm, (sMatchedString) => ':' + sMatchedString.slice(1, -1))
      .replace(/\\/, '\/')
      .replace('/index', '');

    Object.keys(handler).forEach((method: string) => {
      type TExpressMethods = 'get'|'post'|'put'|'delete';
      
      router[method.toLocaleLowerCase() as TExpressMethods](uri, async (...oArgs) => {
        const [request, response] = oArgs;
        try {
          await handler[method](...oArgs);
        } catch (error) {
          if (error instanceof ResponseError) {
            response.status(error.code).json({
              success: false,
              status: error.code,
              message: error.message
            });
          } else {
            response.status(500).json({
              success: false,
              status: 500,
              content: error
            });
          }
        }
      });
    });
  });

  return router;
}

/**
 * Get all filenames in directories and sub-directories
 * 
 * @author Michael Allen Elguira <michael01@simplexi.com.ph>
 */
function getFilenames(sRootDirectory: string) {
  let files: string[] = [];

  const recursiveFilenameGrepper = (directory: string) => {
    fs.readdirSync(directory).forEach(sFilename => {
      const filepath = path.join(directory, sFilename);

      if (fs.statSync(filepath).isDirectory()) return recursiveFilenameGrepper(filepath);
      else return files.push(filepath.replace(sRootDirectory + '\\', ''));
    });
  };

  recursiveFilenameGrepper(sRootDirectory);

  return files;
}
