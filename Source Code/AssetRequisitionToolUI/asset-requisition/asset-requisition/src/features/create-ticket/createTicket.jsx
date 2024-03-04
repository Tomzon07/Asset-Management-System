import classes from "./createTicket.module.css";
import SideNavbar from "../sidenavbar/sideNavabr";
import { useState, useEffect, React } from "react";
import { useForm } from "react-hook-form";
import {
  createTicket,
  getCategory,
  getProject,
  editTicket,
  getDepartment,
  getManagers,
  getTicketById,
} from "../../common-lib/services/service";
import Swal from "sweetalert2";
import addIcon from "../../assets/addIcon.svg";
import CategoryModal from "./categoryModal";
import ProjectModal from "./projectModal";
import { useLocation, useNavigate } from "react-router-dom";
import getUserPermission from "../../common-lib/checkuser";
import FileModal from "./components/fileModal";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";

const CreateRequest = () => {
  const [fileError, setFileError] = useState("");
  const user = getUserPermission();
  const [email, setEmail] = useState("");
  const [filePath, setFilePath] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isClicked, setIsClicked] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [data, setData] = useState([]);
  const location = useLocation();
  const ticketId = location?.state?.ticketId;
  const { height } = useWindowDimensions();
  const [divHeight, setDivHeight] = useState(height - 160);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const handleAddProject = () => {
    setShowProjectModal(true);
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
  };

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    setValue,
  } = useForm({ shouldFocusError: false });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getCategory(), getProject(), getDepartment(), getManagers()])
      .then(
        ([
          categoryResponse,
          projectResponse,
          departmentResponse,
          managerResponse,
        ]) => {
          setIsLoading(false);
          setCategories(categoryResponse?.data);
          setProjects(projectResponse?.data);
          setDepartments(departmentResponse?.data);
          setManagers(managerResponse?.data);
        }
      )
      .catch((error) => {
        setIsLoading(false);
      });
  }, [showCategoryModal, showProjectModal]);

  //to restrict only numbers and hyphen in stock field
  const isNumberKey = (evt) => {
    let charCode = evt.which ? evt.which : evt.keyCode;

    if (
      (charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        (charCode < 96 || charCode > 105)) ||
      evt.shiftKey
    ) {
      evt.preventDefault();
    }
    return true;
  };

  useEffect(() => {
    ticketId &&
      getTicketById(ticketId).then((res) => {
        setEmail(res?.data?.email);
        setData(res.data);
        setFormValue(res.data);
      });
  }, []);

  const setFormValue = (data) => {
    setValue("title", data.title);
    setValue("categoryId", data.categoryId);
    setValue("projectId", data.projectId);
    setValue("departmentId", data.departmentId);
    setValue("managerId", data.managerId);
    setValue("budget", data.budget);
    setValue("description", data.description);
    setFilePath(data.path);
  };

  const addTicket = (data) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("categoryId", data.categoryId);
    formData.append("projectId", data.projectId);
    formData.append("departmentId", data.departmentId);
    formData.append("managerId", data.managerId ? data.managerId : 0);
    formData.append("budget", data.budget);
    formData.append("description", data.description);
    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    setIsClicked(true);
    setIsLoading(true);
    let apiCall;
    if (!isClicked) {
      if (ticketId) {
        apiCall = editTicket(ticketId, formData);
      } else {
        apiCall = createTicket(formData);
      }

      apiCall
        .then((res) => {
          setIsLoading(false);
          reset();
          setSelectedFiles([]);
          setFileError("");
          Swal.fire({
            title: "Success",
            text: ticketId
              ? "Request Updated Successfully"
              : "Request Created Successfully",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          setIsLoading(false);
          // if (ticketId) {
          //   user?.email === email
          //     ? navigate("/requestlist", { state: { filter: "myrequest" } })
          //     : navigate("/requestlist");
          // } else {
            navigate("/myrequestlist");
          // }
          setEmail("");
          setTimeout(() => {
            setIsClicked(false);
          }, 20);
        })
        .catch((error) => {
          setIsLoading(false);
          setSelectedFiles([]);
          setFileError("");
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: error.response.data.message,
            timer: 1500,
            showConfirmButton: false,
          });
          setTimeout(() => {
            setIsClicked(false);
          }, 20);
        });
    }
  };

  const onFormSubmit = (data) => {
    if (fileError === "") {
      addTicket(data);
    } else {
      Swal.fire({
        icon: "error",
        text: fileError,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    setDivHeight(height - 100);
  }, [height]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className={classes.userDashboard}>
        <div style={{ display: "flex" }}>
          <SideNavbar className={classes.navBar} />
          <div className={classes.ticketdetails} style={{ height: divHeight }}>
            <div className={classes.titleDiv}>
              <p className={classes.title}>
                {ticketId ? "Update Request " : "Create Request"}
              </p>
            </div>
            <div className={classes.formdiv}>
              <form id="createRequestForm" className={classes.form}>
                <div className={classes.formInputs}>
                  <div className={classes.formDiv}>
                    <label htmlFor="title" className={classes.formLabel}>
                      Title
                    </label>
                    <input
                      id={"title"}
                      type={"text"}
                      className={`${classes.textField} ${
                        errors.title && classes.error
                      }`}
                      style={{
                        border: errors.title
                          ? "2px red solid"
                          : "1px #a7a7a7 solid",
                      }}
                      {...register("title", {
                        required: "Title is required",
                        pattern: {
                          value: /^\S(.*\S)?$/,
                          message: "Enter a valid title",
                        },
                        minLength: {
                          value: 4,
                          message: "Title should be atleaset 4 characters long",
                        },
                        maxLength: {
                          value: 30,
                          message: "Maximum length allowed is 30",
                        },
                      })}
                    />

                    <p className={classes.errors}>{errors.title?.message}</p>
                  </div>

                  <div className={classes.rightDiv}>
                    <label htmlFor="category" className={classes.formLabel}>
                      Category
                    </label>
                    <div className={classes.dropdownContainer}>
                      <select
                        className={`${classes.select} ${
                          errors.category && classes.error
                        }`}
                        defaultValue=""
                        name="category"
                        style={{
                          border: errors.categoryId
                            ? "2px red solid"
                            : "1px #a7a7a7 solid",
                        }}
                        {...register("categoryId", {
                          required: true,
                        })}
                      >
                        <option value={""} disabled>
                          Select
                        </option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.Id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                      <div className={classes.addIconContainer}>
                        <img
                          src={addIcon}
                          alt="Add Icon"
                          className={classes.addIcon}
                          onClick={handleAddCategory}
                        />
                      </div>
                      {showCategoryModal && (
                        <CategoryModal
                          open={showCategoryModal}
                          onClose={handleCloseCategoryModal}
                        />
                      )}
                    </div>
                    <p className={classes.errors}>
                      {errors.categoryId?.type === "required" &&
                        "Please select a category"}
                    </p>
                  </div>
                </div>

                <div className={classes.formInputs}>
                  <div className={classes.formDiv}>
                    <label htmlFor="project" className={classes.formLabel}>
                      Project
                    </label>
                    <div className={classes.dropdownContainer}>
                      <select
                        className={`${classes.select} ${
                          errors.project && classes.error
                        }`}
                        defaultValue=""
                        name="projectId"
                        style={{
                          border: errors.projectId
                            ? "2px red solid"
                            : "1px #a7a7a7 solid",
                        }}
                        {...register("projectId", {
                          required: true,
                        })}
                      >
                        <option value={""} disabled>
                          Select
                        </option>
                        {projects?.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.projectName}
                          </option>
                        ))}
                      </select>
                      <div className={classes.addIconContainer}>
                        <img
                          src={addIcon}
                          alt="Add Icon"
                          className={classes.addIcon}
                          onClick={handleAddProject}
                        />
                      </div>
                      {showProjectModal && (
                        <ProjectModal
                          open={showProjectModal}
                          onClose={handleCloseProjectModal}
                        />
                      )}
                    </div>
                    <p className={classes.errors}>
                      {errors.projectId?.type === "required" &&
                        "Please select a project"}
                    </p>
                  </div>

                  <div className={classes.rightDiv}>
                    <label htmlFor="department" className={classes.formLabel}>
                      Department
                    </label>
                    <select
                      className={`${classes.select} ${
                        errors.department && classes.error
                      }`}
                      defaultValue=""
                      name="department"
                      style={{
                        border: errors.departmentId
                          ? "2px red solid"
                          : "1px #a7a7a7 solid",
                      }}
                      {...register("departmentId", {
                        required: true,
                      })}
                    >
                      <option value={""} disabled>
                        Select
                      </option>
                      {departments &&
                        Array.isArray(departments) &&
                        departments?.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.departmentName}
                          </option>
                        ))}
                    </select>
                    <p className={classes.errors}>
                      {errors.departmentId?.type === "required" &&
                        "Please select a department"}
                    </p>
                  </div>
                </div>

                <div className={classes.formInputs}>
                {user.permission.includes("EMPLOYEE") ? (
                  <>
                  <div className={classes.formDiv}>
                      <div className={classes.employeeDiv}>
                        <label
                          htmlFor="projectManager"
                          className={classes.formLabel}
                        >
                          Manager
                        </label>
                        <select
                          className={`${classes.select} ${
                            errors.projectManager && classes.error
                          }`}
                          defaultValue=""
                          name="projectManager"
                          style={{
                            border: errors.managerId
                              ? "2px red solid"
                              : "1px #a7a7a7 solid",
                          }}
                          {...register("managerId", {
                            required: true,
                          })}
                        >
                          <option value={""} disabled>
                            Select
                          </option>
                          {managers?.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.name}
                            </option>
                          ))}
                        </select>
                        <p className={classes.errors}>
                          {errors.managerId?.type === "required" &&
                            "Please select a Manager"}
                        </p>
                      </div>
                  </div>

                    <div className={classes.rightDiv}>
                    <label htmlFor="budget" className={classes.formLabelfile}>
                      Expected Amount
                    </label>
                    <input
                      id={"budget"}
                      type={"number"}
                      onKeyDown={isNumberKey}
                      className={`${classes.textField} ${
                        errors.amount && classes.errors
                      }`}
                      style={{
                        border: errors.budget
                          ? "2px red solid"
                          : "1px #a7a7a7 solid",
                      }}
                      {...register("budget", {
                        maxLength: {
                          value: 8,
                          message: "Maximum length allowed is 8",
                        },
                        min: {
                          value: 0.01,
                          message: "Amount must be greater than zero",
                        },
                        pattern: {
                          value: /^(?!0)[0-9]+$/,
                          message: "Please enter a valid amount",
                        },
                      })}
                    />

                    <p className={classes.errors}>{errors.budget?.message}</p>
                  </div>
                    </>
                     ) : (
                      ""
                    )}
                </div>

                <div className={classes.formInputs}>
               
                 { 
                   !user.permission.includes("EMPLOYEE") ? (                
                 <div className={classes.formDiv}>
                    <label htmlFor="budget" className={classes.formLabelfile}>
                      Expected Amount
                    </label>
                    <input
                      id={"budget"}
                      type={"number"}
                      onKeyDown={isNumberKey}
                      className={`${classes.textField} ${
                        errors.amount && classes.errors
                      }`}
                      style={{
                        border: errors.budget
                          ? "2px red solid"
                          : "1px #a7a7a7 solid",
                      }}
                      {...register("budget", {
                        maxLength: {
                          value: 8,
                          message: "Maximum length allowed is 8",
                        },
                        min: {
                          value: 0.01,
                          message: "Amount must be greater than zero",
                        },
                        pattern: {
                          value: /^(?!0)[0-9]+$/,
                          message: "Please enter a valid amount",
                        },
                      })}
                    />

                    <p className={classes.errors}>{errors.budget?.message}</p>
                  </div>
                   ):(
                    ""
                   )
                  }
                
              { 
              user.permission.includes("EMPLOYEE") ?(
              <div className={classes.formDescDiv}>
                    <label className={classes.formLabelfile}>Attachments</label>
                    <FileModal
                      selectedFiles={selectedFiles}
                      setSelectedFiles={setSelectedFiles}
                    />
                  </div>
                  ):(
                    <div className={classes.rightDiv}>
                    <label className={classes.formLabelfile}>Attachments</label>
                    <FileModal
                      selectedFiles={selectedFiles}
                      setSelectedFiles={setSelectedFiles}
                    />
                  </div>
                  )}
                </div>

                <div className={classes.formDescInputs}>
                  <div className={classes.formDescDiv} style={{marginTop:"30px"}}>
                    <label htmlFor="description" className={classes.formLabel}>
                      Description
                    </label>
                    <textarea
                      id={"description"}
                      type={"text"}
                      className={`${classes.descrip} ${
                        errors.description && classes.error
                      }`}
                      style={{
                        border: errors.description
                          ? "2px red solid"
                          : "1px #a7a7a7 solid",
                      }}
                      {...register("description", {
                        required: "Description is required",
                        pattern: {
                          value: /^\S(.*\S)?$/,
                          message: "Enter a valid Description",
                        },
                        maxLength: {
                          value: 200,
                          message: "Maximum length allowed is 200",
                        },
                        minLength: {
                          value: 4,
                          message: "Minimum length allowed is 4",
                        },
                      })}
                    />

                    <p className={classes.errors}>
                      {errors.description?.message}
                    </p>
                  </div>
                </div>

                <div className={classes.formButtonInputs}>
                  <button
                    className={classes.button}
                    onClick={handleSubmit(onFormSubmit)}
                  >
                    {ticketId ? "Update Request" : "Create Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRequest;
