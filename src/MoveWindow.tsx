import { Modal } from 'obsidian'
import { Root, createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import MoveView from './MoveView'
import ObsidianAPI from './api'

export default class MoveWindow extends Modal {
	path: string
	line: number
	root: Root

	constructor() {
		super(app)
		const line = app.workspace.activeEditor?.editor?.getCursor().line
		const path = app.workspace.getActiveFile()?.path
		invariant(line !== undefined)
		invariant(path !== undefined)
		this.line = line
		this.path = path
	}

	onOpen(): void {
		this.root = createRoot(this.contentEl)
		this.root.render(
			<MoveView
				paths={app.vault.getMarkdownFiles().map((file) => file.path)}
				path={this.path}
				line={this.line}
				api={new ObsidianAPI(() => this.close())}
			/>
		)
	}

	onClose(): void {
		this.root.unmount()
	}
}
