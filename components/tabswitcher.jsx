'use client'

import React from 'react'

const styles = {
    button: {
        appearance: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
    },
    selected: {
        backgroundColor: '#ba75'
    },
    normal: {
        backgroundColor: '#222'
    }
}

export default function TabSwitcher({
    tabIds,
    getHeader,
    renderContent,
}) {
    const [selectedId, setSelectedId] = React.useState(tabIds[0])
    return (
        <>
            {
                tabIds.map((tabId) => {
                    const btnStyle = tabId === selectedId ? styles.selected : styles.normal
                    return (
                        <button
                        key={tabId}
                        style={{...styles.button, ...btnStyle}}
                        onClick={() => setSelectedId(tabId)}
                        >
                            {getHeader(tabId)}
                        </button>
                    )
                })
            }
            <hr />
            <div key={selectedId}>
                <h3>{getHeader(selectedId)}</h3>
                {renderContent(selectedId)}
            </div>
        </>
    )
}