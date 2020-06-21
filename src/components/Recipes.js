/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Action} from "objectum-react";
import RecipeModel from "../models/RecipeModel";

class Recipes extends Component {
	constructor (props) {
		super (props);
		
		this.state = {};
	}
	
	async componentDidMount () {
		let state = {};
		
		state.recipeRecords = await this.props.store.getRecords ({
			model: "recipe"
		});
		state.photoRecords = await this.props.store.getRecords ({
			model: "t.recipe.photo"
		});
		Object.assign (state, await this.loadLikes ());
		
		this.setState (state);
	}
	
	getLikes (id) {
		let rec = this.state.likeMap [id];
		
		return rec ? rec.like : 0;
	}
	
	getDislikes (id) {
		let rec = this.state.likeMap [id];
		
		return rec ? rec.dislike : 0;
	}
	
	async loadLikes () {
		let likeRecs = await this.props.store.getRecs ({
			query: "recipe.like"
		});
		let likeMap = {};
		
		likeRecs.forEach (rec => likeMap [rec.recipe] = {like: rec.like || 0, dislike: rec.dislike || 0});
		
		return {likeRecs, likeMap};
	}
	
	onLike = async (like, id) => {
		await RecipeModel.like (this.props.store, like ,id);
		
		let {likeRecs, likeMap} = await this.loadLikes ();
		
		this.setState ({likeRecs, likeMap});
	}
	
	renderRecipe (record) {
		let photos = this.state.photoRecords.filter (photo => photo.recipe == record.id);

		return (
			<div key={record.id} className="border p-1 mr-1 mb-1 card">
				<div className="">
					<Link className="btn btn-link text-left pt-0 pb-1 px-0 font-weight-bold" to={`/recipe/${record.id}`}>{record.name}</Link>
				</div>
				<div className="d-flex">
					<div className="card-photo">
						<div className="overflow-auto">
							<div className="d-flex">
								{photos.map ((photo, i) => {
									return (
										<div key={i} className="">
											<img src={photo.getRef ("photo")} width={200} height={200} alt={photo.name || ""} />
										</div>
									);
								})}
							</div>
						</div>
					</div>
					<div className="card-info p-1">
						{record.user && <div className="">
							<i className="fas fa-user card-icon mr-2" />{this.props.store.dict ["objectum.user"][record.user].name}
						</div>}
						{record.duration && <div className="">
							<i className="fas fa-clock card-icon mr-2" />{record.duration} мин.
						</div>}
						<div className="">
							<i className="fas fa-calendar-alt card-icon mr-2" />{record.date.toLocaleDateString ()}
						</div>
{/*
						<div className="mt-2 d-table">
							<Action btnClassName="btn btn-outline-primary d-table-cell" onClick={async () => await this.onLike (true, record.id)}><i className="fas fa-thumbs-up" /></Action>
							<div className="px-2 d-table-cell align-middle">{this.getLikes (record.id)}</div>
							<Action btnClassName="btn btn-outline-danger d-table-cell" onClick={async () => await this.onLike (false, record.id)}><i className="fas fa-thumbs-down" /></Action>
							<div className="px-2 d-table-cell">{this.getDislikes (record.id)}</div>
						</div>
*/}
						<div className="mt-2 d-flex align-items-center">
							<Action btnClassName="btn btn-outline-primary" onClick={async () => await this.onLike (true, record.id)}><i className="fas fa-thumbs-up" /></Action>
							<div className="px-2">{this.getLikes (record.id)}</div>
							<Action btnClassName="btn btn-outline-danger" onClick={async () => await this.onLike (false, record.id)}><i className="fas fa-thumbs-down" /></Action>
							<div className="px-2">{this.getDislikes (record.id)}</div>
						</div>
						{record.user == this.props.store.userId && <Link className="btn btn-outline-info mt-2" to={`/model_record/${record.id}#{"opts":{"model":"recipe"}}`}><i className="fas fa-edit mr-1" />Изменить</Link>}
					</div>
				</div>
			</div>
		);
	}
	
	renderRecipes () {
		let recipes = this.state.recipeRecords.map (record => {
			return this.renderRecipe (record);
		});
		return (
			<div className="row flex-row">
				{recipes}
			</div>
		);
	}
	
	render () {
		if (!this.state.recipeRecords) {
			return (
				<div />
			);
		} else {
			return (
				<div className="container">
					<div className="pl-1 pt-1">
						{this.renderRecipes ()}
					</div>
				</div>
			);
		}
	}
};
Recipes.displayName = "Recipes";

export default Recipes;
