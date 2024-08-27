# MyMoney - Expense and Income Tracker

## Project Overview

MyMoney is a Single Page Application (SPA) designed to help users track their expenses and incomes efficiently. Built with Django on the backend and JavaScript on the frontend, the application is mobile-responsive and features dynamic data visualization using an open-source JavaScript library called eCharts. The app allows users to add, view, and analyze their financial data, providing a user-friendly interface.

MyMoney is a comprehensive financial management tool that goes beyond basic CRUD operations, integrating complex functionalities like data filtering and dynamic rendering.

## Distinctiveness and Complexity

MyMoney is distinctly different from other projects in the course due to its focus on personal finance management. Unlike the social network project or the e-commerce project, this project is designed to help users manage their finances. The project’s focus on data tracking and analysis sets it apart from the other projects.

The complexity of MyMoney lies in its dynamic features and data handling capabilities. The application allows users to add and delete expenses, and then view the data in a comprehensive analysis section. This section includes data visualization using eCharts, which dynamically updates based on user input, filtering by month and year, only including in the filters the periods where the user had expenses, comparing categories and payment methods.

Income can also be added, deleted, and compared against expenses for each month in the summary section.

This required careful handling of data and implementation of JavaScript functions to ensure seamless interactions with users. Using Django for backend processing, including model management and API creation, added further complexity to the project.

In addition, the app is mobile-friendly, ensuring that it can be accessed and used effectively on both desktop and mobile devices. This required a deep understanding of CSS, SASS, and Bootstrap to create a flexible and responsive design.

## File Overview

The project consists of two main directories: the project directory named `moneyproject` and the application directory named `mymoney`. At the same level as these directories, there is a `manage.py` file and a `.gitignore` file, which is configured to ignore the SQLite database from Git tracking.

### `mymoney` Directory Structure:
- **static/mymoney/**: Contains the styling files written in SASS and a JavaScript file called `expense.js`, which handles the dynamic aspects of the front end.
- **templates/mymoney/**: Holds the HTML templates, including `login.html`, `register.html`, `layout.html`, and `index.html`. These files are used to render the different pages of the application.
- **views.py**: This file contains all the logic for handling requests, processing data, and rendering templates.
- **urls.py**: Manages the URL routing for both the application pages and the APIs, linking user requests to the appropriate views.

## How to Run MyMoney

1. To get started, we’ll have to install Django, which means you’ll also have to [install pip](https://pip.pypa.io/en/stable/installation/) if you haven’t already done so.
2. Once you have Pip installed, you can run `pip3 install Django` in your terminal to install Django.
3. Clone the repository to your local machine.
4. Make migrations and migrate by running the following commands in your terminal:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
4. Run the Django server:
   ```bash
   python manage.py runserver
6. Open your browser and navigate to http://127.0.0.1:8000/mymoney to access the application.

## Additional Information

- **eCharts Documentation**: The data visualization in MyMoney is powered by the open-source JavaScript library eCharts. For more information on how to use eCharts, you can refer to the official documentation:
  - [eCharts Documentation](https://echarts.apache.org/en/option.html#title)
  - [eCharts examples](https://echarts.apache.org/examples/en/index.html)

These resources provide comprehensive guides and examples for integrating eCharts into web applications. By utilizing eCharts, MyMoney leverages powerful charting capabilities to enhance the financial data analysis features of the application.

