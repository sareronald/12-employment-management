const logo = require("asciiart-logo");
const config = require("./package.json");
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const colors = require("colors");

// create the connection information for the sql database
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  port: "root",
  port: 3306,
  user: "root",
  password: "",
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
          "View All Employees by Manager",
          "Add Employee",
          "Add Department",
          "Add Role",
          "Remove Employee",
          "Update Employee Role",
          "Update Employee Manager",
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

        case "View All Employees by Manager":
          viewAllEmployeesByManager();
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
          updateEmployee();
          break;

        case "Update Employee Manager":
          updateManager();
          break;

        case "Quit":
          quit();
          break;
      }
    });
}

// View All Employees
function viewAllEmployees() {
  mysqlConnection.query("SELECT * FROM employee_info", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
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

// -- View All Employees by Manager OPTIONAL

// ADD DEPARTMENTS, ROLES, EMPLOYEES
// =====================================================================
// Add Employee
function addEmployee() {
  mysqlConnection.query(
    `SELECT employee_info.first_name, employee_info.last_name, roles.title
    FROM employee_info
    INNER JOIN roles
    ON employee_info.role_id = roles.id`
  ),
    (err, resRole) => {
      if (err) throw err;
      const employeeRole = resRole.map((roles) => roles.title);
      console.log(employeeRole);
    };

  mysqlConnection.query(
    `SELECT employee_info.first_name, employee_info.last_name,
  FROM employee_info
  INNER JOIN employee_info
  ON employee_info.id = employee_info.manager_id`
  ),
    (err, resManager) => {
      if (err) throw err;
      const managerId = resManager.filter(
        (manager) => manager.manager_id != NULL
      );
      console.log(managerId);
    };
  // prompt for user input: information on new employee
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the employee's first name?",
        validate: function (answer) {
          if (answer.length < 1) {
            return console.log("Please enter a valid name");
          }
          return true;
        },
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the employee's last name?",
        validate: function (answer) {
          if (answer.length < 1) {
            return console.log("Please enter a valid name");
          }
          return true;
        },
      },
      {
        name: "role",
        type: "rawlist",
        message: "What is the employee's role?",
        choices: managerId,
        // response.map((roles) => {
        //           return { name: roles.id + " " + roles.title, value: roles.id };
        //         }),
      },
      {
        name: "manager",
        type: "rawlist",
        message: "Who is the employee's manager?",
        choices: employeeRole,
        // response.filter((manager) => {
        //           return {
        //             name:
        //               employee_info.first_name +
        //               " " +
        //               employee_info.last_name,
        //             value: employee_info.manager_id,
      },
      // }),
      // },
    ])
    .then(function (answer) {
      mysqlConnection.query(
        "INSERT INTO employee_info SET ?",
        {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: answer.role,
          manager_id: answer.manager,
        },
        function (err) {
          if (err) throw err;
          console.log(
            `\n${answer.firstName} + " " + ${answer.lastName} has been added to the database...\n`
          );
        }
      );
      start();
    });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "Which DEPARTMENT would you like to add?",
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
            console.log("\nThis Department already exists\n".cyan);
            start();
          } else {
            // add new department to database in department table
            mysqlConnection.query(
              `INSERT INTO department SET ?`,
              {
                name: [answer.department],
              },
              function (err) {
                if (err) throw err;
                console.log(
                  `\n${answer.department} has been added to the database...\n`
                    .cyan
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
        message: "Which NEW ROLE would you like to enter?",
      },
    ])
    .then(function (answer) {
      mysqlConnection.query(`SELECT roles.title FROM roles`, (err, res) => {
        if (err) throw err;
        if (res.some((roles) => roles.title === [answer.newRole])) {
          console.log("\nThis role already exists\n");
          start();
        } else {
          mysqlConnection.query(`SELECT department.name FROM department`),
            (err, res) => {
              if (err) throw err;
              inquirer
                .prompt([
                  {
                    name: "salary",
                    type: "input",
                    message: "What is the salary of this role?",
                    // regex to check that the salary is a number
                    validate: (val) => /^\d+$/.test(val),
                  },
                  {
                    name: "department",
                    type: "input",
                    message: "Which Department does this role belong to?",
                    choices() {
                      return res.map((department) => department.name);
                    },
                  },
                ])
                .then((response) => {
                  mysqlConnection.query(
                    `SELECT id FROM department WHERE department.name = "${response.department}"`,
                    (err, res) => {
                      if (err) throw err;
                      mysqlConnection.query(`INSERT INTO role SET ?`, {
                        title: [response.newRole],
                        salary: [reponse.salary],
                        department_id: [response.department],
                      });
                    }
                  );
                });
            };
        }
      });
    });
}

// Update employee roles

// -- Update Employee Role OPTIONAL
// -- Update Employee Managers OPTIONAL
// -- Delete departments, roles and employees
function removeEmployee() {
  mysqlConnection.query(`SELECT id, first_name, last_name FROM employee`),
    (err, response) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "deleteEmployee",
            type: "list",
            message: "Which employee would you like to remove?",
            choices: response.map((employee_info) => {
              return {
                name:
                  employee_info.id +
                  " " +
                  employee_info.first_name +
                  " " +
                  employee_info.last_name,
                value: employee_info.id,
              };
            }),
          },
        ])
        .then((answer) => {
          console.log(answer);
          mysqlConnection.query(
            "DELETE FROM employee WHERE ?",
            { id: answer.deleteEmployee },
            (err, res) => {
              if (err) throw err;
              console.log(
                `\nThe following employee has been deleted from the database:\n`
              );
              console.log(res);
            }
          );
          start();
        });
    };
}
// // -- View total utilized budget

// Quit
function quit() {
  mysqlConnection.end();
  console.log(
    "Thanks for using this Employee Management System. See you again soon..."
      .bold.cyan
  );
}

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
