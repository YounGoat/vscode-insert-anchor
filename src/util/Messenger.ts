/**
 * 在工作台中显示不同类别的提示信息。
 * @author jiangjing.shanghai@bytedance.com
 * @create 2021-09-01
 */

import * as vscode from 'vscode';

class Messenger {
	private statusBarItem: vscode.StatusBarItem;
	private timer?: NodeJS.Timeout;

	constructor(command: string) {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		this.statusBarItem.command = command;
	}

	private tip(message: string) {
		this.statusBarItem.text = message;
		this.statusBarItem.show();
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(() => {
			this.statusBarItem.hide();
		}, 3000);
	}

	error(message: string) {
		// vscode.window.showErrorMessage(message);
		this.tip('$(error) ' + message);
	}
	
	info(message: string) {
		// vscode.window.showInformationMessage(message);
		this.tip('$(info) ' + message);
	}

	warn(message: string) {
		// vscode.window.showWarningMessage(message);

		/**
		 * 可以在特定属性中使用 "$(<ICON_NAME>)" 的形式插入图标。
		 * @see https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
		 */
		this.tip('$(warning) ' + message);
	}
}

export default Messenger;