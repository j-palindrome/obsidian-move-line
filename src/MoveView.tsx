import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'
import ObsidianAPI from './api'

export default function MoveView({
  paths,
  path,
  line,
  api,
}: {
  paths: string[]
  path: string
  line: number
  api: ObsidianAPI
}) {
  const [search, setSearch] = useState('')
  const activePath = search.includes('#')
    ? paths.find((path) => search.includes(path))
    : undefined

  const searchExp = new RegExp(
    (activePath ? search.slice(search.lastIndexOf('#') + 1) : search)
      .split('')
      .map((char) => _.escapeRegExp(char) + '.*')
      .join(''),
    'i'
  )

  const [headings, setHeadings] = useState<{ line: string; number: number }[]>(
    []
  )

  const updateHeadings = async () => {
    setHeadings(await api.getHeadings(search.slice(0, search.indexOf('#'))))
  }

  useEffect(() => {
    if (activePath) {
      updateHeadings()
    }
  }, [activePath])

  const lowerSearch = search.toLowerCase()
  const activePaths = _.sortBy(
    paths.filter((path) => searchExp && searchExp.test(path)),
    (path) => {
      let testPath = path.toLowerCase()
      let consecutiveChars = 0
      let lastWasConsecutive = 0
      for (let char of lowerSearch) {
        const pathIndex = testPath.indexOf(char)
        if (pathIndex === 0) {
          lastWasConsecutive += 1
          consecutiveChars += lastWasConsecutive
        } else lastWasConsecutive = 0
        testPath = testPath.slice(pathIndex + 1)
      }

      return consecutiveChars * -1
    }
  )

  const activeHeadings = headings.filter((heading) =>
    searchExp.test(heading.line)
  )

  const inputFrame = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputFrame.current?.focus()
  }, [])

  return (
    <div className='prompt'>
      <div className='prompt-input-container'>
        <input
          ref={inputFrame}
          className='prompt-input'
          type='text'
          value={search}
          placeholder='Find a file to move the line to...'
          onKeyDown={(ev) => {
            if (ev.key === '#' && !activePath) {
              ev.preventDefault()
              setSearch(api.getActiveFile()?.path + '#')
            } else if (ev.key === 'Enter') {
              if (activePath) {
                const activeHeading = activeHeadings[0]
                api.moveLine(path, line, activePath, activeHeading.number)
              } else {
                const otherPath = activePaths[0]
                api.moveLine(path, line, otherPath, 0)
              }
            }
          }}
          onChange={(ev) => setSearch(ev.target.value)}
        ></input>
      </div>

      <div className='prompt-results'>
        {!activePath
          ? activePaths.map((otherPath) => (
              <div className='suggestion-item mod-complex flex' key={otherPath}>
                <div
                  className='grow hover:underline'
                  onClick={() => api.moveLine(path, line, otherPath, 0)}
                >
                  {otherPath}
                </div>
                <button onClick={() => setSearch(otherPath + '#')}>#</button>
              </div>
            ))
          : activeHeadings.map((heading) => (
              <div
                key={heading.number}
                className='suggestion-item mod-complex flex'
                onClick={() =>
                  api.moveLine(path, line, activePath, heading.number)
                }
              >
                {heading.line}
              </div>
            ))}
      </div>
    </div>
  )
}
