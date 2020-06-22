/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React from "react";
import {Record} from "objectum-client";

class RecipeLikeModel extends Record {
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
				"like"
			],
			[
				"dislike"
			]
		];
	}
};

export default RecipeLikeModel;
