const backendApiUrl = "http://localhost:8080/api";

const routes = {
  AUTH: "auth",
  COURT: "court",
  USER: "user",
  PAY: "payment",
};

const methods = {
  GET: "get",
  GET_ALL: "getAll",
  POST: "add",
  PUT: "update",
  DELETE: "delete",
  UPLOAD: "upload",
  IMPORT: "import",
  IMPORTBOOK: "importCourts",
  CREATE_PAYMENT_LINK: "create-payment-link",

};

const apiUrl = (route, method, id = "") => `${backendApiUrl}/${route}/${method}${id && `/${id}`}`;

module.exports = { routes, methods, apiUrl };
