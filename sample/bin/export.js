let $o = require ("../../../server/objectum");

$o.db.execute ({
	code: "recipes",
	fn: "export",
	exceptRecords: ["recipe", "t"],
	file: "../schema/schema-recipes.json"
});
