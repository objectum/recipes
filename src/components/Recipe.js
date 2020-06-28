/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Action, StringField} from "objectum-react";
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
		let [recipeRecord, photoRecords, commentRecords, likes] = await Promise.all ([
			this.props.store.getRecord (this.state.id),
			this.props.store.getRecords ({
				model: "t.recipe.photo",
				filters: [
					["recipe", "=", this.state.id]
				]
			}),
			this.props.store.getRecords ({
				model: "t.recipe.comment",
				filters: [
					["recipe", "=", this.state.id]
				]
			}),
			this.loadLikes ()
		]);
		this.setState (Object.assign ({recipeRecord, photoRecords, commentRecords}, likes));
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
	
	onComment = async () => {
		await this.props.store.startTransaction ("new comment");
		await this.props.store.createRecord ({
			_model: "t.recipe.comment",
			recipe: this.state.id,
			date: new Date (),
			user: this.props.store.userId,
			text: this.state.text
		});
		await this.props.store.commitTransaction ("new comment");
		this.setState ({
			text: "",
			commentRecords: await this.props.store.getRecords ({
				model: "t.recipe.comment",
				filters: [
					["recipe", "=", this.state.id]
				]
			})
		});
	}
	
	renderComments () {
		return (
			<div className="mt-4">
				<h5 className="font-weight-bold">Комментарии: {this.state.commentRecords.length}</h5>
				{this.state.commentRecords.map ((record, i) => {
					let userRecord = this.props.store.dict ["objectum.user"][record.user];
					
					return (
						<div key={i} className="mt-2">
							<div className="font-weight-bold">{userRecord.name}</div>
							<div className="font-italic">{record.date.toLocaleString ()}</div>
							<div>{record.text}</div>
						</div>
					);
				})}
				<div className="mt-2">
					<StringField onChange={({value}) => this.setState ({text: value})} placeholder="Добавить комментарий" />
					{this.props.store.roleCode == "user" ? <Action
						className="mt-1" btnClassName="btn btn-outline-primary"
						label="Отправить" icon="fas fa-plus" onClick={this.onComment}
						disabled={!this.state.text}
					/> :
					<Link className="btn btn-outline-info mt-1" to="/office">Необходимо авторизоваться</Link>}
				</div>
			</div>
		);
	}
	
	render () {
		if (!this.state.recipeRecord) {
			return null;
		}
		let record = this.state.recipeRecord;
		
		return (
			<div className="p-1">
				<div className="d-flex overflow-auto p-1 border">
					{this.state.photoRecords.map ((photo, i) => {
						return (
							<div key={i} className="">
								<a href={photo.getRef ("photo")} target="_blank" rel="noopener noreferrer">
									<img src={photo.getRef ("thumbnail")} width={200} height={200} alt={photo.name || ""} />
								</a>
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
					{this.renderComments ()}
				</div>
			</div>
		);
	}
};
Recipe.displayName = "Recipe";

export default Recipe;
