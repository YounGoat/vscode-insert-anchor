// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { EIDRM } from 'constants';
import * as vscode from 'vscode';
import fetch from 'node-fetch';
import * as httputil from './util/http';
import Messenger from './util/Messenger';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let messenger: Messenger = new Messenger('vscode-insert-anchor.generateAnchor');

	/**
	 * 命令：将剪贴板中的 URL 粘贴到编辑器中。
	 */
	const RE_URL = /^(http|https):\/\/.+$/;
	let disposable = vscode.commands.registerCommand('vscode-insert-anchor.generateAnchor', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			messenger.warn('No text editor is actived now.');
			return;
		}

		let position = editor.selection.active;
		let urlname;

		/**
		 * 优先匹配选中的文本。
		 */
		if (!urlname || !RE_URL.test(urlname)) {
			urlname = editor.document.getText(editor.selection);
		}

		/**
		 * 若无文本选中，或选中文本并非 URL，则尝试读取剪贴板。
		 */
		if (!urlname || !RE_URL.test(urlname)) {
			urlname = await vscode.env.clipboard.readText();
		}

		/**
		 * 仍需最后校验 URL 的合法性。
		 */
		if (!urlname || !RE_URL.test(urlname)) {
			messenger.warn('No URL found in selection or clipboard.');
			return;
		}

		let alt;
		RETRIEVE_ALT: {
			messenger.info(`Fetching ${urlname} ...`);
			let response = await fetch(urlname).catch(ex => {
				messenger.error(ex.message);
				return null;
			});

			/**
			 * 检查响应是否符合预期。
			 */
			if (response === null) {
				messenger.error(`Failed to fetch ${urlname}`);
				break RETRIEVE_ALT;
			}
			if (response.status !== 200) {
				messenger.error(`Status 200 expected but ${response.status} found.`);
				break RETRIEVE_ALT;
			}
			let parsed = httputil.parseContentType(response.headers.get('content-type'));
			if (parsed?.mime !== 'text/html') {
				messenger.warn(`Content type "text/html" expected but "${parsed?.mime}" found.`);
				break RETRIEVE_ALT;
			}

			/**
			 * 尝试从 HTML <H1/> <TITLE/> 等标签中获取标题。
			 */
			let html = await response.text();
			if (!alt) {
				let matches = html.match(/<title>(.*?)<\/title>/i);
				if (matches) {
					alt = matches[1];
				}
			}
			if (!alt) {
				let matches = html.match(/<h1>(.*?)<\/h1>/i);
				if (matches) {
					alt = matches[1];
				}
			}
		}

		let text = alt ? `[${alt}](${urlname})` : urlname;

		editor.edit(editBuilder => {
			if (editor?.selection) {
				editBuilder.delete(editor.selection);
			}
			editBuilder.insert(position, text);
		});

		if (alt) {
			messenger.info('Anchor generated.');
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
