const backendApiUrl = "http://localhost:8080/api";

const routes = {
  AUTH: "auth",
  COURT: "court",
  USER: "user",
  PAY: "payment",
  FEEDBACK: "feedback",
  BILL: "bill",

};

const methods = {
  GET: "get",
  GET_ALL: "getAll",
  GET_ALL_BY_DATE: "getAll/date",
  PUT_BY: "update/by",
  POST: "add",
  PUT: "update",
  DELETE: "delete",
  UPLOAD: "upload",
  IMPORT: "import",
  IMPORTBOOK: "importCourts",
  CREATE_PAYMENT_LINK: "create-payment-link",
  GET_BY_COURT_ID: "getAll"

};

const apiUrl = (route, method, id = "") => `${backendApiUrl}/${route}/${method}${id && `/${id}`}`;

module.exports = { routes, methods, apiUrl };
