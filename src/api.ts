import _ from 'lodash'
import { Component, Notice, TFile } from 'obsidian'
import { getAPI } from 'obsidian-dataview'
import invariant from 'tiny-invariant'

export default class ObsidianAPI extends Component {
	closeWindow: () => void

	constructor(closeWindow: () => void) {
		super()
		this.closeWindow = closeWindow
	}

	async moveLine(
		path: string,
		line: number,
		otherPath: string,
		otherLine: number
	) {
		const thisFile = app.vault.getAbstractFileByPath(path)
		const otherFile = app.vault.getAbstractFileByPath(otherPath)

		invariant(thisFile instanceof TFile && otherFile instanceof TFile)

		const lines = (await app.vault.read(thisFile)).split('\n')
		const thisLine = lines.splice(line, 1)[0]
		await app.vault.modify(thisFile, lines.join('\n'))

		const otherLines = (await app.vault.read(otherFile)).split('\n')
		otherLines.splice(otherLine === 0 ? 0 : otherLine + 1, 0, thisLine)

		await app.vault.modify(otherFile, otherLines.join('\n'))

		new Notice(`Line moved to "${otherPath}"`)
		this.closeWindow()
	}

	async getHeadings(path: string) {
		const filePath = app.vault.getAbstractFileByPath(path)
		invariant(filePath instanceof TFile)
		const text = await app.vault.read(filePath)
		const headings = text
			.split('\n')
			.map((line, i) => ({ line, number: i }))
			.filter((heading) => new RegExp('^#+ ').test(heading.line))
		return headings
	}

	getActiveFile() {
		return app.workspace.getActiveFile()
	}
}
