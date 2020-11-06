const config = require("./package.json");
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",
  port: "root",
  port: 3306,
  user: "root",
  password: "",
  database: "employee_trackerDB",
});

// connection to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  // run the start function after the connection is made to prompt the user
  start();
});

// asciiart-logo displays to start
console.log(
  logo({
    name: "Employee Tracker",
    font: "ANSI Shadow",
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
        case "View all Employees":
          viewAllEmployees();
          break;

        case "View all Employees by Department":
          viewAllEmployeesByDept();
          break;

        case "View all Employees by Manager":
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
          connection.end();
          break;
      }
    });
}

// View All Employees
function viewAllEmployees() {
  connection.query("SELECT * FROM employee_info", (err, res) => {
    if (err) throw err;
    console.log(res);
    start();
  });
}

// View All Employees by Department
// function viewAllEmployeesByDept() {
//   connection.query("SELECT ");
// }
// View All Employees by Manager
// Add Employee
// Remove Employee
// Update Employee Role
// Update Employee Manager
