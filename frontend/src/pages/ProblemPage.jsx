import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const TEST_RESULT_PREFIX = "__CODEAUDIT_TESTS__";

const TEST_CONFIG = {
    "two-sum": {
        functionName: "twoSum",
        validator: "twoSum",
        tests: [
            { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { args: [[3, 2, 4], 6], expected: [1, 2] },
            { args: [[3, 3], 6], expected: [0, 1] },
        ],
    },
    "reverse-string": {
        functionName: "reverseString",
        validator: "mutatedArray",
        tests: [
            { args: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] },
            { args: [["H", "a", "n", "n", "a", "h"]], expected: ["h", "a", "n", "n", "a", "H"] },
        ],
    },
    "valid-palindrome": {
        functionName: "isPalindrome",
        validator: "equals",
        tests: [
            { args: ["A man, a plan, a canal: Panama"], expected: true },
            { args: ["race a car"], expected: false },
            { args: [" "], expected: true },
        ],
    },
    "maximum-subarray": {
        functionName: "maxSubArray",
        validator: "equals",
        tests: [
            { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
            { args: [[1]], expected: 1 },
            { args: [[5, 4, -1, 7, 8]], expected: 23 },
        ],
    },
    "container-with-most-water": {
        functionName: "maxArea",
        validator: "equals",
        tests: [
            { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
            { args: [[1, 1]], expected: 1 },
        ],
    },
};

function ProblemPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [currentProblemId, setCurrentProblemId] = useState("two-sum")
    const [selectedLanguage, setSelectedLanguage] = useState("javascript")
    const [code, setCode] = useState(PROBLEMS[currentProblemId].starterCode.javascript)
    const [output, setOutput] = useState(null)
    const [isRunning, setIsRunning] = useState(false)

    const currentProblem = PROBLEMS[currentProblemId]

    useEffect(() => {
        if (id && PROBLEMS[id]) {
            setCurrentProblemId(id)
            setCode(PROBLEMS[id].starterCode[selectedLanguage])
            setOutput(null)
        }
    }, [id, selectedLanguage])

    const handleLanguageChange = (e) => {
        const newLang = e.target.value
        setSelectedLanguage(newLang)
        setCode(currentProblem.starterCode[newLang])
        setOutput(null)
    }

    const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`)

    const triggerConfetti = () => {
        confetti({
            particleCount: 80,
            spread: 250,
            origin: { x: 0.2, y: 0.6 },
        });

        confetti({
            particleCount: 80,
            spread: 250,
            origin: { x: 0.8, y: 0.6 },
        });
    }

    const normalizeOutput = (output) => {
        return output
            .trim()
            .split("\n")
            .map((line) =>
                line
                    .trim()
                    // remove spaces after [ and before ]
                    .replace(/\[\s+/g, "[")
                    .replace(/\s+\]/g, "]")
                    // normalize spaces around commas to single space after comma
                    .replace(/\s*,\s*/g, ",")
            )
            .filter((line) => line.length > 0)
            .join("\n");
    }

    const checkIfTestsPassed = (actualOutput, expectedOutput) => {
        const normalizedActual = normalizeOutput(actualOutput)
        const normalizedExpected = normalizeOutput(expectedOutput)

        return normalizedActual === normalizedExpected
    }

    const replaceJavaMain = (source, mainBody) => {
        const mainIndex = source.indexOf("public static void main")
        const newMain = `public static void main(String[] args) {\n${mainBody}\n    }`

        if (mainIndex === -1) {
            const classEnd = source.lastIndexOf("}")
            if (classEnd === -1) return source
            return `${source.slice(0, classEnd)}\n    ${newMain}\n${source.slice(classEnd)}`
        }

        const bodyStart = source.indexOf("{", mainIndex)
        if (bodyStart === -1) return source

        let depth = 0
        for (let i = bodyStart; i < source.length; i++) {
            if (source[i] === "{") depth++
            if (source[i] === "}") depth--
            if (depth === 0) return `${source.slice(0, mainIndex)}${newMain}${source.slice(i + 1)}`
        }

        return source
    }

    const buildJavaMainBody = (problemId) => {
        switch (problemId) {
            case "two-sum":
                return `        int passed = 0;
        int[] r1 = twoSum(new int[]{2, 7, 11, 15}, 9);
        if (r1 != null && r1.length == 2 && r1[0] != r1[1] && new int[]{2, 7, 11, 15}[r1[0]] + new int[]{2, 7, 11, 15}[r1[1]] == 9) passed++;
        int[] r2 = twoSum(new int[]{3, 2, 4}, 6);
        if (r2 != null && r2.length == 2 && r2[0] != r2[1] && new int[]{3, 2, 4}[r2[0]] + new int[]{3, 2, 4}[r2[1]] == 6) passed++;
        int[] r3 = twoSum(new int[]{3, 3}, 6);
        if (r3 != null && r3.length == 2 && r3[0] != r3[1] && new int[]{3, 3}[r3[0]] + new int[]{3, 3}[r3[1]] == 6) passed++;
        System.out.println("${TEST_RESULT_PREFIX}" + passed + "/3");`
            case "reverse-string":
                return `        int passed = 0;
        char[] a = new char[]{'h','e','l','l','o'};
        reverseString(a);
        if (java.util.Arrays.equals(a, new char[]{'o','l','l','e','h'})) passed++;
        char[] b = new char[]{'H','a','n','n','a','h'};
        reverseString(b);
        if (java.util.Arrays.equals(b, new char[]{'h','a','n','n','a','H'})) passed++;
        System.out.println("${TEST_RESULT_PREFIX}" + passed + "/2");`
            case "valid-palindrome":
                return `        int passed = 0;
        if (isPalindrome("A man, a plan, a canal: Panama") == true) passed++;
        if (isPalindrome("race a car") == false) passed++;
        if (isPalindrome(" ") == true) passed++;
        System.out.println("${TEST_RESULT_PREFIX}" + passed + "/3");`
            case "maximum-subarray":
                return `        int passed = 0;
        if (maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4}) == 6) passed++;
        if (maxSubArray(new int[]{1}) == 1) passed++;
        if (maxSubArray(new int[]{5,4,-1,7,8}) == 23) passed++;
        System.out.println("${TEST_RESULT_PREFIX}" + passed + "/3");`
            case "container-with-most-water":
                return `        int passed = 0;
        if (maxArea(new int[]{1,8,6,2,5,4,8,3,7}) == 49) passed++;
        if (maxArea(new int[]{1,1}) == 1) passed++;
        System.out.println("${TEST_RESULT_PREFIX}" + passed + "/2");`
            default:
                return ""
        }
    }

    const buildTestableCode = (language, source, problemId) => {
        const config = TEST_CONFIG[problemId]
        if (!config) return source

        if (language === "javascript") {
            return `${source}

const __codeAuditTests = ${JSON.stringify(config.tests)};
const __deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const __clone = (value) => JSON.parse(JSON.stringify(value));
let __passed = 0;
for (const __test of __codeAuditTests) {
  try {
    if (${JSON.stringify(config.validator)} === "mutatedArray") {
      const __input = __clone(__test.args[0]);
      ${config.functionName}(__input);
      if (__deepEqual(__input, __test.expected)) __passed++;
    } else if (${JSON.stringify(config.validator)} === "twoSum") {
      const __result = ${config.functionName}(...__clone(__test.args));
      const __nums = __test.args[0];
      const __target = __test.args[1];
      if (Array.isArray(__result) && __result.length === 2 && __result[0] !== __result[1] && __nums[__result[0]] + __nums[__result[1]] === __target) __passed++;
    } else {
      const __result = ${config.functionName}(...__clone(__test.args));
      if (__deepEqual(__result, __test.expected)) __passed++;
    }
  } catch {}
}
console.log("${TEST_RESULT_PREFIX}" + __passed + "/" + __codeAuditTests.length);`
        }

        if (language === "python") {
            return `${source}

import copy as __codeaudit_copy
__codeAuditTests = ${JSON.stringify(config.tests)}
__passed = 0
for __test in __codeAuditTests:
    try:
        if ${JSON.stringify(config.validator)} == "mutatedArray":
            __input = __codeaudit_copy.deepcopy(__test["args"][0])
            ${config.functionName}(__input)
            if __input == __test["expected"]:
                __passed += 1
        elif ${JSON.stringify(config.validator)} == "twoSum":
            __args = __codeaudit_copy.deepcopy(__test["args"])
            __result = ${config.functionName}(*__args)
            __nums = __test["args"][0]
            __target = __test["args"][1]
            if isinstance(__result, list) and len(__result) == 2 and __result[0] != __result[1] and __nums[__result[0]] + __nums[__result[1]] == __target:
                __passed += 1
        else:
            __result = ${config.functionName}(*__codeaudit_copy.deepcopy(__test["args"]))
            if __result == __test["expected"]:
                __passed += 1
    except Exception:
        pass
print("${TEST_RESULT_PREFIX}" + str(__passed) + "/" + str(len(__codeAuditTests)))`
        }

        if (language === "java") return replaceJavaMain(source, buildJavaMainBody(problemId))

        return source
    }

    const getTestSummary = (compilerOutput) => {
        const markerLine = compilerOutput
            ?.split("\n")
            .map((line) => line.trim())
            .find((line) => line.startsWith(TEST_RESULT_PREFIX))

        if (!markerLine) return null

        const [passed, total] = markerLine.replace(TEST_RESULT_PREFIX, "").split("/").map(Number)
        return { passed, total, allPassed: passed === total }
    }

    const LEGACY_EXACT_OUTPUT_RUNNER = async () => {
        setIsRunning(true)
        setOutput(null)

        const result = await executeCode(selectedLanguage, code)
        setOutput(result)
        setIsRunning(false)

        if (result.success) {
            triggerConfetti()
            const expectedOutput = currentProblem.expectedOutput[selectedLanguage]
            const testPassed = checkIfTestsPassed(result.output, expectedOutput)
            if (testPassed) {
                toast.success("All tests passed! 🎉")
            } else {
                toast.error("Tests failed. Try again! 😢")
            }
        } else {
            toast.error("Code execution failed! 😢")
        }
    }

    const handleRunCodeWithTests = async () => {
        setIsRunning(true)
        setOutput(null)

        const testableCode = buildTestableCode(selectedLanguage, code, currentProblemId)
        const result = await executeCode(selectedLanguage, testableCode)
        setOutput(result)
        setIsRunning(false)

        if (!result.success) {
            toast.error("Code execution failed")
            return
        }

        const testSummary = getTestSummary(result.output)

        if (testSummary?.allPassed) {
            triggerConfetti()
            toast.success(`All tests passed! ${testSummary.passed}/${testSummary.total}`)
            return
        }

        const failedMessage = testSummary
            ? `Tests failed: ${testSummary.passed}/${testSummary.total} passed`
            : "Tests failed. Keep the required function name/signature."
        toast.error(failedMessage)
    }

    return (
        <div className='h-screen w-screen bg-base-100 flex flex-col overflow-hidden'>
            <Navbar />

            {/* DESKTOP layout - panels */}
            <div className='flex-1 hidden md:block'>
                <PanelGroup direction='horizontal'>
                    <Panel defaultSize={40} minSize={30}>
                        <ProblemDescription
                            problem={currentProblem}
                            currentProblemId={currentProblemId}
                            onProblemChange={handleProblemChange}
                            allProblems={Object.values(PROBLEMS)}
                        />
                    </Panel>

                    <PanelResizeHandle className='w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize' />

                    <Panel defaultSize={60} minSize={30}>
                        <PanelGroup direction='vertical'>
                            <Panel defaultSize={70} minSize={30}>
                                <CodeEditorPanel
                                    selectedLanguage={selectedLanguage}
                                    code={code}
                                    isRunning={isRunning}
                                    onLanguageChange={handleLanguageChange}
                                    onCodeChange={setCode}
                                    onRunCode={handleRunCodeWithTests}
                                />
                            </Panel>
                            <PanelResizeHandle className='h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize' />
                            <Panel defaultSize={30} minSize={30}>
                                <OutputPanel output={output} />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>

            {/* MOBILE layout - stacked */}
            <div className='flex-1 flex flex-col overflow-y-auto md:hidden'>
                <div className='min-h-fit'>
                    <ProblemDescription
                        problem={currentProblem}
                        currentProblemId={currentProblemId}
                        onProblemChange={handleProblemChange}
                        allProblems={Object.values(PROBLEMS)}
                    />
                </div>
                <div className='h-[520px] shrink-0'>
                    <CodeEditorPanel
                        selectedLanguage={selectedLanguage}
                        code={code}
                        isRunning={isRunning}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={setCode}
                        onRunCode={handleRunCodeWithTests}
                    />
                </div>
                <div className='h-[260px] shrink-0'>
                    <OutputPanel output={output} />
                </div>
            </div>
        </div>
    )
}

export default ProblemPage
