import { PlusIcon, ChevronDownIcon, XIcon } from '@heroicons/react/solid';

function QueryEditor() {
  // ... existing state and functions ...

  return (
    <div className="h-full flex bg-dark-950">
      {/* Sidebar with table structure */}
      {showStructure && (
        <div className="w-72 bg-dark-900 text-gray-100 border-r border-dark-800 overflow-y-auto">
          <div className="sticky top-0 bg-dark-900 p-4 border-b border-dark-800">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TableIcon className="h-5 w-5 mr-2" />
              Database Structure
            </h3>
          </div>
          <div className="p-4">
            {tableStructure && Object.entries(tableStructure).map(([table, columns]) => (
              <div key={table} className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <ChevronDownIcon className="h-4 w-4 text-primary-400" />
                  <h4 className="font-medium text-primary-300">{table}</h4>
                </div>
                <ul className="ml-6 space-y-1">
                  {columns.map(col => (
                    <li key={col.name} className="flex items-center text-sm text-gray-400 hover:text-white">
                      <span className="w-4 h-4 mr-2 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                      </span>
                      <span>{col.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({col.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-dark-900 border-b border-dark-800 p-3 flex items-center space-x-3">
          <button
            onClick={() => setShowStructure(!showStructure)}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            title="Toggle Structure"
          >
            <TableIcon className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-dark-700"></div>
          <button
            onClick={() => exportResults('csv')}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            title="Export as CSV"
          >
            <DownloadIcon className="h-5 w-5" />
          </button>
          <input
            type="file"
            onChange={importQuery}
            className="hidden"
            id="import-query"
          />
          <label
            htmlFor="import-query"
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg cursor-pointer transition-colors"
            title="Import Query"
          >
            <UploadIcon className="h-5 w-5" />
          </label>
        </div>

        {/* Query tabs */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <div className="bg-dark-900 border-b border-dark-800">
            <Tab.List className="flex">
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.id}
                  className={({ selected }) =>
                    `px-4 py-2.5 text-sm font-medium focus:outline-none ${
                      selected 
                        ? 'text-primary-400 border-b-2 border-primary-400 bg-dark-800' 
                        : 'text-gray-400 hover:text-gray-300 hover:bg-dark-800'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2">
                    <span>Query {index + 1}</span>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const newTabs = tabs.filter((_, i) => i !== index);
                          setTabs(newTabs);
                          if (activeTab >= index) {
                            setActiveTab(Math.max(0, activeTab - 1));
                          }
                        }}
                        className="p-0.5 hover:bg-dark-700 rounded"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </Tab>
              ))}
              <button
                onClick={addNewTab}
                className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-800"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </Tab.List>
          </div>

          <Tab.Panels className="flex-1">
            {tabs.map((tab, index) => (
              <Tab.Panel key={tab.id} className="h-full flex flex-col">
                <div className="h-1/2 border-b border-dark-800">
                  <Editor
                    height="100%"
                    defaultLanguage="sql"
                    value={tab.query}
                    onChange={(value) => {
                      const newTabs = [...tabs];
                      newTabs[index].query = value;
                      setTabs(newTabs);
                    }}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      padding: { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                <div className="flex justify-between p-3 bg-dark-900 border-b border-dark-800">
                  <input
                    type="text"
                    placeholder="Filter results..."
                    className="px-3 py-1.5 bg-dark-800 text-gray-300 rounded-lg border border-dark-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  <button
                    onClick={() => handleExecuteQuery(index)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900"
                  >
                    Execute Query
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-dark-950">
                  {tab.results && (
                    <div className="rounded-lg overflow-hidden border border-dark-800">
                      <table className="min-w-full divide-y divide-dark-800">
                        <thead className="bg-dark-900">
                          <tr>
                            {tab.results.columns?.map((column, i) => (
                              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-dark-800 divide-y divide-dark-700">
                          {filterResults(tab.results).rows?.map((row, i) => (
                            <tr key={i} className="hover:bg-dark-700">
                              {row.map((cell, j) => (
                                <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>

        {/* Query History Drawer */}
        <div className="h-40 bg-dark-900 border-t border-dark-800">
          <div className="p-3 border-b border-dark-800">
            <h3 className="text-sm font-medium text-gray-300">Query History</h3>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-40px)]">
            {queryHistory.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  item.status === 'success' 
                    ? 'bg-green-900/20 border border-green-900' 
                    : 'bg-red-900/20 border border-red-900'
                }`}
              >
                <div className="font-mono text-gray-300">{item.query}</div>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()} -{' '}
                  {item.status === 'success'
                    ? `${item.executionTime.toFixed(2)}s`
                    : item.error}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueryEditor;
