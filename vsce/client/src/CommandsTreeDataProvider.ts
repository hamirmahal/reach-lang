import * as keywords from './keywordDocumentation';
import * as path from 'path';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

const reach_icon = path.join(__filename, '..', '..', '..', 'images', 'reach-icon.svg');
const reach_icon_red = path.join(__filename, '..', '..', '..', 'images', 'reach-icon-red.svg');
const discord_icon = path.join(__filename, '..', '..', '..', 'images', 'discord-icon-small.png');
const github_icon = path.join(__filename, '..', '..', '..', 'images', 'github-icon-red.png');
const gist_icon = path.join(__filename, '..', '..', '..', 'images', 'github-icon-blue.png');

const makeTreeItem = (
	label: string, command: string, icon = reach_icon
) => {
	return makeLabeledTreeItem(
		label, label, command, icon
	);
};

const makeLabeledTreeItem = (label: string, title: string, command: string, icon = reach_icon) => {
	const t : TreeItem = new TreeItem(title, 0);
	t.command = {
		command: command,
		title: label,
		arguments: []
	};
	t.iconPath = {
		light: vscode.Uri.parse(icon) ,
		dark: vscode.Uri.parse(icon)
	};
	return t;
};

type Command = {
	label: string,
	title: string,
	command: string,
	// If any of the following three properties exist,
	// their value should be "true".
	commandsTreeDataProvider?: true,
	helpTreeDataProvider?: true,
	documentationTreeDataProvider?: true
};

const COMMANDS: Command[]
	= require('../../data/commands.json');
const COMMANDS_TREE_DATA = [];
const HELP_TREE_DATA = [];
const DOCUMENTATION_TREE_DATA = [];

COMMANDS.forEach(commandObject => {
	// Extract all the properties we might need from
	// the parameter.
	const {
		label, title, command,
		commandsTreeDataProvider,
		helpTreeDataProvider,
		documentationTreeDataProvider
	} = commandObject;

	if (commandsTreeDataProvider) {
		COMMANDS_TREE_DATA.push(
			makeTreeItem(label, command)
		);
	}

	else if (helpTreeDataProvider) {
		let icon = `Error: Icon needed for ${label}`;

		switch (label) {
			case 'discord':
				icon = discord_icon;
				break;
			case 'gist':
				icon = gist_icon;
				break;
			case 'issue':
				icon = github_icon
				break;
		};

		HELP_TREE_DATA.push(
			makeLabeledTreeItem(
				label, title, command, icon
			)
		);
	}

	else if (documentationTreeDataProvider) {
		// All documentation tree items will have the
		// same icon.
		DOCUMENTATION_TREE_DATA.push(
			makeLabeledTreeItem(
				label, title, command, reach_icon_red
			)
		);
	}
});

export class CommandsTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {

	data: vscode.TreeItem[];

	constructor() {
		this.data = COMMANDS_TREE_DATA;
	}

	getTreeItem(element: TreeItem) {
		return element;
	}

	getChildren(_?: TreeItem|undefined) {
		return this.data;
	}
}

export class HelpTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {

	data: vscode.TreeItem[];

	constructor() {
		this.data = HELP_TREE_DATA;
	}

	getTreeItem(element: TreeItem) {
		return element;
	}

	getChildren(_?: TreeItem|undefined) {
		return this.data;
	}
}

// https://github.com/reach-sh/reach-ide/tree/docs
// Thank you, Chris Nevers.
const MAKE_DOCUMENTATION_TREE_ITEM = (
	id: string,
	userFacingTitle: string | vscode.TreeItemLabel
) => {
	const treeItem = new TreeItem(
		userFacingTitle,
		vscode.TreeItemCollapsibleState.Collapsed
	);
	treeItem.id = id;
	return treeItem;
};

export class DocumentationTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {

	data: vscode.TreeItem[];

	constructor() {
		this.data = [
			...DOCUMENTATION_TREE_DATA,
			MAKE_DOCUMENTATION_TREE_ITEM(
				'appinit', 'App Init'
			),
			MAKE_DOCUMENTATION_TREE_ITEM(
				'module', 'Module'
			),
			MAKE_DOCUMENTATION_TREE_ITEM(
				'step', 'Step'
			),
			MAKE_DOCUMENTATION_TREE_ITEM(
				'consensus', 'Consensus Step'
			),
			MAKE_DOCUMENTATION_TREE_ITEM(
				'local', 'Local Step'
			),
			MAKE_DOCUMENTATION_TREE_ITEM(
				'compute', 'Computations'
			),
		];
	}

	getTreeItem(element: TreeItem) {
		return element;
	}

	getChildren(item: TreeItem | undefined) {
		if (item === undefined) {
			return this.data;
		}

		const itemId = item.id;
		const object = keywords[itemId];

		return Object.keys(object).sort().map(key => {
			const tooltipTextOnHover = object[key];

			const treeItem = makeTreeItem(key, `reach.docs.${
				itemId
			}.${key}`);

			const command = `vscode.open`;
			const title = `Open ${itemId}`;
			treeItem.command = { command, title };
			treeItem.tooltip = tooltipTextOnHover;
			console.log('treeItem', treeItem);
			return treeItem;
		});
	}
}