CREATE TABLE `saved_meals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`calories` integer NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`image_uri` text,
	`meal_type` text NOT NULL,
	`created_at` text NOT NULL
);
