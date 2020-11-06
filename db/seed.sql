-- Seeds for employee_trackerDB SQL table --
USE employee_trackerDB;

-- Inserting Departments into department list --
INSERT INTO department (id, name)
VALUES 
(1, "Sales"), 
(2, "Engineering"), 
(3, "Finance"), 
(4, "Legal");

-- Inserting title & salary into role list --
INSERT INTO roles (id, title, salary, department_id)
VALUES 
(1, "Sales Manager", 80000, 1), 
(2, "Salesperson", 30000, 1), 
(3, "Head Engineer", 100000, 2), 
(4, "Software Engineer", 80000, 2), 
(5, "Account Manager", 80000, 3), 
(6, "Legal Consultant", 80000, 4);

-- Inserting employee's into employee_info list --
INSERT INTO employee_info (id, first_name, last_name, role_id, manager_id)
VALUES 
(1, "Jane", "Smith", 1, 1),
(2, "Tony", "Jones", 2, NULL), 
(3, "Alex", "Garcia", 3, 2), 
(4, "Pamela", "Fraser", 4, NULL), 
(5, "Lachlan", "Thomas", 5, 3), 
(6, "Mike", "Chan", 6, 4); 
