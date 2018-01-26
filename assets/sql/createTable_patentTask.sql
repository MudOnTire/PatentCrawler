CREATE TABLE `patent_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patent_id` varchar(45) NOT NULL,
  `patent_apply_number` varchar(45) DEFAULT NULL,
  `patent_title` varchar(1000) DEFAULT NULL,
  `is_done` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=202389 DEFAULT CHARSET=utf8