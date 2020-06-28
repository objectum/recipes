/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import React, {Component} from "react";
import {Store} from "objectum-client";
import {ObjectumApp, ObjectumRoute, Navbar, Office, Loading} from "objectum-react";
import Recipes from "./components/Recipes";
import Recipe from "./components/Recipe";
import RecipeModel from "./models/RecipeModel";
import RecipePhotoModel from "./models/RecipePhotoModel";
import RecipeCommentModel from "./models/RecipeCommentModel";
import RecipeLikeModel from "./models/RecipeLikeModel";

import "./css/bootstrap.css";
import "objectum-react/lib/css/objectum.css";
import "objectum-react/lib/fontawesome/css/all.css";
import "./css/recipes.css";

const store = new Store ();

class App extends Component {
	constructor (props) {
		super (props);

		store.setUrl ("/api");
		
		store.register ("recipe", RecipeModel);
		store.register ("t.recipe.photo", RecipePhotoModel);
		store.register ("t.recipe.comment", RecipeCommentModel);
		store.register ("t.recipe.like", RecipeLikeModel);
		
		this.state = {
			name: process.env.REACT_APP_NAME || "Просторецепты"
		};
		window.store = store;
	}
	
	onConnect = async () => {
		if (!store.dict ["objectum.user"]) {
			await store.getDict ("objectum.user");
		}
		let state = {
			username: store.username,
			roleCode: store.roleCode
		};
		if (store.username != "guest" && store.userId) {
			state.userRecord = await store.getRecord (store.userId);
		}
		this.setState (state);
	}
	
	onDisconnect = async () => {
		await store.auth ({
			username: "guest",
			password: require ("crypto").createHash ("sha1").update ("guest").digest ("hex").toUpperCase ()
		});
	}
	
	onCustomRender = ({content, app, location}) => {
		if (!this.state.username) {
			return <Loading container />
		}
		if (this.state.roleCode === "guest" || this.state.roleCode === "user") {
			let items = [
				"back",
				{
					label: "Рецепты",
					icon: "fas fa-utensils",
					path: "/recipes"
				},
				...(store.roleCode == "user" ? [
					{
						label: "Добавить",
						icon: "fas fa-plus",
						path: '/model_record/new#{"opts":{"model":"recipe"}}'
					}
				] : []),
				{
					label: "Вход",
					icon: "fas fa-sign-in-alt",
					path: "/office"
				}
			];
			return (
				<div className="container shadow p-0">
					<Navbar className="navbar navbar-expand navbar-dark bg-dark" items={[
						{
							label: `${this.state.name}${this.state.username == "guest" ? "" : ` (${this.state.userRecord.name})`}`,
							path: "/"
						}
					]} />
					<Navbar expand iconsTop app={app} items={items}/>
					<div className="bg-white py-1">
						{content}
					</div>
				</div>
			);
		}
	}
	
	render () {
		let props = {
			store,
			locale: "ru",
			name: this.state.name,
			version: process.env.REACT_APP_VERSION,
			onCustomRender: this.onCustomRender,
			onConnect: this.onConnect,
			onDisconnect: this.onDisconnect,
			registration: true,
			username: "guest",
			password: require ("crypto").createHash ("sha1").update ("guest").digest ("hex").toUpperCase (),
			iconsTop: true
		};
		if (process.env.NODE_ENV === "development") {
			props.__username = "admin";
			props.__password = require ("crypto").createHash ("sha1").update ("admin").digest ("hex").toUpperCase ();
			props._username = "ivanov@ivanov.ivanov";
			props._password = require ("crypto").createHash ("sha1").update ("1").digest ("hex").toUpperCase ();
		}
		return (
			<ObjectumApp {...props}>
				<ObjectumRoute exact path="/" render={props => <Recipes {...props} store={store} />} />
				<ObjectumRoute exact path="/recipes" render={props => <Recipes {...props} store={store} />} />
				<ObjectumRoute exact path="/recipe/:id" render={props => <Recipe {...props} store={store} />} />
				<ObjectumRoute exact path="/office" render={props => <div className="p-3">
					<Office {...props} cardClassName="rounded p-3 border" store={store} name={this.state.name} siteKey="6LffszoUAAAAALAe2ghviS8wqitVKvsR1bFMwtcK" />
				</div>} />
			</ObjectumApp>
		);
	}
};

export default App;
		