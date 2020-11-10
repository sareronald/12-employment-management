const logo = require("asciiart-logo");
const config = require("./package.json");
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const colors = require("colors");
let tempEmployee = {};
let tempRole = {};
let tempUpdateEmployee = {};

// create the connection information for the sql database
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  port: "root",
  port: 3306,
  user: "root",
  password: "tereala1982",
  database: "employee_trackerDB",
});

// connection to the mysql server and sql database
mysqlConnection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + mysqlConnection.threadId + "\n");
  // run the start function after the connection is made to prompt the user
  title();
  start();
});

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt([
      {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Employees by Department",
          "View All Employees by Role",
          "Add Employee",
          "Add Department",
          "Add Role",
          "Remove Employee",
          "Update Employee Role",
          "Quit",
        ],
      },
    ])
    .then(function (answer) {
      switch (answer.action) {
        case "View All Employees":
          viewAllEmployees();
          break;

        case "View All Employees by Department":
          viewAllEmployeesByDept();
          break;

        case "View All Employees by Role":
          viewAllEmployeesByRole();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Quit":
          quit();
          break;
      }
    });
}
// employee_info.id, employee_info.first_name, employee_info.last_name, roles.title, roles.salary,
// View All Employees
function viewAllEmployees() {
  mysqlConnection.query(
    `SELECT employee_info.id, employee_info.first_name, employee_info.last_name, department.name AS dept_name, roles.title AS role, roles.salary
    FROM employee_info
    INNER JOIN roles 
    ON employee_info.role_id = roles.id
    INNER JOIN department 
    ON roles.department_id = department.id
    ORDER BY roles.id`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

// View All Employees by Department
function viewAllEmployeesByDept() {
  console.log(`\nSelecting all Employees by Department...\n`.cyan);
  mysqlConnection.query(
    "SELECT department.name FROM department",
    (err, response) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "deptChoice",
            type: "rawlist",
            message: "Which Department would you like to view employees for?",
            choices() {
              return response.map((department) => department.name);
            },
          },
        ])
        .then((answer) => {
          // get information/employees of the chosen dept
          // const chosenDept = response.filter((department) => department.name === answer.choices)
          mysqlConnection.query(
            `SELECT employee_info.id, employee_info.first_name, employee_info.last_name, roles.title 
            FROM employee_info, roles, department
            WHERE employee_info.role_id = roles.id AND roles.department_id = department.id AND department.name = ?`,
            [answer.deptChoice],
            (err, res) => {
              if (err) throw err;
              console.log(
                `\n The employees in the ${answer.deptChoice} Department are: \n`
                  .cyan
              );
              console.table(res);
              start();
            }
          );
        });
    }
  );
}

// View All Employees by Role
function viewAllEmployeesByRole() {
  console.log(`\nSelecting all Employees and their roles...\n`.cyan);
  mysqlConnection.query(
    `SELECT employee_info.id, employee_info.first_name, employee_info.last_name, roles.title AS role 
    FROM employee_info
    INNER JOIN roles
    ON employee_info.role_id = roles.id`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}
// -- View All Employees by Manager OPTIONAL

// ADD DEPARTMENTS, ROLES, EMPLOYEES
// =====================================================================
// Add Employee
function addEmployee() {
  // prompt for user input: information on new employee
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the employee's first name?",
        // response MUST contain letters
        validate: (val) => /^[A-Za-z\s]+$/.test(val),
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the employee's last name?",
        // response MUST contain letters
        validate: (val) => /^[A-Za-z\s]+$/.test(val),
      },
    ])
    .then((answer) => {
      tempEmployee = { ...tempEmployee, ...answer };
      // query all existing roles from the database to fill the role choices
      mysqlConnection.query(
        `SELECT roles.id, roles.title FROM roles`,
        (err, responseRole) => {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: "employeeRole",
                type: "rawlist",
                message: "What is the employee's role?",
                choices: responseRole.map((roles) => {
                  return {
                    name: roles.title,
                    value: roles.id,
                  };
                }),
              },
            ])
            .then((answer) => {
              tempEmployee = { ...tempEmployee, ...answer };
              // get all existing employees from database so manager selection can be filled
              mysqlConnection.query(
                `SELECT employee_info.id, employee_info.first_name, employee_info.last_name, employee_info.manager_id FROM employee_info`,
                // `SELECT employee_info.id, employee_info.first_name, employee_info.last_name, employee_info.manager_id, roles.id, roles.title AS role
                // FROM employee_info
                // INNER JOIN roles ON employee_info.role_id = roles.id`,
                (err, resManager) => {
                  if (err) throw err;
                  inquirer
                    .prompt([
                      {
                        name: "manager",
                        type: "rawlist",
                        message: "Who is the employee's manager?",
                        choices: resManager
                          .filter((manager) => {
                            return manager.manager_id != null;
                          })
                          .map((manager) => {
                            return {
                              name:
                                manager.first_name + " " + manager.last_name,
                              value: manager.id,
                            };
                          }),
                      },
                    ])
                    .then((answer) => {
                      tempEmployee = { ...tempEmployee, ...answer };
                      // add new employee to database
                      mysqlConnection.query(
                        `INSERT INTO employee_info SET ?`,
                        {
                          first_name: tempEmployee.firstName,
                          last_name: tempEmployee.lastName,
                          role_id: tempEmployee.employeeRole,
                          manager_id: tempEmployee.manager,
                        },
                        (err) => {
                          if (err) throw err;
                          console.log(
                            `\nA new Employee has been successfully added to the database...`
                              .yellow
                          );
                          start();
                        }
                      );
                    });
                }
              );
            });
        }
      );
    });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "Which department would you like to add?",
      },
    ])
    .then((answer) => {
      mysqlConnection.query(
        `SELECT department.name FROM department`,
        (err, res) => {
          if (err) throw err;
          // if department already exists,
          if (
            res.some((department) => department.name === `${answer.department}`)
          ) {
            console.log("\nThis Department already exists\n".yellow);
            start();
          } else {
            // add new department to database in department table
            mysqlConnection.query(
              `INSERT INTO department SET ?`,
              {
                name: [answer.department],
              },
              (err) => {
                if (err) throw err;
                console.log(
                  `\n${answer.department} has been added to the database...\n`
                    .yellow
                );
                start();
              }
            );
          }
        }
      );
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        name: "newRole",
        type: "input",
        message: "Which new role would you like to enter?",
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary of this role?",
        // regex to check that the salary is a number
        validate: (val) => /^\d+$/.test(val),
      },
    ])
    .then((answer) => {
      tempRole = { ...tempRole, ...answer };
      // mysqlConnection.query(`SELECT roles.title FROM roles`, (err, res) => {
      //   if (err) throw err;
      // if (res.some((roles) => roles.title === [answer.newRole])) {
      //   console.log("\nThis role already exists\n");
      //   start();
      // } else {
      mysqlConnection.query(
        `SELECT department.id, department.name FROM department`,
        (err, resdept) => {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: "department",
                type: "rawlist",
                message: "Which Department does this role belong to?",
                choices: resdept.map((department) => {
                  return {
                    name: department.name,
                    value: department.id,
                  };
                }),
              },
            ])
            .then((answer) => {
              tempRole = { ...tempRole, ...answer };
              // mysqlConnection.query(
              //   `SELECT id FROM department WHERE department.name = "${response.department}"`,
              //   (err, res) => {
              //     if (err) throw err;
              mysqlConnection.query(
                `INSERT INTO roles SET ? WHERE ?`,
                // WHERE department.name = the chosen department id = answer.department
                {
                  title: tempRole.newRole,
                  salary: tempRole.salary,
                  department_id: tempRole.department,
                },
                (err) => {
                  if (err) throw err;
                  console.log(
                    `\nA new Role has been added to the database...\n`.yellow
                  );
                  start();
                }
              );
            });
        }
      );
      // }
      // });
    });
}

// UPDATE EMPLOYEE ROLES
// =====================================================================
function updateEmployeeRole() {
  // get all existing employees from database
  mysqlConnection.query(
    "SELECT employee_info.id, employee_info.first_name, employee_info.last_name FROM employee_info",
    (err, response) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "whichEmployee",
            type: "rawlist",
            message: "Which employee would you like to update?",
            choices: response.map((employee) => {
              return {
                name:
                  employee.id +
                  " " +
                  employee.first_name +
                  " " +
                  employee.last_name,
                value: employee.id,
              };
            }),
          },
        ])
        .then((answer) => {
          tempUpdateEmployee = { ...tempUpdateEmployee, ...answer };
          // ask the user to select the role they wish to update the employee to
          mysqlConnection.query(
            "SELECT roles.id, roles.title FROM roles",
            (err, res) => {
              if (err) throw err;
              inquirer
                .prompt([
                  {
                    name: "updateRole",
                    type: "rawlist",
                    message: "Which role would you like to update them to?",
                    choices() {
                      return res.map((roles) => roles.title);
                    },
                  },
                ])
                .then((answer) => {
                  tempUpdateEmployee = { ...tempUpdateEmployee, ...answer };
                  //  update role to database
                  mysqlConnection.query(
                    `UPDATE employee_info SET ? WHERE ?`,
                    [
                      { role_id: answer.tempUpdateEmployee },
                      { id: answer.tempUpdateEmployee },
                    ],
                    (err) => {
                      if (err) throw err;
                      console.log(
                        `Employee role has been successfully updated...`.yellow
                      );
                      start();
                    }
                  );
                });
            }
          );
        });
    }
  );
}

// REMOVE EMPLOYEES
// =====================================================================
function removeEmployee() {
  mysqlConnection.query(
    `SELECT employee_info.id, employee_info.first_name, employee_info.last_name 
    FROM employee_info`,
    // ),
    (err, response) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "deleteEmployee",
            type: "rawlist",
            message: "Which employee would you like to remove?",
            choices: response.map((employee) => {
              return {
                name:
                  employee.id +
                  " " +
                  employee.first_name +
                  " " +
                  employee.last_name,
                value: employee.id,
              };
            }),
          },
        ])
        .then((answer) => {
          console.log(answer);
          mysqlConnection.query(
            "DELETE FROM employee_info WHERE ?",
            { id: answer.deleteEmployee },
            (err, res) => {
              if (err) throw err;
              console.log(
                `\nThe chosen employee has been deleted from the database...\n`
                  .yellow
              );
              start();
            }
          );
        });
    }
  );
}

// QUIT
// =====================================================================
function quit() {
  mysqlConnection.end();
  console.log(
    "Thanks for using this Employee Management System. See you again soon..."
      .bold.cyan
  );
}

// LOGO to initiate CMS
// =====================================================================
// // asciiart-logo displays to start
function title() {
  console.log(
    logo({
      name: "Employee Tracker",
      font: "Doom",
      lineChars: 5,
      padding: 2,
      margin: 3,
      borderColor: "grey",
      logoColor: "bold-green",
      textColor: "green",
    })
      .emptyLine()
      .center("Content Management System")
      .render()
  );
}

// OTHER
// =====================================================================
// -- View total utilized budget
// -- Update Employee Role OPTIONAL
// -- Update Employee Managers OPTIONAL
// -- Delete departments, roles and employees
