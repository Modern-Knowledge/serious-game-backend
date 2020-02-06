## [1.1.0] - 2020-02-06
### Added
 - Add information about the application to the VersionController (os, node.js-version, commit).
 - Add route to check if database is reachable.
 - Add route to check if mail-server is reachable.
 - Add route to retrieve mysql-version.
 
### Changed
 - Change nodemailer configuration to support mail-server host as IP-Address.

## [1.0.0] - 2020-01-23
### Added
 - Add database connection.
 - Create ORM Framework for MySQL.
 - Add migrations for creating the database.
 - Add service to send mails.
 - Add seeds for populating the database.
 - Create routes for interacting with the api.
 - Add authentication to specified routes.
 - Add standard mail-texts.
 - Add code analysis time (runtime-analysis, ...)
 - Create middleware to check permission on special routes
 - Add request body validation to routes.
 - Create tests for all routes and functions.
