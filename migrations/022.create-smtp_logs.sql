CREATE TABLE IF NOT EXISTS `smtp_logs`
(
    `id`          INT(11)      NOT NULL AUTO_INCREMENT,
    `subject`     VARCHAR(255) NOT NULL,
    `body`        LONGTEXT     NOT NULL,
    `rcpt_email`  VARCHAR(100) NOT NULL,
    `simulated`   TINYINT(4)   NOT NULL,
    `sent`        TINYINT(4)   NOT NULL,
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP    NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;