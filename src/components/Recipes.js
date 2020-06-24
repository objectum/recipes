/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Link} from "react-router-dom";
import {StringField, Action, Pagination} from "objectum-react";
import RecipeModel from "../models/RecipeModel";

class Recipes extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			page: 0,
			pageRecs: 10
		};
	}
	
	async load ({page, search, user, recipes, like} = {}) {
		let state = {
			page: page === undefined ? this.state.page : page,
			search: this.state.search,
			user: this.state.user,
			recipes: this.state.recipes,
			like: this.state.like
		};
		let filters = [];
		
		if (search || user || recipes) {
			Object.assign (state, {search, user, recipes, like});
			
			if (!search) {
				state.searchValue = "";
			}
		}
		if (state.search) {
			filters.push (["name", "like", "%" + state.search]);
		}
		if (state.user) {
			filters.push (["user", "=", state.user]);
		}
		if (state.recipes) {
			filters.push (["id", "in", state.recipes]);
		}
		let data = await this.props.store.getData ({
			model: "recipe",
			offset: state.page * this.state.pageRecs,
			limit: this.state.pageRecs,
			filters
		});
		let recipeRecs = data.recs;
		
		recipes = recipeRecs.map (rec => rec.id);
		
		let [photoRecords, comments, likes] = await Promise.all ([
			this.props.store.getRecords ({
				model: "t.recipe.photo",
				filters: [
					["recipe", "in", recipes]
				]
			}),
			this.loadComments (recipes),
			this.loadLikes (recipes)
		]);
		this.setState (Object.assign (state, {recipeRecs, length: data.length, photoRecords}, comments, likes));
	}
	
	async componentDidMount () {
		await this.load ();
	}
	
	getLikes (id) {
		let rec = this.state.likeMap [id];
		
		return rec ? rec.like : 0;
	}
	
	getDislikes (id) {
		let rec = this.state.likeMap [id];
		
		return rec ? rec.dislike : 0;
	}
	
	async loadLikes (recipes) {
		let likeRecs = await this.props.store.getRecs ({
			query: "recipe.like",
			filters: [
				["recipe", "in", recipes]
			]
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
	
	async loadComments (recipes) {
		let commentRecs = await this.props.store.getRecs ({
			query: "recipe.comment",
			filters: [
				["recipe", "in", recipes]
			]
		});
		let commentMap = {};
		
		commentRecs.forEach (rec => commentMap [rec.recipe] = rec.num);
		
		return {commentRecs, commentMap};
	}
	
	showLikes = async (like) => {
		let likeRecs = await this.props.store.getRecs ({
			model: "t.recipe.like",
			filters: [
				["user", "=", this.props.store.userId]
			]
		});
		likeRecs = likeRecs.filter (rec => {
			return (rec.like && like) || (rec.dislike && !like);
		});
		let recipes = likeRecs.map (rec => rec.recipe);
		
		await this.load ({recipes: recipes.length ? recipes : [0], like});
	}
	
	renderRecipe (rec) {
		let photos = this.state.photoRecords.filter (photo => photo.recipe == rec.id);

		return (
			<div key={rec.id} className="border p-1 mr-1 mb-1 card">
				<div className="">
					<Link className="btn btn-link text-left pt-0 pb-1 px-0 font-weight-bold" to={`/recipe/${rec.id}`}>{rec.name}</Link>
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
						{rec.user && <div className="">
							<i className="fas fa-user card-icon mr-2" />{this.props.store.dict ["objectum.user"][rec.user].name}
						</div>}
						{rec.duration && <div className="">
							<i className="fas fa-clock card-icon mr-2" />{rec.duration} мин.
						</div>}
						<div className="">
							<i className="fas fa-calendar-alt card-icon mr-2" />{rec.date.toLocaleDateString ()}
						</div>
						<div>
							<i className="fas fa-comment-alt card-icon mr-2" />{this.state.commentMap [rec.id] || 0}
						</div>
						<div className="mt-2 d-flex align-items-center">
							<Action btnClassName="btn btn-outline-primary" onClick={async () => await this.onLike (true, rec.id)}><i className="fas fa-thumbs-up" /></Action>
							<div className="px-2">{this.getLikes (rec.id)}</div>
							<Action btnClassName="btn btn-outline-danger" onClick={async () => await this.onLike (false, rec.id)}><i className="fas fa-thumbs-down" /></Action>
							<div className="px-2">{this.getDislikes (rec.id)}</div>
						</div>
						{rec.user == this.props.store.userId && <Link className="btn btn-outline-info mt-2" to={`/model_record/${rec.id}#{"opts":{"model":"recipe"}}`}><i className="fas fa-edit mr-1" />Изменить</Link>}
					</div>
				</div>
			</div>
		);
	}
	
	renderToolbar () {
		let isUser = this.props.store.roleCode == "user";
		
		return (
			<div className="row flex-row mb-1">
				<StringField placeholder="Поиск" value={this.state.searchValue} onChange={({value}) => this.setState ({searchValue: value})} />
				<Action
					className="ml-1" disabled={!this.state.searchValue} onClick={async () => await this.load ({search: this.state.searchValue})}
					btnClassName={`btn btn-primary btn-labeled mr-1 mb-1 ${this.state.search ? "active" : ""}`}
				><i className="fas fa-search mr-1" />Найти</Action>
				{isUser && <Action
					onClick={async () => await this.load ({user: this.props.store.userId})}
					btnClassName={`btn btn-primary btn-labeled mr-1 mb-1 ${this.state.user ? "active" : ""}`}
				><i className="fas fa-edit mr-1" />Мои рецепты</Action>}
				{isUser && <Action
					onClick={async () => await this.showLikes (true)}
					btnClassName={`btn btn-primary btn-labeled mr-1 mb-1 ${this.state.like === true ? "active" : ""}`}
				><i className="fas fa-thumbs-up" /></Action>}
				{isUser && <Action
					onClick={async () => await this.showLikes (false)}
					btnClassName={`btn btn-primary btn-labeled mr-1 mb-1 ${this.state.like === false ? "active" : ""}`}
				><i className="fas fa-thumbs-down" /></Action>}
			</div>
		);
	}
	
	renderRecipes () {
		let recipes = this.state.recipeRecs.map (rec => {
			return this.renderRecipe (rec);
		});
		return (
			<div className="row flex-row">
				{recipes}
			</div>
		);
	}
	
	renderPagination () {
		if (this.state.length < this.state.pageRecs) {
			return null;
		}
		let items = [];
		
		for (let i = 0; i < this.state.length / this.state.pageRecs; i ++) {
			items.push (i + 1);
		}
		return (
			<div className="mt-2">
				<Pagination items={items} active={this.state.page} onChange={async (page) => {
					await this.load ({page});
				}} />
			</div>
		);
	}
	
	render () {
		if (!this.state.recipeRecs) {
			return null;
		} else {
			return (
				<div className="container">
					<div className="pl-1 pt-1">
						{this.renderToolbar ()}
						{this.renderRecipes ()}
						{this.renderPagination ()}
					</div>
				</div>
			);
		}
	}
};
Recipes.displayName = "Recipes";

export default Recipes;
