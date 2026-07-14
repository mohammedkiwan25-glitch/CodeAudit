import React from 'react'

function OutputPanel({ output }) {
    const normalizedOutput = output && typeof output === "object"
        ? output
        : output == null
            ? null
            : { success: true, output: String(output) };

    return (
        <div className="h-full bg-base-100 flex flex-col">
            <div className="px-4 py-2 bg-base-200 border-b border-base-300 font-semibold text-sm">
                Output
            </div>
            <div className="flex-1 overflow-auto p-4">
                {normalizedOutput === null ? (
                    <p className="text-base-content/50 text-sm">Click "Run Code" to see the output here...</p>
                ) : normalizedOutput.success ? (
                    <pre className="text-sm font-mono text-success whitespace-pre-wrap">{normalizedOutput.output}</pre>
                ) : (
                    <div>
                        {normalizedOutput.output && (
                            <pre className="text-sm font-mono text-base-content whitespace-pre-wrap mb-2">
                                {normalizedOutput.output}
                            </pre>
                        )}
                        <pre className="text-sm font-mono text-error whitespace-pre-wrap">{normalizedOutput.error}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OutputPanel
