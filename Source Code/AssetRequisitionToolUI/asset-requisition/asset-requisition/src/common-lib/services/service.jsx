import axios from "axios";
import configuration from "../configuartion";
import { axiosPrivate } from "../interceptor/interceptor";

const api = "https://x0kurzm556.execute-api.ap-south-1.amazonaws.com";
const BASE_URL = configuration.API_URL1;

/**Function to call api getting all users */
export default function getUsers(limit, page, field, type, value) {
  return axiosPrivate.get(
    "/users?limit=" +
      limit +
      "&page=" +
      page +
      "&field=" +
      field +
      "&type=" +
      type +
      "&value=" +
      value
  );
}

//loginuser
export function loginUser(value) {
  return axios.post(BASE_URL + "/users/login", value);
}

/**Function to call api getting add user manually */
export function addUser(value) {
  return axiosPrivate.post("/users", value);
}

//getUserbyEmail
export function getUserByEmail(email) {
  let abcd = axiosPrivate.get("/users/" + email);
  return abcd;
}

//deleteUser by email
export function deleteUser(email) {
  return axiosPrivate.put("/users/delete/" + email);
}

/** getAllTicket */
export function getTickets(
  pageNo,
  count,
  type,
  ticketType,
  search,
  projectId,
  departmentId,
  field,
  status
) {
  return axiosPrivate.get(
    "/ticket?page=" +
      pageNo +
      "&pageSize=" +
      count +
      "&type=" +
      type +
      "&ticketType=" +
      ticketType +
      "&search=" +
      search +
      "&projectId=" +
      projectId +
      "&departmentId=" +
      departmentId +
      "&field=" +
      field +
      "&status=" +
      status
  );
}

/**Get ticket details by Id */
export function getTicketById(ticketId) {
  return axiosPrivate.get("/ticket/ticketid/" + ticketId);
}

/**get total count */
export function gettotalCount() {
  return axiosPrivate.get("/tickets/totalCount");
}

/** getComplete ticket count */
export function getcmplteCount() {
  return axiosPrivate.get("/tickets/completeCount");
}
/**getPending ticket count */
export function getpendingCount() {
  return axiosPrivate.get("/tickets/pendingCount");
}

// export function createTicket(value) {
//   return axiosPrivate.post("/tickets", value);
// }

export function searchTicket(text) {
  const tkt = encodeURIComponent(text);
  return axiosPrivate.get("/tickets/search/projectid?id=" + tkt);
}

export function getAllTicketPaginated(pk, sk) {
  return axiosPrivate.get("/tickets/pagination?pk=" + pk + "&sk=" + sk);
}

export function getAllUsersPaginated(pk, sk) {
  return axiosPrivate.get(
    "/users/pagination?limit=" + 10 + "&pk=" + pk + "&sk=" + sk
  );
}

export function searchUser(username) {
  return axiosPrivate.get("/users/search/" + username);
}

export function setLevelTickets(id,data) {
  return axiosPrivate.put("/ticket/setlevel/" + id, data);
}

export function addQuotation(id, data) {
  return axiosPrivate.put("/ticket/setlevel/" + id, data);
}
export function setStatusTickets(data) {
  return axiosPrivate.put("/ticket/reject", data);
}

export function changePassword(data, accessToken) {
  return axios.post(BASE_URL + "/users/changepassword", data, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
}

/** Bulk user create */
export function bulkUserCreate(formData) {
  return axiosPrivate.post(BASE_URL + "/users/csv", formData);
}

/** editUser */
export function editUser(data, userId) {
  return axiosPrivate.put("/users/" + userId, data);
}

/** get counts of total,completed and pending tickets based on user in single api call */

export function getTicketCount() {
  return axiosPrivate.get("ticket/count");
}

/** get the employee ID unique based on the api call */

export function getUniqueId(empId) {
  return axiosPrivate.get("/users/validEmpId/" + empId);
}

export function forgetPassword(email) {
  return axiosPrivate.put("/users/forgotPassword", email);
}

/** get the email unique based on the api call */

export function getUniqueEmail(email) {
  return axiosPrivate.get("/users/validateEmail/" + email);
}

/** Function to delete ticket by passing the ticket id */
export function deleteTicket(ticketId) {
  return axiosPrivate.put("/ticket/delete/" + ticketId);
}

export function filesDownload(filename) {
  return axios.get(configuration.FILE_LOCATION + filename);
}

export function getCurrentUser() {
  return axiosPrivate.get("/users/userDetails");
}

export function createAsset(data) {
  return axiosPrivate.post("/assets", data);
}

export function getCategoryList() {
  return axiosPrivate.get("/tickets/category");
}

export function getDeviceList(category) {
  return axiosPrivate.get("/assets/category/" + category);
}

export function getAssetList(category) {
  return axiosPrivate.get("/assets/totalasset/" + category);
}

export function getCategoryDetails(category, lastEvaluatedKey) {
  return axiosPrivate.get(
    "/assets/cat/" +
      category +
      "?sk=" +
      lastEvaluatedKey.sk +
      "&pk=" +
      lastEvaluatedKey.pk
  );
}

export function getAssetById(assetId) {
  const encodedAssetId = encodeURIComponent(assetId);
  return axiosPrivate.get(`/assets/${encodedAssetId}`);
}
export function editAsset(data) {
  return axiosPrivate.put("/assets", data);
}

export function AssetCsvUpload(formData) {
  return axiosPrivate.post(BASE_URL + "/assets/csv", formData);
}

export function deleteAsset(pk, sk) {
  return axiosPrivate.put(
    "/assets/del?pk=" + encodeURIComponent(pk) + "&sk=asset"
  );
}

export function managerAssetsList() {
  return axiosPrivate.get("/assets/assetowned");
}

export function getAssetIdList(asset) {
  return axiosPrivate.get("/assets/assetIds/" + asset);
}

export function allocateAssets(data) {
  return axiosPrivate.post("/assets/allocate", data);
}

export function returnAsset(ticketId) {
  return axiosPrivate.post(`assets/return/${ticketId}`);
}
export function extendAsset(ticketId, expiryDate) {
  return axiosPrivate.post(`assets/extend/${ticketId}`, expiryDate);
}

export function getAccessToken(idToken) {
  const value = { code: idToken };
  return axios.post(BASE_URL + "/users/login", value);
}

export function addCategory(data) {
  return axiosPrivate.post("/category", data);
}

export function addProject(data) {
  return axiosPrivate.post("/projects", data);
}

export function createTicket(value) {
  return axiosPrivate.post("/ticket", value);
}

export function getCategory() {
  return axiosPrivate.get("/category/categoryList");
}

export function getProject() {
  return axiosPrivate.get("/projects/tickets/projectList");
}

export function getDepartment() {
  return axiosPrivate.get("/departments/all/dept");
}

export function getAllPermissions() {
  return axiosPrivate.get("/users/permissions");
}

export function addDepartment(data) {
  return axiosPrivate.post("/departments", data);
}

export function getAllProjects(limit, page) {
  return axiosPrivate.get("/projects?limit=" + limit + "&page=" + page);
}

export function getAllDepartments(limit, page) {
  return axiosPrivate.get("/departments?limit=" + limit + "&page=" + page);
}

export function getAllCatgeory(limit, page) {
  return axiosPrivate.get("/category?limit=" + limit + "&page=" + page);
}

export function editCategory(id, data) {
  return axiosPrivate.put(`/category/${id}`, data);
}

export function editDepartment(id, data) {
  return axiosPrivate.put(`departments/${id}`, data);
}

export function deleteDepartment(deptId) {
  return axiosPrivate.put("departments/delete/" + deptId);
}

export function projectDelete(prctId) {
  return axiosPrivate.put("projects/delete/" + prctId);
}

export function editProject(id, data) {
  return axiosPrivate.put(`/projects/${id}`, data);
}

export function getNotification() {
  return axiosPrivate.get("/users/notifications");
}

export function departmentList() {
  return axiosPrivate.get("departments/all/dept");
}

export function projectLists() {
  return axiosPrivate.get("/projects/tickets/projectList");
}

export function deleteCategory(id) {
  return axiosPrivate.put(`category/delete/${id}`);
}
export function notificationDelete(notificationId) {
  return axiosPrivate.put(`users/notifications/${notificationId}`);
}

export function notificationCount() {
  return axiosPrivate.get("users/notificationCount");
}

export function getManagers() {
  return axiosPrivate.get("ticket/managers");
}

export function editTicket(ticketId, data) {
  return axiosPrivate.put("ticket/" + ticketId, data);
}

export function fileDelete(fileId) {
  return axiosPrivate.post("ticket/filedelete/", { fileId: fileId });
}

export function clearAllNotification() {
  return axiosPrivate.put("users/clear");
}

export function getHistory(ticketId) {
  return axiosPrivate.get("/ticket/history/" + ticketId);
}
