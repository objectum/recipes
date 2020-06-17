let $o = require ("../../../server/objectum");

$o.db.execute ({
	code: "recipes",
	fn: "import",
	file: "schema-objectum.json"
});
