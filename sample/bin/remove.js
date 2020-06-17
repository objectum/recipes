let $o = require ("../../../server/objectum");

$o.db.execute ({
	code: "recipes",
	fn: "remove"
});
