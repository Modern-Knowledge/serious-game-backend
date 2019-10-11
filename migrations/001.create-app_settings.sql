CREATE TABLE IF NOT EXISTS `serious-game`.`app_settings`
(
    `id`          INT(11)   NOT NULL AUTO_INCREMENT,
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;