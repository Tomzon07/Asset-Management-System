import getUserPermission from "../../../../common-lib/checkuser";

const checkTicketLevel = (level, department) => {
  const user = getUserPermission();
  return (
    (user.permission.includes("MANAGER") && level === 2) ||
    (user.permission.includes("HEAD") && level === 3) ||
    (user.department.includes("ADMINISTRATION") &&
      user.permission.includes("HEAD") &&
      level === 4) ||
    (user.permission.includes("HEAD") &&
      user.department.includes(department) &&
      level === 5) ||
    (user.department.includes("FINANCE") &&
      user.permission.includes("HEAD") &&
      level === 6) ||
    (user.permission.includes("CEO") && level === 7) ||
    (user.department.includes("FINANCE") &&
      user.permission.includes("HEAD") &&
      level === 8)
  );
};
export default checkTicketLevel;
