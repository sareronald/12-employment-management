const logo = require("asciiart-logo");
const config = require("./package.json");
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");

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
// why doesn't SELECT * from employee_info work?
function viewAllEmployees() {
  mysqlConnection.query("SELECT * FROM employee_info", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// // View All Employees by Department
function viewAllEmployeesByDept() {
  console.log("Selecting all Employees by Department...\n");
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
              console.log(`The employees in the ${answer.deptChoice} are: \n`);
              console.table(res);
            }
          );
          start();
        });
    }
  );
}

// Add Employee
function addEmployee() {
  // prompt for user input: information on new employee
  inquirer.prompt([
    {
      name: "firstName",
      type: "input",
      message: "What is the employee's first name?",
    },
    {
      name: "lastName",
      type: "input",
      message: "What is the employee's last name?",
    },
    {
      name: "role",
      type: "list",
      message: "What is the employee's role?",
      // choices: how do I get these from the database?
      // this will need to be converted to a role id?
    },
    {
      name: "manager",
      type: "list",
      message: "Who is the employee's manager?",
      // choices: how do I get these from the database?
      // this answer will need to be converted to a manager id?
    },
  ]);
}

// Add departments, roles, employees
// View departments, roles, employees
// Update employee roles
// -- View All Employees by Manager OPTIONAL
// -- Remove Employee OPTIONAL
// -- Update Employee Role OPTIONAL
// -- Update Employee Managers OPTIONAL
// -- Delete departments, roles and employees
// -- View total utilized budget

// Quit
function quit() {
  mysqlConnection.end();
}

// asciiart-logo displays to start
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
