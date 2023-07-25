import { Notice, Plugin } from 'obsidian'
import { getAPI } from 'obsidian-dataview'
import MoveWindow from './MoveWindow'

type MoveSettings = {}
const DEFAULT_SETTINGS: MoveSettings = {}
export const MOVE_VIEW = 'move'

export default class MoveLine extends Plugin {
	settings: MoveSettings

	async onload() {
		const dv = getAPI()
		if (!dv) {
			new Notice('Please install Dataview to use this plugin')
			return
		}

		this.addCommand({
			editorCallback: () => {
				new MoveWindow().open()
			},
			id: 'move-line',
			name: 'Move Line',
		})

		await this.loadSettings()
	}

	async loadSettings() {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}

	async getDataView() {
		let dataViewPlugin = getAPI(this.app)
		if (!dataViewPlugin) {
			// wait for Dataview plugin to load (usually <100ms)
			dataViewPlugin = await new Promise((resolve) => {
				setTimeout(() => resolve(getAPI(this.app)), 350)
			})
			if (!dataViewPlugin) {
				new Notice(
					'Please enable the DataView plugin for Link Tree to work.'
				)
				this.app.workspace.detachLeavesOfType(MOVE_VIEW)
				throw new Error('no Dataview')
			}
		}
	}

	async activateView() {
		await this.getDataView()
		const leaf =
			this.app.workspace.getLeavesOfType(MOVE_VIEW)?.[0] ??
			this.app.workspace.getRightLeaf(false)

		await leaf.setViewState({
			type: MOVE_VIEW,
			active: true,
		})

		this.app.workspace.revealLeaf(leaf)
	}
}
