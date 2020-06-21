/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React from "react";
import {Record} from "objectum-client";

class RecipePhotoModel extends Record {
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
				"name"
			],
			[
				"photo"
			]
		];
	}
};

export default RecipePhotoModel;
