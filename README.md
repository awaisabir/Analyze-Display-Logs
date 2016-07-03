# Analyze-Display-Logs

This is a web-app that takes in log entries from a log file in the form:

"Feb 17 12:46:02 mycomputername theservice:  This is the log message"

The app allows users to upload log files, which is stored onto an underlying database (mongoDB). The logs are also stored under the same database. The user then searches amongst the files, the stored logs that are then outputted based on the user's queries. The app gives the user three different routes to take (via a drop-down menu) regarding the results of their query. The user can either:

- Visualize the logs in a text box.
- Display the information in a form of a bar-chart.
- Download the result in the form of a text (.txt) file.

This web-app was built using nodeJS as the back-end (server-side), Express as the underlying framework for the server, jQuery to handle the various AJAX (Asynchronous JS And XML) requests, and Jade as the HTML templating engine.

Thank you for viewing this project,
Muhammad Awais Qureshi
