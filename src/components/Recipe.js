/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Action} from "objectum-react";
import RecipeModel from "../models/RecipeModel";
import {Link} from "react-router-dom";

class Recipe extends Component {
	constructor (props) {
		super (props);
		
		this.state = {
			id: this.props.match.params.id
		};
	}
	
	async componentDidMount () {
		let state = {};
		
		state.recipeRecord = await this.props.store.getRecord (this.state.id);
		state.photoRecords = await this.props.store.getRecords ({
			model: "t.recipe.photo",
			filters: [
				["recipe", "=", this.state.id]
			]
		});
		Object.assign (state, await this.loadLikes ());
		
		this.setState (state);
	}
	
	async loadLikes () {
		let likeRecs = await this.props.store.getRecs ({
			model: "t.recipe.like",
			filters: [
				["recipe", "=", this.state.id]
			]
		});
		let likeNum = 0;
		let dislikeNum = 0;
		
		likeRecs.forEach (rec => {
			if (rec.like) {
				likeNum ++;
			}
			if (rec.dislike) {
				dislikeNum ++;
			}
		});
		return {likeRecs, likeNum, dislikeNum};
	}
	
	onLike = async (like, id) => {
		await RecipeModel.like (this.props.store, like ,id);
		this.setState (await this.loadLikes ());
	}
	
	render () {
		if (!this.state.recipeRecord) {
			return <div />;
		}
		let record = this.state.recipeRecord;
		
		return (
			<div className="p-1">
				<div className="d-flex overflow-auto p-1 border">
					{this.state.photoRecords.map ((photo, i) => {
						return (
							<div key={i} className="">
								<img src={photo.getRef ("photo")} width={200} height={200} alt={photo.name || ""} />
							</div>
						);
					})}
				</div>
				<div className="mt-1 p-1 border">
					<h5 className="font-weight-bold my-2">{record.name}</h5>
					{record.user && <div className="">
						<i className="fas fa-user menu-icon mr-2" />{this.props.store.dict ["objectum.user"][record.user].name}
					</div>}
					{record.duration && <div className="">
						<i className="fas fa-clock menu-icon mr-2" />{record.duration} мин.
					</div>}
					<div className="">
						<i className="fas fa-calendar-alt menu-icon mr-2" />{record.date.toLocaleString ()}
					</div>
					<div className="my-2 p-1 d-flex align-items-center">
						<Action btnClassName="btn btn-outline-primary" onClick={async () => await this.onLike (true, record.id)}><i className="fas fa-thumbs-up" /></Action><span className="px-2 like">{this.state.likeNum}</span>
						<Action btnClassName="btn btn-outline-danger" onClick={async () => await this.onLike (false, record.id)}><i className="fas fa-thumbs-down" /></Action><span className="px-2 like">{this.state.dislikeNum}</span>
						{record.user == this.props.store.userId && <Link className="btn btn-outline-info" to={`/model_record/${record.id}#{"opts":{"model":"recipe"}}`}><i className="fas fa-edit" /></Link>}
					</div>
					<div dangerouslySetInnerHTML={{__html: record.cooking}} />
				</div>
			</div>
		);
	}
};
Recipe.displayName = "Recipe";

export default Recipe;
