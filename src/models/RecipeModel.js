/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React from "react";
import {Record} from "objectum-client";

class RecipeModel extends Record {
	static _renderGrid ({grid, store}) {
		return React.cloneElement (grid, {
			label: "Рецепты"
		});
	}
	
	static _layout () {
		return {
			"Информация": [
				"id",
				[
					"name"
				],
				[
					"duration", "user", "date"
				],
				[
					"cooking"
				],
				[
					"t.recipe.photo"
				]
			],
			"Комментарии": [
				[
					"t.recipe.comment"
				]
			],
			"Лайки, дизлайки": [
				[
					"t.recipe.like"
				]
			]
		};
	}
	
	static _renderForm ({form, store}) {
		return React.cloneElement (form, {
			defaults: {
				date: new Date ()
			}
		});
	}
	
	static _renderField ({field, store}) {
		if (field.props.property === "date") {
			return React.cloneElement (field, {showTime: true});
		} else {
			return field;
		}
	}
	
	_renderField ({field, store}) {
		return RecipeModel._renderField ({field, store});
	}
	
	static async like (store, like, id) {
		if (store.roleCode != "user") {
			throw new Error ("Необходимо авторизоваться");
		}
		let records = await store.getRecords ({
			model: "t.recipe.like",
			filters: [
				["recipe", "=", id],
				["user", "=", store.userId]
			]
		});
		if (records.length) {
			let record = records [0];
			
			if ((like && !record.like) || (!like && !record.dislike)) {
				await store.startTransaction ("like");
				record.like = like;
				record.dislike = !like;
				await record.sync ();
				await store.commitTransaction ();
			}
		} else {
			await store.startTransaction ("like");
			await store.createRecord ({
				_model: "t.recipe.like",
				recipe: id,
				user: store.userId,
				date: new Date (),
				like,
				dislike: !like
			});
			await store.commitTransaction ();
		}
	}
	
};

export default RecipeModel;
