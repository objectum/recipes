/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React from "react";
import {Record} from "objectum-client";

class RecipeCommentModel extends Record {
	static _renderGrid ({grid, store}) {
		return React.cloneElement (grid, {
			label: ""
		});
	}
	
	static _layout () {
		return [
			"id",
			[
				"recipe"
			],
			[
				"user"
			],
			[
				"date"
			],
			[
				"text"
			]
		];
	}
};

export default RecipeCommentModel;
