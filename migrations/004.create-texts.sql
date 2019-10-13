CREATE TABLE IF NOT EXISTS `texts`
(
    `id`          INT(11)     NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(45) NOT NULL,
    `text`        LONGTEXT    NOT NULL,
    `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP   NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;
