# "Plan your Day"-Backend Changelog 

## Unreleased

### Added
- Add an error-text for a full mealtime.
- Add commit hooks.

### Changed
- Fix typo in Spaghetti
- Change log-levels of some messages.
- Fix test of mail-server. 

### Removed

## [1.2.0] - 2020-02-21
### Added
 - Add route to display logs.
 - Add option to stay logged in.
 - Add musli and jam-bread recipe.
 - Add mealtime- and difficulty controller.
 - Add route to filter recipes in recipe-controller.
 - Add route to update a recipe.
 - Add tests to recipe-, mealtimes- and difficulty-controller.
 - Add success message after a user has registered.
 - Add route to show changelog.
 - Add info about the current build to the log.
 - Add User-Dtos to transfer only the important data.
 - Add tests to log- and util-controller.
 - Add user-id to logs.
 - Add helptexts to game.
 - Add short description to some recipes.
 
## Changed
 - Fix date format in forgot password mail.
 - Fix 'password' typo in password-reset controller.
 - Fix running tests with test database.
 - Change data, that is seeded in production.
 - Fix wrong response in password-reset controller.
 - Remove sensitive data from request bodies.
 - Remove sensitive data from being logged.
 - Fix duplicate email error when updating profile.
 - Fix invalid json in response.
 - Load therapist or patient instead of user if user-information is requested.
 
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
