CREATE TABLE IF NOT EXISTS `users`
(
    `id`                    INT(11)      NOT NULL AUTO_INCREMENT,
    `email`                 VARCHAR(255) NOT NULL,
    `password`              VARCHAR(255) NOT NULL,
    `forename`              VARCHAR(45)  NOT NULL,
    `lastname`              VARCHAR(45)  NOT NULL,
    `gender`                TINYINT      NULL,
    `last_login`            TIMESTAMP    NULL,
    `failed_login_attempts` INT(11)      NOT NULL DEFAULT '0',
    `login_cooldown`        TIMESTAMP    NULL     DEFAULT NULL,
    `status`                TINYINT(4)   NOT NULL,
    `resetcode`             INT(11)      NULL,
    `resetcode_validuntil`  DATETIME        NULL     DEFAULT NULL,
    `created_at`            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`           TIMESTAMP    NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;
